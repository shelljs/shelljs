var shell = require('./shell.js');
for (var cmd in shell)
  global[cmd] = shell[cmd];
module.exports = shell;
