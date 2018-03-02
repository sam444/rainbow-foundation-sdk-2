'use strict';

var webpack = require('webpack'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  path = require('path'),
  srcPath = path.join(__dirname, 'src');

var ExtractTextPlugin = require("extract-text-webpack-plugin");
var name = require('./package.json').name;
var version = require('./package.json').version;
var outputName = name+"-"+version;

var resolveNpmPath = function (componentPath) {
  return path.join(__dirname, 'node_modules', componentPath);
};

module.exports = {
  target: 'web',
  cache: true,
  entry: {
    index: path.join(srcPath, 'index.js')
  },

  resolve: {
    root: srcPath,
    extensions: ['', '.js', '.jsx', '.css'],
    alias: {
      underscore: resolveNpmPath('/underscore/underscore-min.js'),
      jquery: resolveNpmPath('/jquery/dist/jquery.min.js')
    }
  },

  output: {
    path: path.join(__dirname, "dist"),
    publicPath: '',
    filename: outputName +  '.js',
    pathInfo: true
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ["babel-loader"]
      },
      {test: /\.jsx$/, loaders: ['babel-loader']},

      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract("css-loader"),
      },
      {test: /\.less/, loader: "style-loader!css-loader!less-loader"},
      {test: /\.gif/, loader: "file-loader"},
      {test: /\.jpg/, loader: "file-loader"},
      {test: /\.png/, loader: "file-loader"},
      {test: /\.woff2/, loader: "file-loader"},
      {test: /\.woff/, loader: "file-loader"},
      {test: /\.ttf/, loader: "file-loader"},
      {test: /\.eot/, loader: "file-loader"},
      {test: /\.svg/, loader: "file-loader"},
    ]
  },


  plugins: [
    new ExtractTextPlugin(outputName  +".css"),
    new webpack.NoErrorsPlugin(),
    new webpack.ProvidePlugin({
      React: 'react',
      ReactWithAddons: 'reactWithAddons',
      $: 'jquery',
      jQuery: 'jquery',
      _: 'underscore',
      i18n: "modules/common-conf/js/i18n/i18n.resource"
    })
  ],
  debug: true,
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    contentBase: '',
    historyApiFallback: true
  }
};
