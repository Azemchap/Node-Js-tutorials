const http = require('http');
const fs = require('fs');
const path = require('path');

// Storing the port in a constant makes it easy to change in one place.
const PORT = 8000;

// Storing the server in a variable lets us attach an error handler to it.
const server = http.createServer(function (req, res) {

  // path.join(__dirname, ...) builds a full absolute path to the file,
  // relative to this script's folder — not wherever 'node' was launched from.
  // Without this, Node would look for the file in the current working directory,
  // which can cause "file not found" errors depending on where you run the script.
  const filePath = path.join(__dirname, 'demofile1.html');

  fs.readFile(filePath, function (err, data) {

    // Always handle the error first — this is the standard Node.js callback pattern.
    if (err) {
      // The file couldn't be read (e.g. it doesn't exist or there's a permissions issue).
      // Send a 404 status so the browser knows something went wrong.
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 - File not found');
      return; // Stop here — don't try to send 'data' if there was an error.
    }

    // Only send a 200 (OK) status when we know the file was read successfully.
    res.writeHead(200, { 'Content-Type': 'text/html' });

    // res.end(data) sends the response body and signals that the response is complete.
    // This combines res.write(data) + res.end() into one call.
    res.end(data);
  });
});

// The 'error' event fires if the server itself fails to start (e.g. port already in use).
// Without this, Node throws an unhandled error and crashes with a confusing stack trace.
server.on('error', function (err) {
  if (err.code === 'EADDRINUSE') {
    console.error('Port ' + PORT + ' is already in use. Is another server still running?');
  } else {
    console.error('Server error:', err.message);
  }
});

server.listen(PORT, function () {
  // This callback fires once the server is ready to accept connections.
  // It's a good habit to log the address so you know the server started correctly.
  console.log('Server running at http://localhost:' + PORT + '/');
});
