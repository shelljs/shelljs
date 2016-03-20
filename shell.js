//
// ShellJS
// Unix shell commands on top of Node's API
//
// Copyright (c) 2012 Artur Adib
// http://github.com/arturadib/shelljs
//

var common = require('./src/common');


//@
//@ All commands run synchronously, unless otherwise stated.
//@ All commands accept standard bash globbing characters (`*`, `?`, etc.),
//@ compatible with the [node glob module](https://github.com/isaacs/node-glob).
//@
//@ For less-commonly used commands and features, please check out our [wiki
//@ page](https://github.com/shelljs/shelljs/wiki).
//@

//@include ./src/cd
var _cd = require('./src/cd');
exports.cd = common.wrap('cd', _cd, {idx: 1});

//@include ./src/pwd
var _pwd = require('./src/pwd');
exports.pwd = common.wrap('pwd', _pwd);

//@include ./src/ls
var _ls = require('./src/ls');
exports.ls = common.wrap('ls', _ls, {idx: 1});

//@include ./src/find
var _find = require('./src/find');
exports.find = common.wrap('find', _find, {idx: 1});

//@include ./src/cp
var _cp = require('./src/cp');
exports.cp = common.wrap('cp', _cp, {idx: 1});

//@include ./src/rm
var _rm = require('./src/rm');
exports.rm = common.wrap('rm', _rm, {idx: 1});

//@include ./src/mv
var _mv = require('./src/mv');
exports.mv = common.wrap('mv', _mv, {idx: 1});

//@include ./src/mkdir
var _mkdir = require('./src/mkdir');
exports.mkdir = common.wrap('mkdir', _mkdir, {idx: 1});

//@include ./src/test
var _test = require('./src/test');
exports.test = common.wrap('test', _test);

//@include ./src/cat
var _cat = require('./src/cat');
exports.cat = common.wrap('cat', _cat, {idx: 1});

//@include ./src/head
var _head = require('./src/head');
exports.head = common.wrap('head', _head, {idx: 1});

//@include ./src/tail
var _tail = require('./src/tail');
exports.tail = common.wrap('tail', _tail, {idx: 1});

// The below commands have been moved to common.ShellString(), and are only here
// for generating the docs
//@include ./src/to
//@include ./src/toEnd

//@include ./src/sed
var _sed = require('./src/sed');
exports.sed = common.wrap('sed', _sed, {idx: 3});

//@include ./src/sort
var _sort = require('./src/sort');
exports.sort = common.wrap('sort', _sort, {idx: 1});

//@include ./src/grep
var _grep = require('./src/grep');
exports.grep = common.wrap('grep', _grep, {idx: 2});

//@include ./src/which
var _which = require('./src/which');
exports.which = common.wrap('which', _which);

//@include ./src/echo
var _echo = require('./src/echo');
exports.echo = common.wrap('echo', _echo);

//@include ./src/dirs
var _dirs = require('./src/dirs').dirs;
exports.dirs = common.wrap('dirs', _dirs, {idx: 1});
var _pushd = require('./src/dirs').pushd;
exports.pushd = common.wrap('pushd', _pushd, {idx: 1});
var _popd = require('./src/dirs').popd;
exports.popd = common.wrap('popd', _popd, {idx: 1});

//@include ./src/ln
var _ln = require('./src/ln');
exports.ln = common.wrap('ln', _ln, {idx: 1});

//@
//@ ### exit(code)
//@ Exits the current process with the given exit code.
exports.exit = process.exit;

//@
//@ ### env['VAR_NAME']
//@ Object containing environment variables (both getter and setter). Shortcut to process.env.
exports.env = process.env;

//@include ./src/exec
var _exec = require('./src/exec');
exports.exec = common.wrap('exec', _exec, {notUnix:true});

//@include ./src/chmod
var _chmod = require('./src/chmod');
exports.chmod = common.wrap('chmod', _chmod, {idx: 1});

//@include ./src/touch
var _touch = require('./src/touch');
exports.touch = common.wrap('touch', _touch, {idx: 1});

//@include ./src/set
var _set = require('./src/set');
exports.set = common.wrap('set', _set);


//@
//@ ## Non-Unix commands
//@

//@include ./src/tempdir
var _tempDir = require('./src/tempdir');
exports.tempdir = common.wrap('tempdir', _tempDir);

//@include ./src/error
var _error = require('./src/error');
exports.error = _error;

//@include ./src/common
exports.ShellString = common.ShellString;

//@
//@ ### Pipes
//@
//@ Examples:
//@
//@ ```javascript
//@ grep('foo', 'file1.txt', 'file2.txt').sed(/o/g, 'a').to('output.txt');
//@ echo('files with o\'s in the name:\n' + ls().grep('o'));
//@ cat('test.js').exec('node'); // pipe to exec() call
//@ ```
//@
//@ Commands can send their output to another command in a pipe-like fashion.
//@ `sed`, `grep`, `cat`, `exec`, `to`, and `toEnd` can appear on the right-hand
//@ side of a pipe. Pipes can be chained.

//@
//@ ## Configuration
//@

exports.config = common.config;

//@
//@ ### config.silent
//@
//@ Example:
//@
//@ ```javascript
//@ var sh = require('shelljs');
//@ var silentState = sh.config.silent; // save old silent state
//@ sh.config.silent = true;
//@ /* ... */
//@ sh.config.silent = silentState; // restore old silent state
//@ ```
//@
//@ Suppresses all command output if `true`, except for `echo()` calls.
//@ Default is `false`.

//@
//@ ### config.fatal
//@
//@ Example:
//@
//@ ```javascript
//@ require('shelljs/global');
//@ config.fatal = true; // or set('-e');
//@ cp('this_file_does_not_exist', '/dev/null'); // throws Error here
//@ /* more commands... */
//@ ```
//@
//@ If `true` the script will throw a Javascript error when any shell.js
//@ command encounters an error. Default is `false`. This is analogous to
//@ Bash's `set -e`

//@
//@ ### config.verbose
//@
//@ Example:
//@
//@ ```javascript
//@ config.verbose = true; // or set('-v');
//@ cd('dir/');
//@ ls('subdir/');
//@ ```
//@
//@ Will print each command as follows:
//@
//@ ```
//@ cd dir/
//@ ls subdir/
//@ ```

//@
//@ ### config.globOptions
//@
//@ Example:
//@
//@ ```javascript
//@ config.globOptions = {nodir: true};
//@ ```
//@
//@ Use this value for calls to `glob.sync()` instead of the default options.
