const { transform } = require("babel-core");
const recast = require("recast");
const objectRestSpread = require("babel-plugin-syntax-object-rest-spread");
const classProperties = require("babel-plugin-syntax-class-properties");
const jsx = require("babel-plugin-syntax-jsx");

const parser = (filestring, mod) => {
  const transformedFile = transform(filestring, {
    parserOpts: {
      parser: recast.parse
    },
    generatorOpts: {
      generator: recast.print
    },
    plugins: [objectRestSpread, classProperties, jsx, mod]
  });

  return transformedFile && transformedFile.code;
};

module.exports = parser;
