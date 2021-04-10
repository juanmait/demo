/**
 * SERVER CONFIG
 */
exports.SERVER_PORT = 4321;
exports.HIGH_WATER_MARK = 1 * 1024 * 1024; // 1MiB data tranfer
exports.UPLOAD_SIZE_LIMIT = 100 * 1024 * 1024; // 100MiB upload file size limit

/**
 * OPTIONAL
 * Customize provider's preferred separator
 */
exports.DEFAULT_CSV_SEPARATOR = ',';
/**
 * OPTIONAL
 * Customize provider's preferred columns order
 */
exports.DEFAULT_CSV_FIELDS_ORDER = [
  'uuid',
  'vin',
  'make',
  'model',
  'mileage',
  'year',
  'price',
  'zip',
  'createdAt',
  'uploadedAt',
];

/**
 * OPTIONAL
 * Provider might or might not include
 * headers data in his CSV
 */
exports.DEFAULT_CSV_HEADER_IS_INCLUDED = true;
