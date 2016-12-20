import fs from 'fs';

import test from 'ava';

import shell from '..';

shell.config.silent = true;


//
// Valids
//

test('basic usage', t => {
  const tmp = shell.tempdir();
  t.falsy(shell.error());
  t.truthy(fs.existsSync(tmp));

  // It's a directory
  t.truthy(shell.test('-d', tmp));
});
