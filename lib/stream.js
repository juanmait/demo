const stream = require('stream');
const util = require('./util');

const FilesStore = new Map();

class CsvStream extends stream.Writable {
  setFileName(filename) {
    this.filename = util.buildFileName(filename);
    FilesStore.set(this.filename, []);
  }

  setProviderName(name) {
    this.provider = name;
  }

  getFileName() {
    return this.filename;
  }

  _write(chunk, enc, next) {
    if (!this.filename) {
      throw new Error(
        'Missing filename: must set filename using stream.setFileName() first'
      );
    }
    const store = FilesStore.get(this.filename);
    store.push(chunk.toString());
    next();
  }
}

exports.createStream = () => {
  return new CsvStream();
};

exports.CsvStream = CsvStream;
exports.FilesStore = FilesStore;
