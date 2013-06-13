var tcp = require('../.');
var streamToSource = require('../common.js').streamToSource;
var streamToSink = require('../common.js').streamToSink;

if (!process.argv[2]) {
  console.error("Usage: %s port [host]", process.argv[1]);
  process.exit(-1);
}

var stdio = {
  source: streamToSource(process.stdin),
  sink: streamToSink(process.stdout, false)
};

tcp.connect(process.argv[2], process.argv[3])(function (err, socket) {
  checkError(err);
  stdio.sink(socket.source)(checkError);
  socket.sink(stdio.source)(checkError);
});

function checkError(err) {
  if (err) throw err;
}