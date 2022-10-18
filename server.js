const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
require('dotenv').config();


//회원 인증
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session());


app.get('/login', checkIn,(req, res) => {
  res.render('login.ejs', {user : req.user});
})

app.post('/login', passport.authenticate('local', {
  failureRedirect : '/fail'
}),(req, res) => {
  res.redirect('/');
})

app.get('/mypage', checkLogin, (req, res) =>{
  console.log(req.user);
  res.render('mypage.ejs', {user : req.user});
})

app.get('/', checkIn,(req, res) => {
  res.render('index.ejs', {user : req.user});
  console.log(req.user);
});

function checkIn(req, res, next){
    next();
}

app.get('/nav.ejs', checkIn, (req, res) => {
  res.render('nav.ejs', {user : req.user});
})

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
  //console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
    if (에러) return done(에러)

    if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
    if (입력한비번 == 결과.pw) {
      return done(null, 결과)
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));

passport.serializeUser(function(user, done){
  done(null, user.id);
});
passport.deserializeUser(function(id, done){
  db.collection('login').findOne({id : id}, (err, result) => {
    done(null, result)
  })
})

app.get('/fail', function(req, res){
  res.render('fail.ejs');
})

app.post('/register', function(req, res){
  db.collection('login').findOne({id: req.body.id}, function(err, result){
    if(req.body.id == result?.id){
      res.redirect('/fail');
    } else {
      db.collection('login').insertOne({id : req.body.id, pw : req.body.pw}, function(err, result){
        res.redirect('/');
      });
    }
  });
})


var db;
MongoClient.connect(process.env.DB_URL, { useUnifiedTopology: true }, function (err, client) {

  if (err) return console.log(err)
  db = client.db('todoapp');


  // list 게시물 추가
  app.post('/add', (req, res) => {
    db.collection('counter').findOne({ name: '게시물갯수' }, (err, result) => {
      console.log(result.totalPost);
      var 총게시물갯수 = result.totalPost;

      db.collection('post').insertOne({ 게시물번호: 총게시물갯수 + 1, 제목: req.body.title, 날짜: req.body.date, 메모: req.body.memo }, () => {
        console.log('저장완료');

        db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, function (err, result) {
          if (err) return console.log(err);
        }) // $set : 변경, $inc : 증가, 
      });
    });
    setTimeout(function(){
      res.redirect('/list');
      // console.log(`req : ${req.body}`);
    }, 100) // 서버에 post요청을 보내고 난 후 바로 리다이랙트 하면 추가된 데이터가 불러와지지 않음. 따라서 최소 6ms의 시간 간격을 두고 리다이랙트를 한다. 혹시 모를 상황을 대비하여 넉넉하게 10ms의 간격을 두고 리다이랙트를 한다.
  });


  app.listen(process.env.PORT, function () {
    console.log('listening on 8080')
  });

});





app.get('/write', checkLogin,(req, res) => {
  res.render('write.ejs', {user : req.user});
});

app.get('/index.css', (req, res) => {
  res.sendFile(__dirname + '/public/index.css');
});
app.get('/detail/index.css', (req, res) => {
  res.sendFile(__dirname + '/public/index.css');
});

app.get('/write.css', checkLogin,(req, res) => {
  res.sendFile(__dirname + '/public/write.css');
});

app.get('/list', checkLogin,(req, res) => {
  db.collection('post').find().toArray((err, result) => {
    // console.log(`result : ${result}`);
    res.render('list.ejs', { posts: result, user : req.user });
  });
});

app.get('/search', checkLogin,(req, res) => {
  console.log(req.query.value);
  var 검색조건 = [
    {
      $search: {
        index: 'titleSearch',
        text: {
          query: req.query.value,
          path: '제목'  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
        }
      }
    },
    //{ $sort : {게시물번호 : -1}}, // 게시물 번호 역순
    //{ $limit : 10}, // 상위 10개
    //{$project : {제목 : 1, 게시물번호 : 0, score : {$meta:'searchScore'}}} // 1 : 가져옴. 0 : 안가져옴. 
  ]
  db.collection('post').aggregate(검색조건).toArray((err, result) => {
    console.log(result);
    res.render('search.ejs', {posts : result});
  })

})


// 상세페이지
app.get('/detail/:id', checkLogin,function(req, res){
  db.collection('post').findOne({게시물번호 : parseInt(req.params.id)}, function(err, result){
    if(result){
      res.render('detail.ejs', {data : result, user : req.user});
    } else {
      res.render('detailErr.ejs', {user : req.user})
    }
    console.log(result);

  })
})

app.get('/edit/:id', checkLogin,function(req, res){
  db.collection('post').findOne({게시물번호 : parseInt(req.params.id)}, function(err, result){
    if(result){
      res.render('edit.ejs', {data : result });
    } else {
      res.render('detailErr.ejs', {user : req.user})
    }
  })
})

app.put('/edit', function(req, res){
  db.collection('post').updateMany({게시물번호 : parseInt(req.body.id) }, {$set : {제목 : req.body.title, 날짜 : req.body.date, 메모 : req.body.memo}}, function(err, result){
    console.log('수정완료');
    res.redirect('/list');
  })
})

app.put('/detail', function(req, res){
  console.log(req.body.memo);
  db.collection('post').updateOne({게시물번호 : parseInt(req.body.id)}, {$set : {메모 : req.body.memo}}, function(err, result){
    console.log('메모추가 완료');
    res.redirect('/list');
  })
})


// list 게시물 삭제
app.delete('/delete', (req, res) => {
  console.log(req.body);
  req.body.게시물번호 = parseInt(req.body.게시물번호);
  console.log(req.body.게시물번호);
  db.collection('post').deleteOne(req.body , function(err, result){
    console.log('삭제완료');
    res.status(200).send({message : '요청 성공'});
  });
});


function checkLogin(req, res, next){
  if(req.user){
    next();
  } else {
    res.redirect('/login')
  }
}