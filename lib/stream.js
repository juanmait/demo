const stream = require('stream');
const util = require('./util');

const FilesStore = new Map();

class CsvStream extends stream.Writable {
  setFileName(filename) {
    this.filename = util.buildFileName(filename);
    FilesStore.set(this.filename, []);
  }

  getFileName() {
    return this.filename;
  }

  _write(chunk, enc, next) {
    const store = FilesStore.get(this.filename);
    store.push(chunk.toString());
    next();
  }
}

exports.createStream = (filename) => {
  const stream = new CsvStream();
  stream.setFileName(filename);
  return stream;
};

exports.CsvStream = CsvStream;
exports.FilesStore = FilesStore;
