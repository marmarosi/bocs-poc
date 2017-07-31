const path = require('path');

module.exports = {
  entry: './client-test/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public/scripts')
  }
};
