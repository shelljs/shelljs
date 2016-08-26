import test from 'ava';
import shell from '..';
import path from 'path';

function runScript(name) {
  // prefix with 'node ' for Windows, don't prefix for OSX/Linux
  const cmd = (process.platform === 'win32' ? JSON.stringify(process.execPath) + ' ' : '') + path.resolve(__dirname, '../bin/shjs');
  const script = path.resolve(__dirname, 'resources', 'shjs', name);
  return shell.exec(cmd + ' ' + script, { silent: true });
}

//
// Valids
//

test('Exit Codes', t => {
  t.is(runScript('exit-codes.js').code, 42, 'exit code works');
  t.is(runScript('exit-0.js').code, 0, 'exiting 0 works');
});

test('Stdout/Stderr', t => {
  const stdioRet = runScript('stdout-stderr.js');
  t.is(stdioRet.stdout, 'stdout: OK!\n', 'stdout works');
  t.is(stdioRet.stderr, 'stderr: OK!\n', 'stderr works');
});

test('CoffeeScript', t => {
  t.is(runScript('coffeescript.coffee').stdout, 'CoffeeScript: OK!\n');
});

test('Extension detection', t => {
  const extDetectRet = runScript('a-file');
  t.is(extDetectRet.code, 0, 'error code works');
  t.is(extDetectRet.stdout, 'OK!\n', 'stdout works');
});
