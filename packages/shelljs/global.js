var shell = require('./shell.js');
var common = require('./src/common');
for (var cmd in shell)
  global[cmd] = shell[cmd];

var _to = require('./src/to');
String.prototype.to = common.wrap('to', _to);

var _toEnd = require('./src/toEnd');
String.prototype.toEnd = common.wrap('toEnd', _toEnd);
