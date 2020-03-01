var socket = new WebSocket('wss://2o09jhgbn5.execute-api.us-east-2.amazonaws.com/dev');
var video = document.getElementById('main-video');
var timerId = 0;
var keepAlive = (socket) => {
    var timeout = 20000;
    if (socket.readyState == socket.OPEN) {
        socket.send('');
    }
    timerId = setTimeout(keepAlive,timeout);
}

socket.onmessage = (event) => {
    console.log(event.data);
    video.src = JSON.parse(event.data).video;
    video.play();
}
video.onended = () => {
    video.src = null;
}
keepAlive();