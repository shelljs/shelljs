import path from 'path';

import test from 'ava';

import shell from '..';

const binPath = path.resolve(__dirname, '../bin/shjs');

function runWithShjs(name) {
  // prefix with 'node ' for Windows, don't prefix for unix
  const execPath = process.platform === 'win32'
    ? `${JSON.stringify(shell.config.execPath)} `
    : '';
  const script = path.resolve(__dirname, 'resources', 'shjs', name);
  return shell.exec(`${execPath}${binPath} ${script}`, { silent: true });
}

//
// Valids
//

test('Non-zero exit code', t => {
  const result = runWithShjs('exit-codes.js');
  t.is(result.code, 42);
  t.is(result.stdout, '');
  t.falsy(result.stderr);
});

test('Zero exit code', t => {
  const result = runWithShjs('exit-0.js');
  t.is(result.code, 0);
  t.is(result.stdout, '');
  t.falsy(result.stderr);
});

test('Stdout/Stderr', t => {
  const result = runWithShjs('stdout-stderr.js');
  t.is(result.code, 0);
  t.is(result.stdout, 'stdout: OK!\n');
  t.is(result.stderr, 'stderr: OK!\n');
});

test('CoffeeScript', t => {
  const result = runWithShjs('coffeescript.coffee');
  t.is(result.code, 0);
  t.is(result.stdout, 'CoffeeScript: OK!\n');
  t.falsy(result.stderr);
});

test('Extension detection', t => {
  const result = runWithShjs('a-file');
  t.is(result.code, 0);
  t.is(result.stdout, 'OK!\n');
  t.falsy(result.stderr);
});

//
// Invalids
//

test('disallow require-ing', t => {
  t.throws(() => require(binPath), 'Executable-only module should not be required');
});
