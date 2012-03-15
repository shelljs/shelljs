var shell = require('..');

var assert = require('assert'),
    path = require('path'),
    fs = require('fs');

shell.silent(true);

function numLines(str) {
  return typeof str === 'string' ? str.match(/\n/g).length : 0;
}

//
// Invalids
//

shell.exec();
assert.ok(shell.error());

var result = shell.exec('asdfasdf'); // could not find command
assert.ok(result.code > 0);


//
// Valids
//

var result = shell.exec('node -e \"console.log(1234);\"'); // stdout
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.ok(result.output === '1234\n' || result.output === '1234\nundefined\n'); // 'undefined' for v0.4

var result = shell.exec('node -e \"process.exit(12);\"'); // stdout
assert.equal(shell.error(), null);
assert.equal(result.code, 12);

var result = shell.exec('node -e \"console.error(1234);\"'); // stderr
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.ok(result.output === '1234\n' || result.output === '1234\nundefined\n'); // 'undefined' for v0.4

var result = shell.exec('node -e \"console.error(1234); console.log(666);\"'); // stderr + stdout
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.ok(result.output === '1234\n666\n' || result.output === '1234\n666\nundefined\n');  // 'undefined' for v0.4

// Interaction with cd
shell.cd('resources/external');
var result = shell.exec('node node_script.js');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.output, 'node_script_1234\n');

// Async
var asyncFlags = [];

asyncFlags[0] = false;
shell.exec('node -e \"console.log(1234);\"', {async:true}, function(code, output) { // callback as 2nd argument
  assert.equal(code, 0);
  assert.ok(output === '1234\n' || output === '1234\nundefined\n');  // 'undefined' for v0.4
  asyncFlags[0] = true;
});
assert.equal(shell.error(), null);

shell.exec('node -e \"console.log(1234)\"', {async:true}); // no callback
assert.equal(shell.error(), null);

setTimeout(function() {
  asyncFlags.forEach(function(flag) {
    assert.equal(flag, true);
  });

  shell.exit(123);  
}, 2000);
