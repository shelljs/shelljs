import test from 'ava';
import shell from '..';
import fs from 'fs';

let TMP;

test.beforeEach(() => {
  TMP = require('./utils/utils').getTempDir();
  shell.config.silent = true;

  shell.rm('-rf', TMP);
  shell.mkdir(TMP);
});


//
// Invalids
//

test('No Test Title #57', t => {
  shell.which();
  t.truthy(shell.error());
});

test('No Test Title #58', t => {
  const result = shell.which('asdfasdfasdfasdfasdf'); // what are the odds...
  t.truthy(!shell.error());
  t.truthy(!result);
});

//
// Valids
//

test('No Test Title #59', t => {
  const node = shell.which('node');
  t.is(node.code, 0);
  t.truthy(!node.stderr);
  t.truthy(!shell.error());
  t.truthy(fs.existsSync(node + ''));
});

test('No Test Title #60', t => {
  if (process.platform === 'win32') {
    // This should be equivalent on Windows
    const node = shell.which('node');
    const nodeExe = shell.which('node.exe');
    t.truthy(!shell.error());
    // If the paths are equal, then this file *should* exist, since that's
    // already been checked.
    t.is(node + '', nodeExe + '');
  }
});
