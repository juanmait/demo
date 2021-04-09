const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

console.info(UPLOADS_DIR);
exports.ensureUploadsExistsSync = () => {
  // ensure that the uploads directory exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
  }
};

exports.getFilePath = (filename) => {
  return path.join(
    UPLOADS_DIR,
    `${path.basename(filename, '.csv')}.${Date.now()}.csv`
  );
};
