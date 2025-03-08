//
// ShellJS
// Unix shell commands on top of Node's API
//
// Copyright (c) 2012 Artur Adib
// http://github.com/shelljs/shelljs
//

var common = require('./src/common');

//@
//@ All commands run synchronously, unless otherwise stated.
//@ All commands accept standard bash globbing characters (`*`, `?`, etc.),
//@ compatible with [`fast-glob`](https://www.npmjs.com/package/fast-glob).
//@
//@ For less-commonly used commands and features, please check out our [wiki
//@ page](https://github.com/shelljs/shelljs/wiki).
//@

// Include the docs for all the default commands
//@commands

// Load all default commands. We import these for their side effect of loading
// using the plugin architecture via `common.register()`.
require('./src/cat');
require('./src/cd');
require('./src/chmod');
require('./src/cmd');
require('./src/cp');
require('./src/dirs');
require('./src/echo');
require('./src/exec');
require('./src/exec-child'); // A hint to the bundler to keep exec-child.js
require('./src/find');
require('./src/grep');
require('./src/head');
require('./src/ln');
require('./src/ls');
require('./src/mkdir');
require('./src/mv');
require('./src/popd');
require('./src/pushd');
require('./src/pwd');
require('./src/rm');
require('./src/sed');
require('./src/set');
require('./src/sort');
require('./src/tail');
require('./src/tempdir');
require('./src/test');
require('./src/to');
require('./src/toEnd');
require('./src/touch');
require('./src/uniq');
require('./src/which');

//@
//@ ### exit(code)
//@
//@ Exits the current process with the given exit `code`.
exports.exit = function exit(code) {
  common.state.error = null;
  common.state.errorCode = 0;
  if (code) {
    common.error('exit', {
      continue: true,
      code: code,
      prefix: '',
      silent: true,
      fatal: false,
    });
    process.exit(code);
  } else {
    process.exit();
  }
};

//@include ./src/error.js
exports.error = require('./src/error');

//@include ./src/errorCode.js
exports.errorCode = require('./src/errorCode');

//@include ./src/common.js
exports.ShellString = common.ShellString;

//@
//@ ### env['VAR_NAME']
//@
//@ Object containing environment variables (both getter and setter). Shortcut
//@ to `process.env`.
exports.env = process.env;

//@
//@ ### Pipes
//@
//@ Examples:
//@
//@ ```javascript
//@ grep('foo', 'file1.txt', 'file2.txt').sed(/o/g, 'a').to('output.txt');
//@ echo("files with o's in the name:\n" + ls().grep('o'));
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
//@ If `true`, the script will throw a Javascript error when any shell.js
//@ command encounters an error. Default is `false`. This is analogous to
//@ Bash's `set -e`.

//@
//@ ### config.verbose
//@
//@ Example:
//@
//@ ```javascript
//@ config.verbose = true; // or set('-v');
//@ cd('dir/');
//@ rm('-rf', 'foo.txt', 'bar.txt');
//@ exec('echo hello');
//@ ```
//@
//@ Will print each command as follows:
//@
//@ ```
//@ cd dir/
//@ rm -rf foo.txt bar.txt
//@ exec echo hello
//@ ```

//@
//@ ### config.globOptions (deprecated)
//@
//@ **Deprecated**: we recommend that you do not edit `config.globOptions`.
//@ Support for this configuration option may be changed or removed in a future
//@ ShellJS release.
//@
//@ **Breaking change**: ShellJS v0.8.x uses `node-glob`. Starting with ShellJS
//@ v0.9.x, `config.globOptions` is compatible with `fast-glob`.
//@
//@ Example:
//@
//@ ```javascript
//@ config.globOptions = {nodir: true};
//@ ```
//@
//@ `config.globOptions` changes how ShellJS expands glob (wildcard)
//@ expressions. See
//@ [fast-glob](https://github.com/mrmlnc/fast-glob?tab=readme-ov-file#options-3)
//@ for available options. Be aware that modifying `config.globOptions` **may
//@ break ShellJS functionality.**

//@
//@ ### config.reset()
//@
//@ Example:
//@
//@ ```javascript
//@ var shell = require('shelljs');
//@ // Make changes to shell.config, and do stuff...
//@ /* ... */
//@ shell.config.reset(); // reset to original state
//@ // Do more stuff, but with original settings
//@ /* ... */
//@ ```
//@
//@ Reset `shell.config` to the defaults:
//@
//@ ```javascript
//@ {
//@   fatal: false,
//@   globOptions: {},
//@   maxdepth: 255,
//@   noglob: false,
//@   silent: false,
//@   verbose: false,
//@ }
//@ ```
