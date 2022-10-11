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
    res.redirect('/write');
    console.log(req.body.title);
    console.log(req.body.date);
    db.collection('post').insertOne({제목 : req.body.title, 날짜 : req.body.date})
  })


  app.listen(8080, function () {
    console.log('listening on 8080')
  });

})



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

app.get('/write', (req, res) => {
  res.sendFile(__dirname + '/write.html');
})

app.get('/index.css', (req, res) =>{
  res.sendFile(__dirname + '/index.css');
})

app.get('/write.css', (req, res) => {
  res.sendFile(__dirname + '/write.css');
})

app.get('/list', (req, res) => {
  db.collection('post').find().toArray((err, res) => {
    console.log(res);
    res.render('list.ejs', {posts : res});
  });
})