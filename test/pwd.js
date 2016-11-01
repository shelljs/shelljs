import test from 'ava';
import shell from '..';
import path from 'path';
import utils from './utils/utils';

let TMP;
const cur = process.cwd();

test.beforeEach(() => {
  TMP = utils.getTempDir();
  shell.config.silent = true;
  shell.mkdir(TMP);
});

test.afterEach.always(() => {
  process.chdir(cur);
  shell.rm('-rf', TMP);
});


//
// Valids
//

test('initial directory', t => {
  const _pwd = shell.pwd();
  t.falsy(shell.error());
  t.is(_pwd.code, 0);
  t.falsy(_pwd.stderr);
  t.is(_pwd.toString(), path.resolve('.'));
});

test('after changing directory', t => {
  shell.cd(TMP);
  const _pwd = shell.pwd();
  t.is(_pwd.code, 0);
  t.falsy(_pwd.stderr);
  t.falsy(shell.error());
  t.is(path.basename(_pwd.toString()), TMP);
});
