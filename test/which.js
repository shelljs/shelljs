import test from 'ava';
import shell from '..';
import fs from 'fs';

test.beforeEach(() => {
  shell.config.silent = true;
});

//
// Invalids
//

test('no args', t => {
  shell.which();
  t.truthy(shell.error());
});

test('command does not exist in the path', t => {
  const result = shell.which('asdfasdfasdfasdfasdf'); // what are the odds...
  t.falsy(shell.error());
  t.falsy(result);
});

//
// Valids
//

// TODO(nate): make sure this does not have a false negative if 'git' is missing
test('basic usage', t => {
  const node = shell.which('git');
  t.is(node.code, 0);
  t.falsy(node.stderr);
  t.falsy(shell.error());
  t.truthy(fs.existsSync(node.toString()));
});

test('Windows can search with or without a .exe extension', t => {
  if (process.platform === 'win32') {
    // This should be equivalent on Windows
    const node = shell.which('node');
    const nodeExe = shell.which('node.exe');
    t.falsy(shell.error());
    // If the paths are equal, then this file *should* exist, since that's
    // already been checked.
    t.is(node.toString(), nodeExe.toString());
  }
});
