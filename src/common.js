// jshint -W053
// Ignore warning about 'new String()'
'use strict';

var os = require('os');
var fs = require('fs');
var glob = require('glob');
var shell = require('..');
var _to = require('./to');
var _toEnd = require('./toEnd');

var DEFAULT_ERROR_CODE = 1;

// Module globals
var config = {
  silent: false,
  fatal: false,
  verbose: false,
  noglob: false,
  globOptions: {},
  maxdepth: 255
};
exports.config = config;

var state = {
  error: null,
  errorCode: 0,
  currentCmd: 'shell.js',
  tempDir: null
};
exports.state = state;

delete process.env.OLDPWD; // initially, there's no previous directory

var platform = os.type().match(/^Win/) ? 'win' : 'unix';
exports.platform = platform;

function log() {
  if (!config.silent)
    console.error.apply(console, arguments);
}
exports.log = log;

// Shows error message. Throws if config.fatal is true
function error(msg, _code, _continue) {
  if (typeof _code === 'boolean') {
    _continue = _code;
    _code = DEFAULT_ERROR_CODE;
  }
  if (typeof _code !== 'number')
    _code = DEFAULT_ERROR_CODE;

  if (state.errorCode === 0)
    state.errorCode = _code;

  if (state.error === null)
    state.error = '';
  var log_entry = state.currentCmd + ': ' + msg;
  if (state.error === '')
    state.error = log_entry;
  else
    state.error += '\n' + log_entry;

  if(config.fatal)
    throw new Error(log_entry);

  if (msg.length > 0)
    log(log_entry);

  if(!_continue) {
    throw {
      msg: 'earlyExit',
      retValue: (new ShellString('', state.error, state.errorCode))
    };
  }
}
exports.error = error;

//@
//@ ### ShellString(str)
//@
//@ Examples:
//@
//@ ```javascript
//@ var foo = ShellString('hello world');
//@ ```
//@
//@ Turns a regular string into a string-like object similar to what each
//@ command returns. This has special methods, like `.to()` and `.toEnd()`
var ShellString = function (stdout, stderr, code) {
  var that;
  if (stdout instanceof Array) {
    that = stdout;
    that.stdout = stdout.join('\n');
    if (stdout.length > 0) that.stdout += '\n';
  } else {
    that = new String(stdout);
    that.stdout = stdout;
  }
  that.stderr = stderr;
  that.code = code;
  that.to    = function() {wrap('to', _to, {idx: 1}).apply(that.stdout, arguments); return that;};
  that.toEnd = function() {wrap('toEnd', _toEnd, {idx: 1}).apply(that.stdout, arguments); return that;};
  ['cat', 'head', 'sed', 'sort', 'tail', 'grep', 'exec'].forEach(function (cmd) {
    that[cmd] = function() {return shell[cmd].apply(that.stdout, arguments);};
  });
  return that;
};

exports.ShellString = ShellString;

// Return the home directory in a platform-agnostic way, with consideration for
// older versions of node
function getUserHome() {
  var result;
  if (os.homedir)
    result = os.homedir(); // node 3+
  else
    result = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
  return result;
}
exports.getUserHome = getUserHome;

// Returns {'alice': true, 'bob': false} when passed a string and dictionary as follows:
//   parseOptions('-a', {'a':'alice', 'b':'bob'});
// Returns {'reference': 'string-value', 'bob': false} when passed two dictionaries of the form:
//   parseOptions({'-r': 'string-value'}, {'r':'reference', 'b':'bob'});
function parseOptions(opt, map) {
  if (!map)
    error('parseOptions() internal error: no map given');

  // All options are false by default
  var options = {};
  for (var letter in map) {
    if (map[letter][0] !== '!')
      options[map[letter]] = false;
  }

  if (!opt)
    return options; // defaults

  var optionName;
  if (typeof opt === 'string') {
    if (opt[0] !== '-')
      return options;

    // e.g. chars = ['R', 'f']
    var chars = opt.slice(1).split('');

    chars.forEach(function(c) {
      if (c in map) {
        optionName = map[c];
        if (optionName[0] === '!')
          options[optionName.slice(1, optionName.length-1)] = false;
        else
          options[optionName] = true;
      } else {
        error('option not recognized: '+c);
      }
    });
  } else if (typeof opt === 'object') {
    for (var key in opt) {
      // key is a string of the form '-r', '-d', etc.
      var c = key[1];
      if (c in map) {
        optionName = map[c];
        options[optionName] = opt[key]; // assign the given value
      } else {
        error('option not recognized: '+c);
      }
    }
  } else {
    error('options must be strings or key-value pairs');
  }
  return options;
}
exports.parseOptions = parseOptions;

