//detector
var fs = require('fs');

var detect = function(path){
  console.log("in detect, path is "+path);
  fs.readFile(path, function (err, data) {
  if (err) throw err;
  console.log("in detect, data is "+data);
});
};

//database
var mongoose = require('mongoose');
mongoose.connect('mongodb://aimeechengdev:Pepper0620@ds031942.mongolab.com:31942/flower');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  // yay!
});
var schema = mongoose.Schema({
    name: String,
    originalName: String,
    path: String
})
var Flower = mongoose.model('Flower', schema)
var flower = new Flower();

Flower.find(function (err, flowers) {
  if (err) return console.error(err);
  console.log(flowers)
})

//server
var http = require('http');
var path = require('path');
var express = require('express');
var app = express();
var server = http.createServer(app);
app.use(express.static(path.resolve(__dirname, 'client')));
app.use(express.bodyParser({uploadDir:'./uploads', keepExtensions: true}));

app.post('/flower',function(req,res){
  console.log("post called");
  var originalName = req.files.file.name;
  var path = req.files.file.path;
  console.log("OriginalFilename = "+originalName+", path is "+path);
  detect(path);
  flower.name = 'Rose';
  flower.originalName = originalName;
  flower.path = path;
  flower.save(function (err, fluffy) {
    if (err) return console.error(err);
  });
  res.json({'name':'Anemone','originalName':originalName});
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Flower server listening at", addr.address + ":" + addr.port);
});




