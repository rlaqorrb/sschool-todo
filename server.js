const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');

var db;
MongoClient.connect('mongodb+srv://rlaqorrb:rlatpdms0911@cluster0.hrzuyuj.mongodb.net/?retryWrites=true&w=majority', { useUnifiedTopology: true }, function (err, client) {

  if (err) return console.log(err)
  db = client.db('todoapp');
  /* 
    db.collection('post').insertOne({ 이름: 'John', _id : 100}, function (err, res) {
      console.log('저장완료');
    }); */
  app.post('/add', (req, res) => {
    db.collection('counter').findOne({ name: '게시물갯수' }, (err, result) => {
      console.log(result.totalPost);
      var 총게시물갯수 = result.totalPost;

      db.collection('post').insertOne({ 게시물번호: 총게시물갯수 + 1, 제목: req.body.title, 날짜: req.body.date }, () => {
        console.log('저장완료');

        db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, function (err, result) {
          if (err) return console.log(err);
        }) // $set : 변경, $inc : 증가, 
      });
    });
    setTimeout(function(){
      res.redirect('/list');
      // console.log(`req : ${req.body}`);
    }, 10) // 서버에 post요청을 보내고 난 후 바로 리다이랙트 하면 추가된 데이터가 불러와지지 않음. 따라서 최소 6ms의 시간 간격을 두고 리다이랙트를 한다. 혹시 모를 상황을 대비하여 넉넉하게 10ms의 간격을 두고 리다이랙트를 한다.
  });


  app.listen(8080, function () {
    console.log('listening on 8080')
  });

});



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/write', (req, res) => {
  res.sendFile(__dirname + '/write.html');
});

app.get('/index.css', (req, res) => {
  res.sendFile(__dirname + '/index.css');
});

app.get('/write.css', (req, res) => {
  res.sendFile(__dirname + '/write.css');
});

app.get('/list', (req, res) => {
  db.collection('post').find().toArray((err, result) => {
    // console.log(`result : ${result}`);
    res.render('list.ejs', { posts: result });
  });
});

app.delete('/delete', (req, res) => {
  console.log(req.body);
  req.body.게시물번호 = parseInt(req.body.게시물번호);
  console.log(req.body.게시물번호);
  db.collection('post').deleteOne(req.body , function(err, result){
    console.log('삭제완료');
  });
});

