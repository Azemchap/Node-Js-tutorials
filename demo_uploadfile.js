const http = require('http');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

const PORT = 8800;

// 'uploads' is a folder inside the project directory where received files will be saved.
// Using __dirname makes this path work regardless of where you run the script from.
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Make sure the uploads folder exists before the server starts.
// { recursive: true } means it won't throw an error if the folder already exists.
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const server = http.createServer(function (req, res) {

  // Check the URL to decide what to do with this request.
  // Without this, every request (including the form submission) would just show the form again.
  if (req.url === '/fileupload' && req.method.toLowerCase() === 'post') {

    // formidable handles the multipart/form-data parsing for us.
    // Trying to parse this manually with raw req.on('data') would be very complex.
    const form = new formidable.IncomingForm();

    // The '_fields' prefix signals that this parameter is intentionally unused.
    // formidable gives us text fields separately from files — we only need the files here.
    form.parse(req, function (err, _fields, files) {

      // Always check for errors from form.parse — the upload may have failed or been malformed.
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error parsing the uploaded file.');
        return;
      }

      // formidable saves the file to a temp location first.
      // We then move it to our 'uploads' folder with its original name.
      const uploadedFile = files.filetoupload[0];
      const tempPath = uploadedFile.filepath;
      const destPath = path.join(UPLOAD_DIR, uploadedFile.originalFilename);

      // fs.rename moves the file from the temp location to our destination.
      // Note: on some systems, if temp and dest are on different drives,
      // fs.rename can fail — in that case you'd need to copy then delete instead.
      fs.rename(tempPath, destPath, function (err) {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error saving the file.');
          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('File "' + uploadedFile.originalFilename + '" uploaded and saved successfully!');
      });
    });

  } else {
    // Any other request just shows the upload form.
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br><br>');
    res.write('<input type="submit" value="Upload">');
    res.write('</form>');
    res.end();
  }
});

// Catch server-level errors (e.g. port already in use) so they don't crash with a raw stack trace.
server.on('error', function (err) {
  if (err.code === 'EADDRINUSE') {
    console.error('Port ' + PORT + ' is already in use. Is another server still running?');
  } else {
    console.error('Server error:', err.message);
  }
});

server.listen(PORT, function () {
  console.log('Server running at http://localhost:' + PORT + '/');
  console.log('Uploaded files will be saved to: ' + UPLOAD_DIR);
});
