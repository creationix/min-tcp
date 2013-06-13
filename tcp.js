// This module implements the js-git tcp interface for node.js
// The interface is documented at:
//
//   https://github.com/creationix/js-git/blob/master/specs/tcp.md
//
var net = require('net');
var wrapStream = require('min-stream-node').wrapStream;

module.exports = {
  createServer: createServer,
  connect: connect
};

function createServer(port, address) {
  var dataQueue = [];
  var readQueue = [];
  var closed = false;
  var err;
  
  var server = net.createServer();
  server.listen(port, address);
  server.on("error", function (err) {
    dataQueue.push([err]);
    check();
  });
  
  server.on("connection", function (client) {
    dataQueue.push([null, wrapStream(client)]);
    check();
  });
  
  function check() {
    while (readQueue.length && (closed || dataQueue.length)) {
      var callback = readQueue.shift();
      if (closed) callback(err);
      else callback.apply(null, dataQueue.shift());
    }
  }
  
  function source(close, callback) {
    if (close) {
      closed = close;
      err = close === true ? null : close;
      server.close(function () { callback(err); });
    }
    else {
      readQueue.push(callback);
    }
    check();
  }
  
  return source;
}

function connect(port, address) {
  return function (callback) {
    var stream = net.connect(port, address, function (err) {
      if (err) return callback(err);
      callback(null, wrapStream(stream));
    });    
  };
}

