/* global __dirname, require, module*/
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");
const fs = require("fs");

var NAMESPACE = "sphinx_bot";

module.exports = {
  entry: "./dist/index.js",
  mode: "production",
  output: {
    path: path.resolve(__dirname, NAMESPACE),
    filename: "sphinx_bot.min.js",
    library: ["sphinx_bot"],
  },
  target: "web",
  resolve: {
    extensions: [".js"],
  },
  optimization: {
    minimizer: [new TerserPlugin()],
  },
  node: { fs: "empty", net: "empty" },
};
