const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = (_, argv) => ({
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: argv.mode === 'development' ? '/' : '/Cloud-Dashboard/',
  },

  entry: [
    './src/index.js',
    './css/style.css',
  ],
  module: {
    rules: [
      {
        test: /\.js$/,

        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.html$/,
        use: [
          {

            loader: 'html-loader',
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
            options: { injectType: 'linkTag' },
          },
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.png$/,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './html/index.html',
      filename: './index.html',
    }),
  ],
});
