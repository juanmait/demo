const express = require('express');
const busboy = require('connect-busboy');
const fs = require('fs');
const path = require('path');
const { ensureUploadsExistsSync, getFilePath } = require('./lib/util');

const PORT = 4321;

// ensure that the uploads directory exists
ensureUploadsExistsSync();

const app = express();

// serve index.html
app.use(express.static('public'));

// configure and register `busybody` middleware
app.use(
  busboy({
    highWaterMark: 2 * 1024 * 1024, // 2MiB buffer
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MiB upload limit
    },
  })
);

/**
 * Create route /upload which handles the post request
 */
app.route('/upload').post((req, res, next) => {
  req.pipe(req.busboy);

  req.busboy.on('file', (fieldname, file, filename) => {
    console.log(`Upload of '${filename}' started`);

    const filepat = getFilePath(filename);
    fs.writeFileSync(filepat, '');

    // Create a write stream of the new file
    const writablleStream = fs.createWriteStream(filepat);

    // Pipe it trough
    file.pipe(writablleStream);

    // On finish of the upload
    writablleStream.on('close', () => {
      console.log(`Upload of '${filename}' finished`);
      res.sendFile(path.join(__dirname, 'upload-success.html'));
    });
  });
});

app.listen(PORT, () => {
  console.info('server listengin on', PORT);
});
