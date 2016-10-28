import test from 'ava';
import shell from '..';

const TMP = require('./utils/utils').getTempDir();

test.beforeEach(() => {
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
