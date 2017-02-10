import fs from 'fs';

import test from 'ava';

import shell from '..';

shell.config.silent = true;

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
  const git = shell.which('git');
  t.is(git.code, 0);
  t.falsy(git.stderr);
  t.falsy(shell.error());
  t.truthy(fs.existsSync(git.toString()));
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

test('Searching with -a flag returns an array', t => {
  const commandName = 'node'; // Should be an existing command
  const result = shell.which('-a', commandName);
  t.falsy(shell.error());
  t.truthy(result);
  t.not(result.length, 0);
});

test('Searching with -a flag for not existing command returns an empty array', t => {
  const notExist = '6ef25c13209cb28ae465852508cc3a8f3dcdc71bc7bcf8c38379ba38me';
  const result = shell.which('-a', notExist);
  t.falsy(shell.error());
  t.is(result.length, 0);
});

test('Searching with -a flag returns an array with first item equals to the regular search', t => {
  const commandName = 'node'; // Should be an existing command
  const resultForWhich = shell.which(commandName);
  const resultForWhichA = shell.which('-a', commandName);
  t.falsy(shell.error());
  t.truthy(resultForWhich);
  t.truthy(resultForWhichA);
  t.is(resultForWhich.toString(), resultForWhichA[0].toString());
});
