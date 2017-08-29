const path = require('path');

module.exports = {
  entry: './source/index.js',
  devtool: 'inline-source-map',
  output: {
    filename: 'bo-data.js',
    path: path.resolve(__dirname, 'public/scripts'),
    library: 'lib'
  }
};
