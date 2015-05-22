//detector
var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});

var detect = function(path){
  var fileName = path.split('/')[1];
  var resizePath = 'output/resize/' + fileName;
  var blurPath = 'output/blur/' + fileName;
  var edgePath = 'output/edge/' + fileName;
  var overlayPath = 'output/overlay/' + fileName;
  var colorHPath = 'output/colorH/' + fileName;
  var colorLPath = 'output/colorL/' + fileName;
  var colorSPath = 'output/colorS/' + fileName;
  console.log("in detect, path is "+path);
  gm(path)
  .size(function (err, size) {
  if (!err)
    console.log(size.width + ' X ' + size.height + ' pixels');
  })
  .resize(240, 240)
  .noProfile()
  .write(resizePath, function (err) {
    if (!err) console.log(' resize done');
    gm(resizePath)
    .blur(8, 4)
    .stroke("red", 7)
    .fill("#ffffffbb")
    .drawLine(20, 10, 50, 40)
    .fill("#2c2")
    .stroke("blue", 1)
    .drawRectangle(40, 10, 50, 20)
    .drawRectangle(60, 10, 70, 20, 3)
    .drawArc(80, 10, 90, 20, 0, 180)
    .drawEllipse(105, 15, 3, 5)
    .drawCircle(125, 15, 120, 15)
    .drawPolyline([140, 10], [143, 13], [145, 13], [147, 15], [145, 17], [143, 19])
    .drawPolygon([160, 10], [163, 13], [165, 13], [167, 15], [165, 17], [163, 19])
    .drawBezier([180, 10], [183, 13], [185, 13], [187, 15], [185, 17], [183, 19])
    .fontSize(68)
    .stroke("#efe", 2)
    .fill("#888")
    .drawText(-20, 98, "graphics magick")
    .write(overlayPath, function(err){
      if (err) return console.dir(arguments)
      console.log(this.outname + ' created  :: ' + arguments[3])
    }); 
    gm(resizePath)
    .blur(7, 3)
    .write(blurPath, function (err) {
      if (!err) console.log('smooth done');
      gm(blurPath)
      .edge(3)
      .write(edgePath, function (err) {
        if (!err) console.log('edge done');
      });
    });
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




