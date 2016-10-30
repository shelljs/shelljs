import test from 'ava';
import shell from '..';
import fs from 'fs';

test.beforeEach(() => {
  shell.config.silent = true;
});


//
// Valids
//

test('basic usage', t => {
  const tmp = shell.tempdir();
  t.is(shell.error(), null);
  t.is(fs.existsSync(tmp), true);
});
