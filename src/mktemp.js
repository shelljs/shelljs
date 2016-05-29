var path = require('path');
var fs = require('fs');
var common = require('./common');
var mkdir = require('./mkdir');
var touch = require('./touch');
var rm = require('./rm');
var chmod = require('./chmod');

var tempdir;
var DEFAULT_TEMPLATE = 'tmp.shelljs.XXXXXXXXXXXXXXXXXXXX';
var LETTERS = 'abcdefghijklmnopqrstuvwkyz1234567890'.toUpperCase().split('');
var MAX_PATTERN_TRIES = 1000;

function _fillTemplate(template) {
  // We itterate over `template` backward so that we only replace trailing X's. Once we find a non-X,
  // we break out of the loop.
  var file = '';
  for (var i = template.length - 1; i >= 0; --i) {
    if (template[i] === 'X') {
      file = LETTERS[Math.floor(Math.random() * LETTERS.length)] + file;
    } else {
      file = template.slice(0, i + 1) + file;
      break;
    }
  }
  return file;
}

//@
//@ ### mktemp([options,] [templates...])
//@
//@ Available Options:
//@
//@ + `-d`: Create a directory instead of a file.
//@ + `-u`: Unsafe mode. (Delete the file before retuning). Only use if you know what you're doing.
//@
//@ Examples:
//@
//@ ```javascript
//@ mktemp() // ['/tmp/tmp.shelljs.QOL1QLNZMSR0HR4S5FTS']
//@ mktemp('-d') // ['/tmp/tmp.shelljs.EGBZ4GVYFO4SO534F3WK']
//@ mktemp('/tmp/tmp.shelljs.foo.XXXXX') // ['/tmp/tmp.shelljs.foo.AQZJK']
//@ mktemp('-d', '/tmp/shelljs.foo.XXXXX', '/tmp/shelljs.bar.XXXXX') // ['/tmp/tmp.shelljs.foo.ZFUPD', '/tmp/tmp.shelljs/bar.I9XVF']
//@ ```
//@
//@ Creates a temporary file or directory in a sutible place, with a random, available name. You can optionally pass
//@ one or more templates, which will override the default one. Each template will have all trailing `X`'s replaced with
//@ a random letter, and will then be used as a path to create a temporary file/directory.
//@
//@ *WARNING: You MUST delete the file/directory when you're done with it, otherwise it will remain there forever.*
function mktemp(options, templates) {
  options = common.parseOptions(options, {
    d: 'directory',
    u: 'unsafe',
  });
  templates = Array.prototype.slice.call(arguments);
  templates.shift(); // Get rid of options.
  if (templates.length === 0) {
    // tempdir depends on mktemp, so we lazily load it do allow the cyclicdic dependency to resolve.
    tempdir = tempdir || require('./tempdir');
    templates.push(path.resolve(tempdir(), DEFAULT_TEMPLATE));
  }
  var ret = [];
  var tries = 0;
  for (var i = 0; i < templates.length; ++i) {
    var template = templates[i];
    if (tries > MAX_PATTERN_TRIES) common.error('Failed to create tmp file with template: ' + template, 2, false);
    var file = _fillTemplate(template);
    if (fs.existsSync(file)) { // Try it again if it already exists.
      i--;
      tries++;
      continue;
    }
    tries = 0;
    if (options.directory) {
      mkdir('', file);
    } else {
      touch('', file);
    }
    chmod('', '0600', file);
    if (options.unsafe) rm('-rf', file);
    ret.push(file);
  }
  return new common.ShellString(ret, '', 0);
}

module.exports = mktemp;

