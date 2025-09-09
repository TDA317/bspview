const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    index: 'src/index.html',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/inline',
      },
    ],
  },
  plugins: [
    new HtmlBundlerPlugin({
      js: {
        inline: true,
      },
      css: {
        inline: true,
      },
    }),
  ],
};
