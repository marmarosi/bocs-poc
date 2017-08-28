const path = require('path');

module.exports = [
  {
    entry: './client/index.js',
    devtool: 'inline-source-map',
    output: {
      filename: 'bo-client.js',
      path: path.resolve(__dirname, 'public/scripts'),
      library: 'bo'
    }
  },
  {
    entry: './source/index.js',
    devtool: 'inline-source-map',
    output: {
      filename: 'bo-data.js',
      path: path.resolve(__dirname, 'public/scripts'),
      library: 'lib'
    }
  }
];
