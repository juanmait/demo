const stream = require('stream');
const config = require('../config');

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

exports.IntoDocumentsStream = IntoDocumentsStream;
