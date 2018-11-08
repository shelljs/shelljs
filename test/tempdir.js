import fs from 'fs';

import test from 'ava';

import shell from '..';
import { isCached, clearCache } from '../src/tempdir';

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

test('cache', t => {
  clearCache(); // In case this runs after any test which relies on tempdir().
  t.falsy(isCached());
  const tmp1 = shell.tempdir();
  t.truthy(isCached());
  const tmp2 = shell.tempdir();
  t.is(tmp1, tmp2);
});
