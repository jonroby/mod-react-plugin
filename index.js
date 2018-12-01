const env = require("babel-preset-env");

const mods = require("./mods");
const defaults = require("./defaults");
const command = require("./command");
const parser = require("./parser");

const config = {
  parser,
  commands: command
};

module.exports = { mods, defaults, config };
