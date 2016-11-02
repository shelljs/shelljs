import test from 'ava';
import shell from '..';
import utils from './utils/utils';

test.beforeEach(t => {
  t.context.tmp = utils.getTempDir();
  shell.config.silent = true;
  shell.mkdir(t.context.tmp);
});

test.afterEach.always(t => {
  shell.rm('-rf', t.context.tmp);
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
