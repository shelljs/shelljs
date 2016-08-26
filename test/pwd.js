import test from 'ava';
import shell from '..';
import path from 'path';

let TMP;

test.beforeEach(() => {
  TMP = require('./utils/utils').getTempDir();
  shell.config.silent = true;

  shell.rm('-rf', TMP);
  shell.mkdir(TMP);
});


//
// Valids
//

test('No Test Title #81', t => {
  const _pwd = shell.pwd();
  t.is(shell.error(), null);
  t.is(_pwd.code, 0);
  t.truthy(!_pwd.stderr);
  t.is(_pwd.toString(), path.resolve('.'));
});

test('No Test Title #82', t => {
  shell.cd(TMP);
  const _pwd = shell.pwd();
  t.is(_pwd.code, 0);
  t.truthy(!_pwd.stderr);
  t.is(shell.error(), null);
  t.is(path.basename(_pwd.toString()), TMP);
});
