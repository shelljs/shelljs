import test from 'ava';
import shell from '..';
import fs from 'fs';

test.beforeEach(() => {
  shell.config.silent = true;
});


//
// Valids
//

test('No Test Title #19', t => {
  const tmp = shell.tempdir();
  t.is(shell.error(), null);
  t.is(fs.existsSync(tmp), true);
});
