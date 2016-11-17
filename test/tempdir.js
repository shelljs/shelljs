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
  t.falsy(shell.error());
  t.truthy(fs.existsSync(tmp));
});
