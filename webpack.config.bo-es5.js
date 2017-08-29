const path = require('path');

module.exports = {
  entry: [
    // Set up an ES6-ish environment
    'babel-polyfill',
    // Add your application's scripts below
    './client/index.js',
  ],
  devtool: 'inline-source-map',
  output: {
    filename: 'bo-client.js',
    path: path.resolve(__dirname, 'public/scripts'),
    library: 'bo'
  },
  module: {
    loaders: [
      {
        loader: "babel-loader",
        // Skip any files outside of your project's `src` directory
        include: [
          path.resolve( __dirname, "client" ),
        ],
        // Only run `.js` files through Babel
        test: /\.js$/,
        // Options to configure babel with
        query: {
          plugins: [ 'transform-runtime' ],
          presets: [ 'es2015' ],
        }
      },
    ]
  }
};
