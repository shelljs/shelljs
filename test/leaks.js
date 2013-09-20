
var globals = Object.keys(global);

var shell = require('..'),
    assert = require('assert');

Object.keys(global).forEach(function (leak) {
  assert(globals.indexOf(leak) !== -1, 'leaked global: "' + leak + '"');
});

shell.exit(123);
