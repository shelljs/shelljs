require('../maker');

var assert = require('assert'),
    path = require('path');

var callStack = [];

callStack.push('__bare__');

target.all = function() {
  callStack.push('all');

  target.test1();
  target.test3(); // already executed by test2 - shouldn't get called again
}

target.test1 = function() {
  callStack.push('test1');
  target.test2();
}

target.test2 = function() {
  callStack.push('test2');
  target.test3();
}

target.test3 = function() {
  callStack.push('test3');
}

setTimeout(function() {
  assert.equal(callStack.length, 5);
  assert.equal(callStack[0], '__bare__');
  assert.equal(callStack[1], 'all');
  assert.equal(callStack[2], 'test1');
  assert.equal(callStack[3], 'test2');
  assert.equal(callStack[4], 'test3');

  exit(123);
}, 0);
