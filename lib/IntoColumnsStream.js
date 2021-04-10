const stream = require('stream');

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
      ignoreFirstLine: config.DEFAULT_CSV_SEPARATOR,
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

exports.IntoColumnsStream = IntoColumnsStream;
