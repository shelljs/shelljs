import test from 'ava';

import shell from '..';
import utils from './utils/utils';
import mocks from './utils/mocks';

shell.config.silent = true;

test.beforeEach(t => {
  t.context.tmp = utils.getTempDir();
  mocks.init();
});

test.afterEach.always(t => {
  shell.rm('-rf', t.context.tmp);
  mocks.restore();
});

//
// Valids
//

test('simple test with defaults', t => {
  const result = shell.echo('hello', 'world');
  const stdout = mocks.stdout();
  const stderr = mocks.stderr();
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(stdout, 'hello world\n');
  t.is(stderr, '');
});

test('allow arguments to begin with a hyphen', t => {
  // Github issue #20
  const result = shell.echo('-asdf', '111');
  const stdout = mocks.stdout();
  const stderr = mocks.stderr();
  t.falsy(shell.error());
  t.is(result.code, 1);
  t.is(stdout, '-asdf 111\n');
  t.is(stderr, '');
});

test("using null as an explicit argument doesn't crash the function", t => {
  const result = shell.echo(null);
  const stdout = mocks.stdout();
  const stderr = mocks.stderr();
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(stdout, 'null\n');
  t.is(stderr, '');
});

test('-e option', t => {
  const result = shell.echo('-e', '\tmessage');
  const stdout = mocks.stdout();
  const stderr = mocks.stderr();
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(stdout, '\tmessage\n');
  t.is(stderr, '');
});

test('piping to a file', t => {
  // Github issue #476
  shell.mkdir(t.context.tmp);
  const tmp = `${t.context.tmp}/echo.txt`;
  const resultA = shell.echo('A').toEnd(tmp);
  t.falsy(shell.error());
  t.is(resultA.code, 0);
  const resultB = shell.echo('B').toEnd(tmp);
  t.falsy(shell.error());
  t.is(resultB.code, 0);
  const result = shell.cat(tmp);
  const stdout = mocks.stdout();
  const stderr = mocks.stderr();
  t.falsy(shell.error());
  t.is(stdout, 'A\nB\n');
  t.is(stderr, '');
  t.is(result.toString(), 'A\nB\n');
});

test('-n option', t => {
  const result = shell.echo('-n', 'message');
  const stdout = mocks.stdout();
  const stderr = mocks.stderr();
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(stdout, 'message');
  t.is(stderr, '');
});

test('-ne option', t => {
  const result = shell.echo('-ne', 'message');
  const stdout = mocks.stdout();
  const stderr = mocks.stderr();
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(stdout, 'message');
  t.is(stderr, '');
});

test('-en option', t => {
  const result = shell.echo('-en', 'message');
  const stdout = mocks.stdout();
  const stderr = mocks.stderr();
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(stdout, 'message');
  t.is(stderr, '');
});

test('-en option with escaped characters', t => {
  const result = shell.echo('-en', '\tmessage\n');
  const stdout = mocks.stdout();
  const stderr = mocks.stderr();
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(stdout, '\tmessage\n');
  t.is(stderr, '');
});

test('piping to a file with -n', t => {
  // Github issue #476
  shell.mkdir(t.context.tmp);
  const tmp = `${t.context.tmp}/echo.txt`;
  const resultA = shell.echo('-n', 'A').toEnd(tmp);
  t.falsy(shell.error());
  t.is(resultA.code, 0);
  const resultB = shell.echo('-n', 'B').toEnd(tmp);
  t.falsy(shell.error());
  t.is(resultB.code, 0);
  const result = shell.cat(tmp);
  const stdout = mocks.stdout();
  const stderr = mocks.stderr();
  t.falsy(shell.error());
  t.is(stdout, 'AB');
  t.is(stderr, '');
  t.is(result.toString(), 'AB');
});

test('stderr with unrecognized options is empty', t => {
  const result = shell.echo('-asdf');
  const stdout = mocks.stdout();
  const stderr = mocks.stderr();
  t.falsy(shell.error());
  t.is(result.code, 1);
  t.falsy(result.stderr);
  t.is(stdout, '-asdf\n');
  t.is(stderr, '');
});
