# ShellJS
## Unix shell commands for Node.js

[![Join the chat at https://gitter.im/shelljs/shelljs](https://badges.gitter.im/shelljs/shelljs.svg)](https://gitter.im/shelljs/shelljs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/shelljs/shelljs.svg?branch=master)](http://travis-ci.org/shelljs/shelljs)
[![Build status](https://ci.appveyor.com/api/projects/status/42txr0s3ux5wbumv/branch/master?svg=true)](https://ci.appveyor.com/project/shelljs/shelljs)

ShellJS is a portable **(Windows/Linux/OS X)** implementation of Unix shell commands on top of the
Node.js API. You can use it to eliminate your shell script's dependency on Unix while still keeping
its familiar and powerful commands. You can also install it globally so you can run it from outside
Node projects - say goodbye to those gnarly Bash scripts!

ShellJS supports node `v0.11`, `v0.12`, `v4`, `v5`, `v6`, and all releases of iojs.

The project is [unit-tested](http://travis-ci.org/shelljs/shelljs) and battled-tested in projects like:

+ [PDF.js](http://github.com/mozilla/pdf.js) - Firefox's next-gen PDF reader
+ [Firebug](http://getfirebug.com/) - Firefox's infamous debugger
+ [JSHint](http://jshint.com) - Most popular JavaScript linter
+ [Zepto](http://zeptojs.com) - jQuery-compatible JavaScript library for modern browsers
+ [Yeoman](http://yeoman.io/) - Web application stack and development tool
+ [Deployd.com](http://deployd.com) - Open source PaaS for quick API backend generation
+ And [many more](https://npmjs.org/browse/depended/shelljs).

If you have feedback, suggestions, or need help, feel free to post in our [issue tracker](https://github.com/shelljs/shelljs/issues).

Think ShellJS is cool? Check out some related projects (like
[cash](https://github.com/dthree/cash)--a javascript-based POSIX shell)
in our [Wiki page](https://github.com/shelljs/shelljs/wiki)!

Upgrading from an older version? Check out our [breaking
changes](https://github.com/shelljs/shelljs/wiki/Breaking-Changes) page to see
what changes to watch out for while upgrading.

## Command line use

If you just want cross platform UNIX commands, checkout our new project
[shelljs/shx](https://github.com/shelljs/shx), a utility to expose `shelljs` to
the command line.

For example:

```
$ shx mkdir -p foo
$ shx touch foo/bar.txt
$ shx rm -rf foo
```

## A quick note about the docs

For documentation on all the latest features, check out our
[README](https://github.com/shelljs/shelljs). To read docs that are consistent
with the latest release, check out [the npm
page](https://www.npmjs.com/package/shelljs) or
[shelljs.org](http://documentup.com/shelljs/shelljs).

## Installing

Via npm:

```bash
$ npm install [-g] shelljs
```

If the global option `-g` is specified, the binary `shjs` will be installed. This makes it possible to
run ShellJS scripts much like any shell script from the command line, i.e. without requiring a `node_modules` folder:

```bash
$ shjs my_script
```

## Examples

### JavaScript

```javascript
require('shelljs/global');

if (!which('git')) {
  echo('Sorry, this script requires git');
  exit(1);
}

// Copy files to release dir
rm('-rf', 'out/Release');
cp('-R', 'stuff/', 'out/Release');

// Replace macros in each .js file
cd('lib');
ls('*.js').forEach(function(file) {
  sed('-i', 'BUILD_VERSION', 'v0.1.2', file);
  sed('-i', /^.*REMOVE_THIS_LINE.*$/, '', file);
  sed('-i', /.*REPLACE_LINE_WITH_MACRO.*\n/, cat('macro.js'), file);
});
cd('..');

// Run external tool synchronously
if (exec('git commit -am "Auto-commit"').code !== 0) {
  echo('Error: Git commit failed');
  exit(1);
}
```

## Global vs. Local

The example above uses the convenience script `shelljs/global` to reduce verbosity. If polluting your global namespace is not desirable, simply require `shelljs`.

Example:

```javascript
var $ = require('shelljs');
$.echo('hello world');
```

