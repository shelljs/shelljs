const child = require('child_process');
const path = require('path');
const { promisify } = require('node:util');

const chalk = require('chalk');

const common = require('../../src/common');

// Capture process.stderr.write, otherwise we have a conflict with mocks.js
const _processStderrWrite = process.stderr.write.bind(process.stderr);

function numLines(str) {
  return typeof str === 'string' ? (str.match(/\n/g) || []).length + 1 : 0;
}
exports.numLines = numLines;

function getTempDir() {
  // a very random directory
  return ('tmp' + Math.random() + Math.random()).replace(/\./g, '');
}
exports.getTempDir = getTempDir;

// On Windows, symlinks for files need admin permissions. This helper
// skips certain tests if we are on Windows and got an EPERM error
function skipOnWinForEPERM(action, t, testCase) {
  const ret = action();
  // ret.code is the numeric exit code; the EPERM message text is on
  // ret.stderr (see ShellString in src/common.js). Testing the regex
  // against ret.code meant this never actually matched, so affected
  // tests never skipped on a non-admin Windows environment, they just
  // ran testCase() against a symlink that was never created.
  const error = ret.stderr;
  const isWindows = process.platform === 'win32';
  if (isWindows && error && /EPERM:/.test(error)) {
    _processStderrWrite('Got EPERM when testing symlinks on Windows. Assuming non-admin environment and skipping test.\n');
    // AVA fails a test that finishes without any assertions, which a
    // silent skip would otherwise do.
    t.pass();
  } else {
    testCase();
  }
}
exports.skipOnWinForEPERM = skipOnWinForEPERM;

function runScript(script) {
  const promiseExec = promisify(child.execFile);
  return promiseExec(common.config.execPath, ['-e', script]);
}
exports.runScript = runScript;

function sleep(time) {
  const testDirectoryPath = path.dirname(__dirname);
  child.execFileSync(common.config.execPath, [
    path.join(testDirectoryPath, 'resources', 'exec', 'slow.js'),
    time.toString(),
  ]);
}
exports.sleep = sleep;

function mkfifo(dir) {
  if (process.platform !== 'win32') {
    const fifo = dir + 'fifo';
    child.execFileSync('mkfifo', [fifo]);
    return fifo;
  }
  return null;
}
exports.mkfifo = mkfifo;

function skipIfTrue(booleanValue, t, closure) {
  if (booleanValue) {
    _processStderrWrite(
      chalk.yellow('Warning: skipping platform-dependent test ') +
      chalk.bold.white(`'${t.title}'`) +
      '\n'
    );
    t.truthy(true); // dummy assertion to satisfy ava v0.19+
  } else {
    closure();
  }
}

exports.skipOnUnix = skipIfTrue.bind(module.exports, process.platform !== 'win32');
exports.skipOnWin = skipIfTrue.bind(module.exports, process.platform === 'win32');
