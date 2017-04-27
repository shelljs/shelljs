/* eslint-disable prefer-rest-params */

let stdoutValue = '';
let stderrValue = '';
let stdinValue = null;

const oldConsoleLog = console.log;
const oldConsoleError = console.error;
const oldStdoutWrite = process.stdout.write;
const oldProcessExit = process.exit;

function consoleLog() {                // mock console.log
  const msgs = [].slice.call(arguments);
  stdoutValue += msgs.join(' ') + '\n';
}

function consoleError() {              // mock console.error
  const msgs = [].slice.call(arguments);
  stderrValue += msgs.join(' ') + '\n';
}

function stdoutWrite(msg) {            // mock process.stdout.write
  stdoutValue += msg;
  return true;
}

function processExit(retCode) {        // mock process.exit
  const e = new Error('process.exit was called');
  e.code = retCode || 0;
  throw e;
}

function resetValues() {
  stdoutValue = '';
  stderrValue = '';
}

function stdout() {
  return stdoutValue;
}
exports.stdout = stdout;

function stderr() {
  return stderrValue;
}
exports.stderr = stderr;

function stdin(val) {
  // If called with no arg, return the mocked stdin. Otherwise set stdin to that
  // arg
  if (val === undefined) return stdinValue;
  stdinValue = val;
  return null;
}
exports.stdin = stdin;

function init() {
  resetValues();
  console.log = consoleLog;
  console.error = consoleError;
  process.stdout.write = stdoutWrite;
  process.exit = processExit;
}
exports.init = init;

function restore() {
  console.log = oldConsoleLog;
  console.error = oldConsoleError;
  process.stdout.write = oldStdoutWrite;
  process.exit = oldProcessExit;
}
exports.restore = restore;
