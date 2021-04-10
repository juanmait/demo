const express = require('express');
const busboy = require('connect-busboy');
const path = require('path');
const stream = require('./lib/stream');
const config = require('./config');

const app = express();

// serve index.html
app.use(express.static('public'));

// configure and register `busybody` middleware
app.use(
  busboy({
    highWaterMark: config.HIGH_WATER_MARK,
    limits: {
      fileSize: config.UPLOAD_SIZE_LIMIT,
    },
  })
);

/**
 * Upload handler
 */
app.route('/upload').post((req, res) => {
  req.pipe(req.busboy);

  const parser = new stream.Parser();

  req.busboy.on('file', (fieldname, readableFileStream, filename) => {
    console.log(`Upload of '${filename}' started`);

    // TODO: validate `fieldname` (now we accept any file).

    /**
     * Start the streaming and give a callback to be called
     * when the whole process finishes
     */
    parser.start(filename, readableFileStream, () => {
      res.sendFile(path.join(__dirname, 'upload-success.html'));
    });
  });

  req.busboy.on('field', function (key, value) {
    if (key === 'provider') {
      /**
       * I don't know what event is fired first (file | field).. bummer..
       */
      parser.setProviderName(value);
    }
  });
});

app.listen(config.SERVER_PORT, () => {
  console.info('server listengin on', config.SERVER_PORT);
});
