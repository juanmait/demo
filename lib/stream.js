const path = require('path');
const fs = require('fs');
const config = require('../config');
const { IntoColumnsStream } = require('./IntoColumnsStream');
const { IntoDocumentsStream } = require('./IntoDocumentsStream');
const { IntoJsonStream } = require('./IntoJsonStream');

class Parser {
  // PROPERTY NAMES (no typescript support for now):
  // =============
  // readableStream;
  // originalFilenName
  // computedFileName
  // provider
  // onFinishCallback
  // uploadedAt

  constructor() {
    this.columnsStream = new IntoColumnsStream();
    this.intoJSObjects = new IntoDocumentsStream();
    this.intoJsonDocuments = new IntoJsonStream();
  }

  setProviderName(name) {
    this.provider = {
      name,
      // data bellow could be loaded based on the provider's name.
      // using default (ideal) settings here..
      sep: config.DEFAULT_CSV_SEPARATOR,
      order: config.DEFAULT_CSV_FIELDS_ORDER,
      headerIncluded: config.DEFAULT_CSV_HEADER_IS_INCLUDED,
    };
  }

  start(filename, readableStream, cb) {
    console.debug('start parser..');
    console.debug('original filename..', filename);

    this.readableStream = readableStream;
    this.uploadedAt = new Date();
    this.originalFilenName = filename;
    this.computedFileName = `${path.basename(
      filename,
      '.csv'
    )}.${this.uploadedAt.getTime()}.json`;
    console.debug('computed filename..', this.computedFileName);
    this.uploadDirecory = config.UPLOADS_DIRECTORY;
    console.debug('upload directoy..', this.uploadDirecory);

    if (!fs.existsSync(this.uploadDirecory)) {
      console.debug(
        'creating upload direcory   directory',
        this.uploadDirecory
      );
      fs.mkdirSync(this.uploadDirecory);
    }

    const filepath = path.join(this.uploadDirecory, this.computedFileName);

    console.debug('final file path', filepath);
    console.debug('creating writable file in', filepath);
    this.writableFile = fs.createWriteStream(filepath);

    this.onFinishCallback = cb;

    console.debug('starting stream..');
    // STREAMING BEGINS!
    this.readableStream
      .pipe(this.columnsStream)
      .pipe(this.intoJSObjects)
      .pipe(this.intoJsonDocuments)
      .pipe(this.writableFile);

    // call back the user when is finished
    this.readableStream.on('close', this.onFinishCallback);
  }
}

exports.Parser = Parser;
