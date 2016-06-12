// fork getUserMedia for multiple browser versions, for those
// that need prefixes

navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia)

// set up forked web audio context, for multiple browsers
// window. is needed otherwise Safari explodes

var audioCtx = new (window.AudioContext || window.webkitAudioContext)()
var voiceSelect = document.getElementById("voice")
var source
var stream

// grab the mute button to use below

var mute = document.querySelector('.mute');

//set up the different audio nodes we will use for the app

var analyser = audioCtx.createAnalyser();
analyser.minDecibels = -90
analyser.maxDecibels = -20
analyser.smoothingTimeConstant = .9

// grab audio track via XHR for convolver node

var soundSource, concertHallBuffer;

var canvas = document.querySelector('.visualizer');
var canvasCtx = canvas.getContext("2d");

var intendedWidth = document.querySelector('.wrapper').clientWidth;

canvas.setAttribute('width',intendedWidth);

var drawVisual

navigator.getUserMedia({audio: true}, gotMic, console.error.bind(console))

function gotMic(stream) {
   audioCtx.createMediaStreamSource(stream).connect(analyser)
   visualize()
}

function visualize() {
  WIDTH = canvas.width
  HEIGHT = canvas.height

  analyser.fftSize = 256
  var bufferLength = analyser.frequencyBinCount
  var dataArray = new Uint8Array(bufferLength)
  var start = Date.now()

  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT)

  draw()

  function draw() {
    drawVisual = requestAnimationFrame(draw)

    analyser.getByteFrequencyData(dataArray)

    canvasCtx.fillStyle = 'rgb(0, 0, 0)'
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT)

    var barWidth = (WIDTH / bufferLength) / 1.5
    var barHeight;
    var x = 0;
    var diff = -(Date.now() - start) / 30

    for(var i = 5; i < bufferLength; i++) {
      barHeight = dataArray[i]

      var color = (((i / bufferLength)  * 270) + diff) % 360

      canvasCtx.fillStyle = 'hsla(' + color + ', ' + Math.max(50, 100 * (HEIGHT - barHeight)  / 128) + '%,' + Math.min(60, 100 * barHeight  / 128) + '%, 1)'
      // canvasCtx.fillRect(x,0,barWidth,HEIGHT-barHeight/2)
      canvasCtx.fillStyle = 'hsla(' + -color + ', ' + Math.max(50, 100 * barHeight  / 128) + '%,' + Math.min(60, 100 * barHeight  / 128) + '%, 1)'
      // canvasCtx.fillRect(x, HEIGHT-barHeight/2,barWidth,barHeight/2)
      canvasCtx.fillRect(WIDTH / 2 + x, HEIGHT-barHeight/2,barWidth,barHeight/2)
      canvasCtx.fillRect(WIDTH / 2 - x, HEIGHT-barHeight/2,barWidth,barHeight/2)
      x += barWidth + 1
    }
  }
}
