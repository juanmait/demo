const stream = require('stream');
const path = require('path');
const config = require('../config');

/**
 * Split the chunk into lines (Array)
 * Split the lines into values (Array of arrays) based on the providers configured separator.
 * Push every single line (row value) to the next stream in the pipe
 */
class IntoColumnsStream extends stream.Transform {
  // PROP: prevLastLine
  // PROP: isFirstChunk
  // PROP: ignore headers
  // PROP: providerSettings
  constructor() {
    super({ objectMode: true });

    this.isFirstChunk = true;

    // providerSettings should be the particular provider configuration
    this.providerSettings = {
      ignoreFirstLine: true,
    };
  }

  getSplitPattern() {
    return /(?:\n|\r\n|\r)/g;
  }

  _transform(chunk, enc, next) {
    let str = chunk.toString();
    // array of lines (string)
    let lines = str.split(this.getSplitPattern());

    if (this.isFirstChunk && this.providerSettings.ignoreFirstLine) {
      this.isFirstChunk = false;

      // @TODO: if the provider accidentally sends extremely large rows we're screwed!
      // they might not fit the stream highWaterMark limit and we'll end up
      // with a broken first line!

      // lines = str.split(this.getSplitPattern());

      // remove the first row as the provider specified that the first line
      // referees to the column's names. We don't care about that because
      // we already have the provider's setting and we know the order of every field.
      lines.shift();
    } else {
      // if this is not the first chunk
      // we might have a reminding partial line from the previews chunk to process
      if (this.prevLastLine) {
        // so in that case, the first line of this chunk is incomplete.
        // In order to complete this line we must prepend the last partial line
        // with the current (incomplete) line˘
        lines[0] = this.prevLastLine.concat(lines[0]);
      }
    }

    // remove and store last line of this chunk as it is quite posible that is truncated
    // and store it to be processed with the next chunk
    this.prevLastLine = lines.pop(); // string

    // split every line in every "DEFAULT_CSV_SEPARATOR" character
    // one lines is a row
    const rows = lines.map((line) => line.split(config.DEFAULT_CSV_SEPARATOR));

    rows.forEach((row) => {
      this.push(row);
    });

    next();
  }

  _flush(done) {
    if (this.prevLastLine) {
      this.push(this.prevLastLine.split(config.DEFAULT_CSV_SEPARATOR));
      this.prevLastLine = null;
    }
    done();
  }
}

/**
 * Every chunk is a row with an array of values.
 */
class IntoDocumentsStream extends stream.Transform {
  constructor() {
    super({ objectMode: true });
  }

  buildNullifiedObject() {
    return config.DEFAULT_CSV_FIELDS_ORDER.reduce((acc, field) => {
      acc[field] = null;
      return acc;
    }, {});
  }

  processRow(row) {
    const obj = row.reduce((finalObject, rowValue, index) => {
      // get the name of the key for this row value
      const key = config.DEFAULT_CSV_FIELDS_ORDER[index];
      // attach this value->key pair to the final object
      finalObject[key] = rowValue;

      return finalObject;
    }, this.buildNullifiedObject());

    return obj;
  }

  /**
   * Receives an array "rows".
   * Every row is an array of "values".
   */
  _transform(row, enc, next) {
    const doc = this.processRow(row);

    this.push(doc);
    next();
  }
}

class IntoJsonStream extends stream.Transform {
  constructor() {
    super({ objectMode: true });
    this.isFirstChunk = true;
  }
  /**
   * receives an array of objects
   */
  _transform(doc, enc, next) {
    if (this.isFirstChunk) {
      this.isFirstChunk = false;
      this.push('[');
    }

    next();
  }

  _flush(done) {
    this.push(']');
    done();
  }
}

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
    this.readableStream = readableStream;
    this.uploadedAt = new Date();
    this.originalFilenName = filename;
    this.computedFileName = `${path.basename(
      filename,
      '.csv'
    )}.${this.uploadedAt.getTime()}.csv`;
    this.onFinishCallback = cb;

    // STREAMING BEGINS!
    this.readableStream
      .pipe(this.columnsStream)
      .pipe(this.intoJSObjects)
      .pipe(this.intoJsonDocuments);

    // call back the user when is finished
    this.readableStream.on('close', this.onFinishCallback);
  }
}

exports.Parser = Parser;
