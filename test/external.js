require('../maker');

var assert = require('assert'),
    path = require('path'),
    fs = require('fs');

silent();

function numLines(str) {
  return typeof str === 'string' ? str.match(/\n/g).length : 0;
}

shell.rm('-rf', 'tmp');
shell.mkdir('tmp')

//
// Invalids
//

external();
assert.ok(error());

var ext = external('asdfasdf'); // could not find command
assert.equal(ext, null);

var threw = false;
try {
  var ext = external('asdfasdf', {required:true}); // could not find command
} catch(e) {
  threw = true;
}
assert.ok(error());
assert.equal(ext, null);
assert.equal(threw, true);


//
// Valids
//

var node = external('node');
assert.equal(error(), null);
var result = node('-e \"console.log(1234);\"'); // stdout
assert.equal(result.code, 0);
assert.ok(result.output === '1234\n' || result.output === '1234\nundefined\n'); // 'undefined' for v0.4

var node = external('node');
assert.equal(error(), null);
var result = node('-e \"process.exit(12);\"'); // stdout
assert.equal(result.code, 12);

var node = external('node');
assert.equal(error(), null);
var result = node('-e \"console.error(1234);\"'); // stderr
assert.equal(result.code, 0);
assert.ok(result.output === '1234\n' || result.output === '1234\nundefined\n'); // 'undefined' for v0.4

var node = external('node');
assert.equal(error(), null);
var result = node('-e \"console.error(1234); console.log(666);\"'); // stderr + stdout
assert.equal(result.code, 0);
assert.ok(result.output === '1234\n666\n' || result.output === '1234\n666\nundefined\n');  // 'undefined' for v0.4

// Interaction with cd
cd('resources/external');
var node = external('node');
assert.equal(error(), null);
var result = node('node_script.js');
assert.equal(result.code, 0);
assert.equal(result.output, 'node_script_1234\n');

// Async
var asyncFlags = [];

asyncFlags[0] = false;
var node = external('node', {async:true});
assert.equal(error(), null);
node('-e \"console.log(1234);\"', function(code, output) { // callback as 2nd argument
  assert.equal(code, 0);
  assert.ok(output === '1234\n' || output === '1234\nundefined\n');  // 'undefined' for v0.4
  asyncFlags[0] = true;
});

// Async
asyncFlags[1] = false;
var node = external('node', {async:true});
assert.equal(error(), null);
node('-e \"console.log(1234);\"', {some:'option'}, function(code, output) { // callback as 3rd argument
  assert.equal(code, 0);
  assert.ok(output === '1234\n' || output === '1234\nundefined\n');  // 'undefined' for v0.4
  asyncFlags[1] = true;
});

// Async
var node = external('node', {async:true});
assert.equal(error(), null);
node('-e \"console.log(1234)\"'); // no callback
assert.equal(error(), null);

setTimeout(function() {
  asyncFlags.forEach(function(flag) {
    assert.equal(flag, true);
  });

  exit(123);  
}, 2000);
