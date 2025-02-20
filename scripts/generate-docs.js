#!/usr/bin/env node
/* globals cat, cd, echo, grep, ls, sed, ShellString */
require('../global');

var path = require('path');

echo('Appending docs to README.md');

cd(path.join(__dirname, '..'));

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

// Wipe out the old docs
ShellString(cat('README.md').replace(/## Command reference(.|\n)*\n## Team/, '## Command reference\n## Team')).to('README.md');

// Append new docs to README
sed('-i', /## Command reference/, '## Command reference\n\n' + docs, 'README.md');

echo('All done.');
