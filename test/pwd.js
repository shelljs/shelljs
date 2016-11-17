import test from 'ava';
import shell from '..';
import path from 'path';
import utils from './utils/utils';

const cur = process.cwd();

test.beforeEach(t => {
  t.context.tmp = utils.getTempDir();
  shell.config.silent = true;
  shell.mkdir(t.context.tmp);
});

test.afterEach.always(t => {
  process.chdir(cur);
  shell.rm('-rf', t.context.tmp);
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
  shell.cd(t.context.tmp);
  const _pwd = shell.pwd();
  t.is(_pwd.code, 0);
  t.falsy(_pwd.stderr);
  t.falsy(shell.error());
  t.is(path.basename(_pwd.toString()), t.context.tmp);
});
