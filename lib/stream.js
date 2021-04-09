const stream = require('stream');
const util = require('./util');

/**
 * stores key value pairs in which
 * keys are file names and values are an array
 * of string chunks (the file content).
 */
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

  /**
   * Get the list of stored files
   */
  getFileList() {
    return Array.from(FilesStore.keys());
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
