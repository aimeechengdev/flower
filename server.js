//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');
//var db = require('./db');
var mongoose = require('mongoose');
mongoose.connect('mongodb://aimeechengdev:Pepper0620@ds031942.mongolab.com:31942/flower');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  // yay!
});
var kittySchema = mongoose.Schema({
    name: String
})
var Kitten = mongoose.model('Kitten', kittySchema)
var silence = new Kitten({ name: 'Silence' })
console.log(silence.name) // 'Silence'
var fluffy = new Kitten({ name: 'fluffy' });
fluffy.save(function (err, fluffy) {
  if (err) return console.error(err);
//  fluffy.speak();
});
Kitten.find(function (err, kittens) {
  if (err) return console.error(err);
  console.log(kittens)
})









var express = require('express');
//var bodyParser     =        require("body-parser");
//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var app = express();
var server = http.createServer(app);
app.use(express.static(path.resolve(__dirname, 'client')));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.bodyParser({uploadDir:'./uploads'}));
app.post('/',function(req,res){
  console.log("post called");
    var originalFilename=req.files.file.originalFilename;
  var path=req.files.file.path;
  console.log("OriginalFilename = "+originalFilename+", path is "+path);
  res.end("yes");
});
app.get('/car',function(req,res){
  res.json({'car':'cara','weight':30});
});
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
