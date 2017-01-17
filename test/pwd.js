import path from 'path';

import test from 'ava';

import shell from '..';
import utils from './utils/utils';

const cur = process.cwd();

test.beforeEach(t => {
  t.context.tmp = utils.getTempDir();
  shell.config.resetForTesting();
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
  const cwd = shell.pwd();
  t.falsy(shell.error());
  t.is(cwd.code, 0);
  t.falsy(cwd.stderr);
  t.is(cwd.toString(), path.resolve('.'));
});

test('after changing directory', t => {
  shell.cd(t.context.tmp);
  const cwd = shell.pwd();
  t.is(cwd.code, 0);
  t.falsy(cwd.stderr);
  t.falsy(shell.error());
  t.is(path.basename(cwd.toString()), t.context.tmp);
});
