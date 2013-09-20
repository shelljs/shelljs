var shelljs = require('..'),
    assert = require('assert');

// should be an array
var pathArray = shelljs.path();
assert(pathArray instanceof Array);

// should include npm somewhere
var found = false;
for (var i = pathArray.length - 1; i >= 0; i--) {
  if (~pathArray[i].indexOf('npm')) {
    found = true;
    break;
  }
}
assert(found, 'path should include npm');

// set path
shelljs.path(__dirname);
var env = process.env.PATH || process.env.Path || process.env.path;
assert(~env.indexOf(__dirname), 'should add to path');

shelljs.exit(123);
