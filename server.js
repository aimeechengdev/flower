//detector
var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});
var convnetjs = require("convnetjs");

  var classes_txt = ['orchid', 'rose', 'poppy', 'sunflower', 'tulip'];
  var image_dimension = 32;
  var image_channels = 3;
  var random_flip = true;
  var random_position = true;
var responseFlag = false;
var predictedName;
  // var layer_defs, net, trainer;
  // layer_defs = [];
  // layer_defs.push({type:'input', out_sx:32, out_sy:32, out_depth:3});
  // layer_defs.push({type:'conv', sx:5, filters:16, stride:1, pad:2, activation:'relu'});
  // layer_defs.push({type:'pool', sx:2, stride:2});
  // layer_defs.push({type:'conv', sx:5, filters:20, stride:1, pad:2, activation:'relu'});
  // layer_defs.push({type:'pool', sx:2, stride:2});
  // layer_defs.push({type:'conv', sx:5, filters:20, stride:1, pad:2, activation:'relu'});
  // layer_defs.push({type:'pool', sx:2, stride:2});
  // layer_defs.push({type:'softmax', num_classes:5});
  // net = new convnetjs.Net();
  // net.makeLayers(layer_defs);

var net = new convnetjs.Net();
fs.readFile('./net.json', handleFile)
function handleFile(err, data) {
    if (err) throw err
    var obj = JSON.parse(data)
    net.fromJSON(obj);
    // You can now play with your datas
}

var img = new convnetjs.Vol(image_dimension,image_dimension,image_channels,0.0);

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
        .toBuffer('ppm', function(err, buffer){//13 byte hearder then RGB, so 32x32+13=3085
          // var tmp2, tmp3;
          // for(var i =0; i <100; i++){
          //   tmp2= buffer[i];
          //   tmp3= buffer[buffer.length - 1 -i];
          //   console.log(i + ' ---- '+tmp2+' --- '+ tmp3);
          // }
          // var tmp1 = buffer[0];
          // var tmp = buffer.slice(0,20);
          console.log(buffer.length);
          if (!err){
            console.log('toBuffer done!');
            var W = image_dimension*image_dimension;
            var j=0;
            for(var dc=0;dc<3;dc++) {
              var i=0;
              for(var xc=0;xc<image_dimension;xc++) {
                for(var yc=0;yc<image_dimension;yc++) {
                  var ix = 13 + i * 3 + dc;
                  img.set(yc,xc,dc,buffer[ix]/255.0-0.5);
                  i++;
                }//yc
              }//xc
            }//dc
            net.forward(img);
            var prediction = net.getPrediction();
            console.log(prediction);
            predictedName =  classes_txt[prediction];
            responseFlag = true;
          }//err
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
  while(!responseFlag){
    
  }
  responseFlag = false;
  res.json({'name': predictedName,'originalName': originalName});
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Flower server listening at", addr.address + ":" + addr.port);
});




