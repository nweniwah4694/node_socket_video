var express = require('express');//import
var app =express();
var http=require("http").Server(app);
var io=require('socket.io')(http);
var port=5000;

YT3_API_KEY = "AIzaSyBnI68oxWGCWu3Qf79lCgPtUDws-HwLpeg"
const connections = [];

const videos = [];

http.listen(port,function() {

	console.log('listening on:' +port);
});

io.sockets.on('connection',(socket) => {

  connections.push(socket);
  console.log(' %s sockets is connected', connections.length);

  socket.on('disconnect', () => {
    connections.splice(connections.indexOf(socket), 1);
  });    

  socket.on('play video', function (data) {

    io.sockets.emit('playing video', { hello: 'play world' });
  });

  socket.on('pause video', function (data) {

    io.sockets.emit('pausing video', { hello: 'pause world' });
  });

    // change video
  socket.on('change video', function(data) {

    io.sockets.emit('changeVideoClient', { videoId: data.videoId });
  });

  // enqueue video
  socket.on('enqueue video', function(data) {

    io.sockets.emit('get title', {
        videoId: data.videoId,
        api_key: YT3_API_KEY
    });
  });

  // add playList
  socket.on('add playList', function(data) {    

    videos.push({
        videoId: data.videoId,
        title: data.title
    });
    io.sockets.emit('get vidlist', videos);       
  });

  // remove a specific video from playlist
  socket.on('remove at', function(data) {

    var idx = data.idx;     
    videos.splice(idx, 1);    
    io.sockets.emit('get vidlist', videos);     
  });

  // play a specific video from playlist
  socket.on('play at', function(data, callback) {  

    var idx = data.idx
    var videoId = ""    
    videoId = videos[idx].videoId
    videos.splice(idx, 1);    //splice play video from playlist
    io.sockets.emit('get vidlist', videos); //update playlist
    callback({
        videoId: videoId
    })       
  });

  // play next video after one is finished
  socket.on('play next video', function(callback) {   

    if (videos.length > 0) {    
      var videoId = videos.shift().videoId;  
      io.sockets.emit('get vidlist', videos);//update playlist  
      callback({
        videoId: videoId
      }) 
    }        
  });

});

app.get('/', (req, res) => {
   res.sendFile(__dirname + '/index.html');
});