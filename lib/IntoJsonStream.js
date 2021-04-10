const stream = require('stream');

class IntoJsonStream extends stream.Transform {
  constructor() {
    super({ objectMode: true });
    this.isFirstChunk = true;
  }
  /**
   * receives an array of objects
   */
  _transform(obj, enc, next) {
    const doc = JSON.stringify(obj);

    if (this.isFirstChunk) {
      this.isFirstChunk = false;
      this.push('[');
      this.push(doc);
    } else {
      this.push(`,${doc}`);
    }

    next();
  }

  _flush(done) {
    this.push(']');
    done();
  }
}

exports.IntoJsonStream = IntoJsonStream;
