const fs = require('fs');
const path = require('path');

const test = require('ava');

const shell = require('..');
const utils = require('./utils/utils');

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

function executableFixture(t) {
  const dir = utils.getTempDir();
  fs.mkdirSync(dir);
  const file = dir + '/command';
  fs.writeFileSync(file, '');
  fs.chmodSync(file, 0o755);
  t.teardown(() => fs.rmSync(dir, { recursive: true, force: true }));
  return { dir, file };
}

test('explicit relative path is returned without resolving it', t => {
  const { file } = executableFixture(t);
  const cmd = './' + file;
  const result = shell.which(cmd);
  t.is(result.stdout, cmd);
  t.is(result.code, 0);
  t.falsy(result.stderr);
});

test('explicit path keeps parent segments', t => {
  const { dir, file } = executableFixture(t);
  fs.mkdirSync(dir + '/child');
  const cmd = './' + dir + '/child/../command';
  t.is(shell.which(cmd).stdout, cmd);
  t.deepEqual(Array.from(shell.which('-a', cmd)), [cmd]);
  t.true(fs.existsSync(file));
});

test('all matches preserves an explicit relative path', t => {
  const { file } = executableFixture(t);
  t.deepEqual(Array.from(shell.which('-a', file)), [file]);
  t.falsy(shell.error());
});

test('explicit absolute path is unchanged', t => {
  const { file } = executableFixture(t);
  const cmd = path.resolve(file);
  t.is(shell.which(cmd).stdout, cmd);
  t.deepEqual(Array.from(shell.which('-a', cmd)), [cmd]);
});

test('explicit missing paths and directories are not commands', t => {
  const { dir } = executableFixture(t);
  t.is(shell.which('./' + dir + '/missing'), null);
  t.is(shell.which('./' + dir), null);
  t.deepEqual(Array.from(shell.which('-a', './' + dir)), []);
  t.falsy(shell.error());
});

test('explicit non-executable file is not a command on Unix', t => {
  utils.skipOnWin(t, () => {
    const { file } = executableFixture(t);
    fs.chmodSync(file, 0o644);
    t.is(shell.which('./' + file), null);
    t.deepEqual(Array.from(shell.which('-a', './' + file)), []);
  });
});

// TODO(nate): make sure this does not have a false negative if 'git' is missing
test('basic usage', t => {
  const git = shell.which('git');
  t.is(git.code, 0);
  t.falsy(git.stderr);
  t.falsy(shell.error());
  t.truthy(fs.existsSync(git.toString()));
});

test('Windows can search with or without a .exe extension', t => {
  utils.skipOnUnix(t, () => {
    // This should be equivalent on Windows
    const node = shell.which('node');
    const nodeExe = shell.which('node.exe');
    t.falsy(shell.error());
    // If the paths are equal, then this file *should* exist, since that's
    // already been checked.
    t.is(node.toString(), nodeExe.toString());
  });
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
  t.is(resultForWhich.toString(), resultForWhichA[0]);
});

test('None executable files does not appear in the result list', t => {
  const commandName = 'node'; // Should be an existing command
  const extraPath = path.resolve(__dirname, 'resources', 'which');
  const matchingFile = path.resolve(extraPath, commandName);
  const pathEnv = process.env.PATH;

  // make sure that file is exists (will throw error otherwise)
  t.truthy(fs.existsSync(matchingFile));

  process.env.PATH = extraPath + path.delimiter + process.env.PATH;
  const resultForWhich = shell.which(commandName);
  const resultForWhichA = shell.which('-a', commandName);
  t.falsy(shell.error());
  t.truthy(resultForWhich);
  t.truthy(resultForWhichA);
  t.truthy(resultForWhichA.length);
  t.not(resultForWhich.toString(), matchingFile);
  t.falsy(resultForWhichA.includes(matchingFile));

  process.env.PATH = pathEnv;
});
