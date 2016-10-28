import test from 'ava';
import shell from '..';
import utils from './utils/utils';

let TMP;

test.beforeEach(() => {
  TMP = utils.getTempDir();
  shell.config.silent = true;
  shell.mkdir(TMP);
});

test.afterEach(() => {
  shell.rm('-rf', TMP);
});


//
// Valids
//

test('existing variables', t => {
  t.is(shell.env.PATH, process.env.PATH);
});

test('variables are exported', t => {
  shell.env.SHELLJS_TEST = 'hello world';
  t.is(shell.env.SHELLJS_TEST, process.env.SHELLJS_TEST);
});
