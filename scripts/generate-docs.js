#!/usr/bin/env node
/* globals cat, cd, echo, grep, ls, sed, ShellString */
require('../global');

var path = require('path');

var COMMAND_PREFIX = '## Command reference';
var COMMAND_SUFFIX = '\n## Team';
var COMMAND_PATTERN = /## Command reference\n\n((?:.|\n)*)\n## Team/;
function extractCurrentDocs() {
  var m = cat('README.md').match(COMMAND_PATTERN);
  if (m) {
    var docs = m[1];
    return docs;
  }
  /* istanbul ignore next */
  throw new Error('Unable to extract current docs');
}
module.exports.extractCurrentDocs = extractCurrentDocs;

function generateNewDocs() {
  // Extract docs from shell.js
  var docs = grep('^//@', 'shell.js');

  // Insert the docs for all the registered commands
  var blocklist = [
    './src/common.js',
    './src/error.js',
    './src/errorCode.js',
  ];
  docs = docs.replace(/\/\/@commands\n/g, function () {
    return ls('./src/*.js').map(function (file) {
      if (blocklist.includes(file)) {
        return '';
      }
      var commandDoc = grep('^//@', file).toString();
      if (commandDoc !== '') {
        commandDoc += '\n';
      }
      return commandDoc;
    }).join('');
  });

  // Now extract docs from the remaining src/*.js files
  docs = docs.replace(/\/\/@include (.+)/g, function (match, filename) {
    return grep('^//@', filename);
  });

  // Remove '//@'
  docs = docs.replace(/\/\/@ ?/g, '');
  return docs;
}
module.exports.generateNewDocs = generateNewDocs;

/* istanbul ignore next */
function main() {
  echo('Appending docs to README.md');

  cd(path.join(__dirname, '..'));

  var docs = generateNewDocs();

  // Wipe out the old docs
  ShellString(cat('README.md').replace(COMMAND_PATTERN,
    COMMAND_PREFIX + COMMAND_SUFFIX)).to('README.md');

  // Append new docs to README
  sed('-i', /## Command reference/, COMMAND_PREFIX + '\n\n' + docs, 'README.md');

  echo('All done.');
}

/* istanbul ignore if */
if (require.main === module) {
  main();
}
