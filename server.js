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
var prediction;
var net = new convnetjs.Net();
var trainer = new convnetjs.SGDTrainer(net, {learning_rate:0.0001, momentum:0.9, batch_size:1, l2_decay:0.00001});
var imgVol = new convnetjs.Vol(image_dimension,image_dimension,image_channels,0.0);
var path;
//server
var http = require('http');
var pathLib = require('path');
var express = require('express');
var app = express();
var server = http.createServer(app);
var timeOut;
var fileSavedFlag = false;
//database
var mongoose = require('mongoose');
mongoose.connect('mongodb://aimeechengdev:Pepper0620@ds031942.mongolab.com:31942/flower');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("mongoLab is connected.");
});
var flowerSchema = mongoose.Schema({
  name: String,
  prediction: Number,
  path: String
});
var Flower = mongoose.model('Flower', flowerSchema);

var netWorkSchema = mongoose.Schema({
  net: String,
  updated: { type: Date, default: Date.now }
});
var Network = mongoose.model('Network', netWorkSchema);

Network.findOne({}, null, {sort: {updated: -1}}, function(err, docs) { 
  var obj;
  if(docs === null){
    fs.readFile('./net.json', handleFile)
    function handleFile(err, data) {
        if (err) throw err
        var obj = JSON.parse(data)
        net.fromJSON(obj);
        console.log("loaded file from local file");
    }
  }else{
    var objDB = JSON.parse(docs.net)
    net.fromJSON(objDB);
    console.log("loaded net from DB");
  }
});

function detect(path){
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
                  imgVol.set(yc,xc,dc,buffer[ix]/255.0-0.5);
                  i++;
                }//yc
              }//xc
            }//dc
            net.forward(imgVol);
            prediction = net.getPrediction();
            console.log(prediction);
            predictedName =  classes_txt[prediction];
            responseFlag = true;
          }else{
            console.log(err);
          }//err buffer
        })//toBuffer
      });//write
    }else{
      console.log(err);
    }//err size
  })//size
};//detect

function sendRes(req,res){
  clearTimeout(timeOut);
  if(responseFlag){
    setTimeout(function(){    
      console.log("responseFlag = " + responseFlag + " prediction = " + prediction);
      res.end(classes_txt[prediction]);
    }, 1000, "Hello.", "How are you?");
  }else{
    console.log("responseFlag = " + responseFlag);
    timeOut = setTimeout(function(){sendRes(req,res)}, 1000, "Hello.", "How are you?");
  }
}

function tryDetect(){
  clearTimeout(timeOut);
  if(fileSavedFlag){
    detect(path);
  }else{
    console.log("fileSavedFlag = " + fileSavedFlag);
    timeOut = setTimeout(tryDetect, 1000, "Hello.", "How are you?");
  }
}

function saveToMongoDB(){
  var flower = new Flower();
  flower.name = classes_txt[prediction];
  flower.prediction = prediction;
  flower.path = path;
  flower.save(function (err, result) {
   if (err) return console.error(err);
   console.log(err);
//   console.log(result);
   console.log("saved flower to dataBase");
  });
};
var cnt = 0;
function train(){
  console.log("training ...");
  trainer.train(imgVol, prediction);  
  console.log("trainging finished");
  var network = new Network();
  network.net = JSON.stringify(net.toJSON());
  network.save(function (err, result) {
   if (err) return console.error(err);
 //  console.log(result);
   console.log("saved network to dataBase");
  });
};

app.use(express.static(pathLib.resolve(__dirname, 'client')));
app.use(express.bodyParser({uploadDir:'./uploads', keepExtensions: true}));

app.post('/flower',function(req,res){
  console.log("post called");
  var originalName = req.files.file.name;
  path = req.files.file.path;
  console.log("OriginalFilename = "+originalName+", path is "+path);
  detect(path);
  sendRes(req,res);
});

app.post('/flower1',function(req,res){
  console.log("flower1 post called1");
  var imageBuffer = new Buffer(req.body.image, 'base64'); 
  fs.writeFile('uploads/flower.jpg', imageBuffer, 'binary', function(err){
            if (err) throw err
            path = 'uploads/flower.jpg';
            console.log('File saved.');
            fileSavedFlag = true;
        })
tryDetect();
  sendRes(req,res);
});

app.get('/confirm',function(req,res){
  console.log("get confirm called");
  saveToMongoDB();
  train();
  res.end("confirmed");
});
app.get('/testget',function(req,res){
  console.log("testget called");
  res.end("testget confirmed");
});
app.post('/testpost',function(req,res){
  console.log("testpost called");
  res.end("testpost confirmed");
});
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Flower server listening at", addr.address + ":" + addr.port);
});




