const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const MongoClient = require('mongodb').MongoClient;

var db;
MongoClient.connect('mongodb+srv://rlaqorrb:rlatpdms0911@cluster0.hrzuyuj.mongodb.net/?retryWrites=true&w=majority', { useUnifiedTopology: true }, function (에러, client) {

  if (에러) return console.log(에러)
  db = client.db('todoapp');

  db.collection('post').insertOne({ 이름: 'John', _id : 100}, function (에러, 결과) {
    console.log('저장완료');
  });


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

app.post('/add', (req, res) => {
  res.redirect('/write');
  console.log(req.body);
})