// Expands wildcards with matching (ie. existing) file names.
// For example:
//   expand(['file*.js']) = ['file1.js', 'file2.js', ...]
//   (if the files 'file1.js', 'file2.js', etc, exist in the current dir)
function expand(list) {
  if (!Array.isArray(list)) {
    throw new TypeError('must be an array');
  }
  var expanded = [];
  list.forEach(function(listEl) {
    // Don't expand non-strings
    if (typeof listEl !== 'string') {
      expanded.push(listEl);
    } else {
      var ret = glob.sync(listEl, config.globOptions);
      // if glob fails, interpret the string literally
      expanded = expanded.concat(ret.length > 0 ? ret : [listEl]);
    }
  });
  return expanded;
}
exports.expand = expand;

// Normalizes _unlinkSync() across platforms to match Unix behavior, i.e.
// file can be unlinked even if it's read-only, see https://github.com/joyent/node/issues/3006
function unlinkSync(file) {
  try {
    fs.unlinkSync(file);
  } catch(e) {
    // Try to override file permission
    if (e.code === 'EPERM') {
      fs.chmodSync(file, '0666');
      fs.unlinkSync(file);
    } else {
      throw e;
    }
  }
}
exports.unlinkSync = unlinkSync;

// e.g. 'shelljs_a5f185d0443ca...'
function randomFileName() {
  function randomHash(count) {
    if (count === 1)
      return parseInt(16*Math.random(), 10).toString(16);
    else {
      var hash = '';
      for (var i=0; i<count; i++)
        hash += randomHash(1);
      return hash;
    }
  }

  return 'shelljs_'+randomHash(20);
}
exports.randomFileName = randomFileName;

// extend(target_obj, source_obj1 [, source_obj2 ...])
// Shallow extend, e.g.:
//    extend({A:1}, {b:2}, {c:3}) returns {A:1, b:2, c:3}
function extend(target) {
  var sources = [].slice.call(arguments, 1);
  sources.forEach(function(source) {
    for (var key in source)
      target[key] = source[key];
  });

  return target;
}
exports.extend = extend;

// Common wrapper for all Unix-like commands
function wrap(cmd, fn, options) {
  return function() {
    var retValue = null;

    state.currentCmd = cmd;
    state.error = null;
    state.errorCode = 0;

    try {
      var args = [].slice.call(arguments, 0);

      if (config.verbose) {
        args.unshift(cmd);
        console.error.apply(console, args);
        args.shift();
      }

      if (options && options.notUnix) {
        retValue = fn.apply(this, args);
      } else {
        if (args[0] instanceof Object && args[0].constructor.name === 'Object') {
          args = args; // object count as options
        } else if (args.length === 0 || typeof args[0] !== 'string' || args[0].length <= 1 || args[0][0] !== '-') {
          args.unshift(''); // only add dummy option if '-option' not already present
        }

        args = args.reduce(function(accum, cur) {
          if (Array.isArray(cur)) {
            return accum.concat(cur);
          } else {
            accum.push(cur);
            return accum;
          }
        }, []);
        // Convert ShellStrings to regular strings
        args = args.map(function(arg) {
          if (arg instanceof Object && arg.constructor.name === 'String') {
            return arg.toString();
          } else
            return arg;
        });
        // Expand the '~' if appropriate
        var homeDir = getUserHome();
        args = args.map(function(arg) {
          if (typeof arg === 'string' && arg.slice(0, 2) === '~/' || arg === '~')
            return arg.replace(/^~/, homeDir);
          else
            return arg;
        });
        if (!config.noglob && options && typeof options.idx === 'number')
          args = args.slice(0, options.idx).concat(expand(args.slice(options.idx)));
        try {
          retValue = fn.apply(this, args);
        } catch (e) {
          if (e.msg === 'earlyExit')
            retValue = e.retValue;
          else throw e;
        }
      }
    } catch (e) {
      if (!state.error) {
        // If state.error hasn't been set it's an error thrown by Node, not us - probably a bug...
        console.error('shell.js: internal error');
        console.error(e.stack || e);
        process.exit(1);
      }
      if (config.fatal)
        throw e;
    }

    state.currentCmd = 'shell.js';
    return retValue;
  };
} // wrap
exports.wrap = wrap;

function _readFromPipe(that) {
  return that instanceof String ? that.toString() : '';
}
exports.readFromPipe = _readFromPipe;
