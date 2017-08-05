const path = require('path');

module.exports = {
  entry: {
    'bo-client': './client/index.js',
    'bo-data': './source/index.js'
  },
  devtool: 'inline-source-map',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public/scripts')
  }
};
