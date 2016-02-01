var shell = require('./shell.js');
for (var cmd in shell) {
  if (shell.hasOwnProperty(cmd)) {
    global[cmd] = shell[cmd];
  }
}
