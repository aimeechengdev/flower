//detector
var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});

var detect = function(path){
  var fileName = path.split('/')[1];
  var resizePath = 'output/' + fileName;
  var width, height;
  console.log("in detect, path is "+path);
  gm(path)
  .size(function (err, size) {
    if (!err){
      console.log('orininal size: ' + size.width + ' X ' + size.height + ' pixels');
      var x, y, cropSize;
      if(size.width>size.height){
        cropSize = size.height;
        x = Math.floor((size.width - cropSize)/2);
        y = 0;
      }else{
        cropSize = size.width;
        y = Math.floor((size.height - cropSize)/2);
        x = 0;
      }
      gm(path)
      .crop(cropSize, cropSize, x, y)
      .resize(32, 32)
      .write(resizePath, function (err) {
        if (!err) console.log(' resize done');
        gm(resizePath)
        .toBuffer('ppm', function(err, buffer){
          // var tmp2, tmp3;
          // for(var i =0; i <100; i++){
          //   tmp2= buffer[i];
          //   tmp3= buffer[buffer.length - 1 -i];
          //   console.log(i + ' ---- '+tmp2+' --- '+ tmp3);
          // }
          // var tmp1 = buffer[0];
          // var tmp = buffer.slice(0,20);
           console.log(buffer.length);
          if (!err) return console.log('toBuffer done!');
          console.log('done!');
        })//toBuffer
      });//write
    }//err
  })//size
};//detect

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
});
var Flower = mongoose.model('Flower', schema);
var flower = new Flower();

// Flower.find(function (err, flowers) {
//   if (err) return console.error(err);
//   console.log(flowers)
// });

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




