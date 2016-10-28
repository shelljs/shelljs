import test from 'ava';
import shell from '..';
import path from 'path';

const TMP = require('./utils/utils').getTempDir();
const cur = process.cwd();

test.beforeEach(() => {
  shell.config.silent = true;
  shell.mkdir(TMP);
});

test.afterEach(() => {
  process.chdir(cur);
  shell.rm('-rf', TMP);
});


//
// Valids
//

test('No Test Title #81', t => {
  const _pwd = shell.pwd();
  t.is(shell.error(), null);
  t.is(_pwd.code, 0);
  t.falsy(_pwd.stderr);
  t.is(_pwd.toString(), path.resolve('.'));
});

test('No Test Title #82', t => {
  shell.cd(TMP);
  const _pwd = shell.pwd();
  t.is(_pwd.code, 0);
  t.falsy(_pwd.stderr);
  t.is(shell.error(), null);
  t.is(path.basename(_pwd.toString()), TMP);
});
