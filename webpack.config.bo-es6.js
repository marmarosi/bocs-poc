const path = require('path');
const MinifyPlugin = require("babel-minify-webpack-plugin");

module.exports = {
  entry: './client/index.js',
  //devtool: 'inline-source-map',
  devtool: 'source-map',
  output: {
    filename: 'bo-client.js',
    path: path.resolve(__dirname, 'public/scripts'),
    library: 'bo'
  }/*,
  plugins: [
    new MinifyPlugin()
  ]*/
};
