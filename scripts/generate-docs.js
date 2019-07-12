#!/usr/bin/env node
/* globals cat, cd, echo, grep, sed, ShellString */
require('../global');

var path = require('path');

echo('Appending docs to README.md');

cd(path.join(__dirname, '..'));

// Extract docs from shell.js
var docs = grep('^//@', 'shell.js');

// Insert the docs for all the registered commands
docs = docs.replace(/\/\/@commands\n/g, function () {
  return require('../commands').map(function (commandName) {
    var file = './src/' + commandName + '.js';
    return grep('^//@', file) + '\n';
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
