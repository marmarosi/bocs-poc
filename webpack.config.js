const path = require('path');

module.exports = {
  entry: './client/index.js',
  output: {
    filename: 'bo-client.js',
    path: path.resolve(__dirname, 'public/scripts')
  }
};
