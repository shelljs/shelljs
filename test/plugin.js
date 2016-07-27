var plugin = require('../plugin');
var shell = require('..');

var assert = require('assert');

shell.config.silent = true;

var data = 0;
var ret;
var fname;

function fooImplementation(options, arg) {
  // Some sort of side effect, so we know when this is called
  if (arg)
    fname = arg;
  else
    fname = plugin.readFromPipe(this);

  if (arg === 'exitWithCode5')
    plugin.error('Exited with code 5', 5);

  if (options.flag)
    data = 12;
  else
    data++;
  return 'hello world';
}

// All plugin utils exist
assert.equal(typeof plugin.error, 'function');
assert.equal(typeof plugin.parseOptions, 'function');
assert.equal(typeof plugin.readFromPipe, 'function');
assert.equal(typeof plugin.register, 'function');

// The plugin does not exist before it's registered
assert.ok(!shell.foo);

// Register the plugin
plugin.register('foo', fooImplementation, {
  cmdOptions: {
    'f': 'flag',
  },
  wrapOutput: true,
  canReceivePipe: true,
});

// The plugin exists after registering
assert.equal(typeof shell.foo, 'function');

// The command fails for invalid options
ret = shell.foo('-n', 'filename');
assert.equal(ret.code, 1);
assert.equal(ret.stdout, '');
assert.equal(ret.stderr, 'foo: option not recognized: n');
assert.equal(shell.error(), 'foo: option not recognized: n');

// The command succeeds for normal calls
assert.equal(data, 0);
shell.foo('filename');
assert.equal(data, 1);
assert.equal(fname, 'filename');
shell.foo('filename2');
assert.equal(data, 2);
assert.equal(fname, 'filename2');

// The command parses options
shell.foo('-f', 'filename');
assert.equal(data, 12);
assert.equal(fname, 'filename');

// The command supports globbing by default
shell.foo('-f', 're*u?ces');
assert.equal(data, 12);
assert.equal(fname, 'resources');

// Plugins are also compatible with shelljs/global
require('../global');
assert.equal(typeof global.foo, 'function');
assert.equal(global.foo, shell.foo);

// Plugins can be added as methods to ShellStrings
ret = shell.ShellString('hello world\n');
assert.equal(ret.toString(), 'hello world\n');
assert.equal(typeof ret.grep, 'function'); // existing methods persist
assert.equal(typeof ret.foo, 'function');
ret.foo();
assert.equal(fname, 'hello world\n'); // readFromPipe() works

// Plugins can signal errors
ret = shell.foo('exitWithCode5');
assert.equal(ret.code, 5);
assert.equal(ret.stdout, '');
assert.equal(ret.stderr, 'foo: Exited with code 5');
assert.equal(shell.error(), 'foo: Exited with code 5');

shell.exit(123);
