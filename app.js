const express = require('express');
const busboy = require('connect-busboy');
const path = require('path');
const util = require('./lib/util');
const stream = require('./lib/stream');

const PORT = 4321;

// ensure that the uploads directory exists
util.ensureUploadsExistsSync();

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
app.route('/upload').post((req, res) => {
  req.pipe(req.busboy);

  const writable = stream.createStream();

  req.busboy.on('file', (fieldname, file, filename) => {
    console.log(`Upload of '${filename}' started`);

    writable.setFileName(filename);

    // Pipe it trough
    file.pipe(writable);

    // On finish of the upload
    writable.on('close', () => {
      console.log(`Upload of '${writable.getFileName()}' finished`);
      console.info('stored files so far:', writable.getFileList());
      res.sendFile(path.join(__dirname, 'upload-success.html'));
    });
  });

  req.busboy.on('field', function (key, value) {
    if (key === 'provider') {
      writable.setProviderName(value);
    }
  });
});

app.listen(PORT, () => {
  console.info('server listengin on', PORT);
});
