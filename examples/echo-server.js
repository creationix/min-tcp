var tcp = require('../.');

// Create a tcp server listening at localhost port 8080
// server is a min-stream source that emits sockets as clients connect.
var server = tcp.createServer(8080);

// Wait for the first client to connect.
server(null, function (err, client) {
  if (err) throw err; // This happens if there was a problem binding to the port.
  console.log("A client connected");
  
  // Pipe the client back to itself, implementing an echo server.
  var continuable = client.sink(client.source);
  
  // Start the flow of the streams and report error or end.
  continuable(function (err) {
    if (err) console.error(err.stack);
    else console.log("The client disconnected");
  });
  
  console.log("Closing server so we don't accept more connections");
  server(true, function (err) {
    if (err) console.error(err.stack);
    else console.log("The server is now closed");
  });
});
