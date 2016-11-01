import test from 'ava';
import shell from '..';
import path from 'path';
import fs from 'fs';
import utils from './utils/utils';

let TMP;

test.beforeEach(() => {
  TMP = utils.getTempDir();
  shell.config.silent = true;
  shell.cp('-r', 'resources', TMP);
});

test.afterEach(() => {
  shell.rm('-rf', TMP);
});


//
// Invalids
//

test('no args', t => {
  const result = shell.rm();
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'rm: no paths given');
});

test('file does not exist', t => {
  const result = shell.rm('asdfasdf');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'rm: no such file or directory: asdfasdf');
});

test('only an option', t => {
  const result = shell.rm('-f');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'rm: no paths given');
});

test('invalid option', t => {
  const result = shell.rm('-@', 'resources/file1');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(fs.existsSync('resources/file1'), true);
  t.is(result.stderr, 'rm: option not recognized: @');
});

//
// Valids
//

test('file does not exist, but -f specified', t => {
  const result = shell.rm('-f', 'asdfasdf');
  t.falsy(shell.error());
  t.is(result.code, 0);
});

test('directory does not exist, but -fr specified', t => {
  const result = shell.rm('-fr', 'fake_dir/');
  t.falsy(shell.error());
  t.is(result.code, 0);
});

test('directory does not exist, but *only -f* specified', t => {
  const result = shell.rm('-f', 'fake_dir/');
  t.falsy(shell.error());
  t.is(result.code, 0);
});

test('file (in fake dir) does not exist, but -f specified', t => {
  const result = shell.rm('-f', 'fake_dir/asdfasdf');
  t.falsy(shell.error());
  t.is(result.code, 0);
});

test('dir (in fake dir) does not exist, but -fr specified', t => {
  const result = shell.rm('-fr', 'fake_dir/sub/');
  t.falsy(shell.error());
  t.is(result.code, 0);
});

test('simple rm', t => {
  t.is(fs.existsSync(`${TMP}/file1`), true);
  const result = shell.rm(`${TMP}/file1`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(fs.existsSync(`${TMP}/file1`), false);
});

test('recursive dir removal - small-caps \'-r\'', t => {
  shell.mkdir('-p', `${TMP}/a/b/c`);
  t.is(fs.existsSync(`${TMP}/a/b/c`), true);
  const result = shell.rm('-rf', `${TMP}/a`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(fs.existsSync(`${TMP}/a`), false);
});

test('recursive dir removal - capital \'-R\'', t => {
  shell.mkdir('-p', `${TMP}/a/b/c`);
  t.is(fs.existsSync(`${TMP}/a/b/c`), true);
  const result = shell.rm('-Rf', `${TMP}/a`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(fs.existsSync(`${TMP}/a`), false);
});

test('recursive dir removal - absolute path', t => {
  shell.mkdir('-p', `${TMP}/a/b/c`);
  t.is(fs.existsSync(`${TMP}/a/b/c`), true);
  const result = shell.rm('-Rf', path.resolve(`./${TMP}/a`));
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(fs.existsSync(`${TMP}/a`), false);
});

test('wildcard', t => {
  const result = shell.rm(`${TMP}/file*`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(fs.existsSync(`${TMP}/file1`), false);
  t.is(fs.existsSync(`${TMP}/file2`), false);
  t.is(fs.existsSync(`${TMP}/file1.js`), false);
  t.is(fs.existsSync(`${TMP}/file2.js`), false);
});

test('recursive dir removal', t => {
  shell.mkdir('-p', `${TMP}/a/b/c`);
  shell.mkdir('-p', `${TMP}/b`);
  shell.mkdir('-p', `${TMP}/c`);
  shell.mkdir('-p', `${TMP}/.hidden`);
  t.is(fs.existsSync(`${TMP}/a/b/c`), true);
  t.is(fs.existsSync(`${TMP}/b`), true);
  t.is(fs.existsSync(`${TMP}/c`), true);
  t.is(fs.existsSync(`${TMP}/.hidden`), true);
  const result = shell.rm('-rf', `${TMP}/*`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  const contents = fs.readdirSync(TMP);
  t.is(contents.length, 1);
  t.is(contents[0], '.hidden'); // shouldn't remove hiddden if no .* given
});

test('recursive dir removal #2', t => {
  shell.mkdir('-p', `${TMP}/a/b/c`);
  shell.mkdir('-p', `${TMP}/b`);
  shell.mkdir('-p', `${TMP}/c`);
  shell.mkdir('-p', `${TMP}/.hidden`);
  t.is(fs.existsSync(`${TMP}/a/b/c`), true);
  t.is(fs.existsSync(`${TMP}/b`), true);
  t.is(fs.existsSync(`${TMP}/c`), true);
  t.is(fs.existsSync(`${TMP}/.hidden`), true);
  const result = shell.rm('-rf', `${TMP}/*`, `${TMP}/.*`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  const contents = fs.readdirSync(TMP);
  t.is(contents.length, 0);
});

test('recursive dir removal - array-syntax', t => {
  shell.mkdir('-p', `${TMP}/a/b/c`);
  shell.mkdir('-p', `${TMP}/b`);
  shell.mkdir('-p', `${TMP}/c`);
  shell.mkdir('-p', `${TMP}/.hidden`);
  t.is(fs.existsSync(`${TMP}/a/b/c`), true);
  t.is(fs.existsSync(`${TMP}/b`), true);
  t.is(fs.existsSync(`${TMP}/c`), true);
  t.is(fs.existsSync(`${TMP}/.hidden`), true);
  const result = shell.rm('-rf', [`${TMP}/*`, `${TMP}/.*`]);
  t.falsy(shell.error());
  t.is(result.code, 0);
  const contents = fs.readdirSync(TMP);
  t.is(contents.length, 0);
});

test('removal of a read-only file (unforced)', t => {
  shell.mkdir('-p', `${TMP}/readonly`);
  shell.ShellString('asdf').to(`${TMP}/readonly/file1`);
  fs.chmodSync(`${TMP}/readonly/file1`, '0444'); // -r--r--r--
  shell.rm(`${TMP}/readonly/file1`);
  t.is(fs.existsSync(`${TMP}/readonly/file1`), true); // bash's rm always asks before removing read-only files
  // here we just assume "no"
});

test('removal of a read-only file (forced)', t => {
  shell.mkdir('-p', `${TMP}/readonly`);
  shell.ShellString('asdf').to(`${TMP}/readonly/file2`);
  fs.chmodSync(`${TMP}/readonly/file2`, '0444'); // -r--r--r--
  shell.rm('-f', `${TMP}/readonly/file2`);
  t.is(fs.existsSync(`${TMP}/readonly/file2`), false);
});

test('removal of a tree containing read-only files (unforced)', t => {
  shell.mkdir('-p', `${TMP}/tree2`);
  shell.ShellString('asdf').to(`${TMP}/tree2/file1`);
  shell.ShellString('asdf').to(`${TMP}/tree2/file2`);
  fs.chmodSync(`${TMP}/tree2/file1`, '0444'); // -r--r--r--
  shell.rm('-r', `${TMP}/tree2`);
  t.is(fs.existsSync(`${TMP}/tree2/file1`), true);
  t.is(fs.existsSync(`${TMP}/tree2/file2`), false);
});

test('removal of a tree containing read-only files (forced)', t => {
  shell.mkdir('-p', `${TMP}/tree`);
  shell.ShellString('asdf').to(`${TMP}/tree/file1`);
  shell.ShellString('asdf').to(`${TMP}/tree/file2`);
  fs.chmodSync(`${TMP}/tree/file1`, '0444'); // -r--r--r--
  shell.rm('-rf', `${TMP}/tree`);
  t.is(fs.existsSync(`${TMP}/tree`), false);
});

test(
  'removal of a sub-tree containing read-only and hidden files - glob',
  t => {
    shell.mkdir('-p', `${TMP}/tree3`);
    shell.mkdir('-p', `${TMP}/tree3/subtree`);
    shell.mkdir('-p', `${TMP}/tree3/.hidden`);
    shell.ShellString('asdf').to(`${TMP}/tree3/subtree/file`);
    shell.ShellString('asdf').to(`${TMP}/tree3/.hidden/file`);
    shell.ShellString('asdf').to(`${TMP}/tree3/file`);
    fs.chmodSync(`${TMP}/tree3/file`, '0444'); // -r--r--r--
    fs.chmodSync(`${TMP}/tree3/subtree/file`, '0444'); // -r--r--r--
    fs.chmodSync(`${TMP}/tree3/.hidden/file`, '0444'); // -r--r--r--
    shell.rm('-rf', `${TMP}/tree3/*`, `${TMP}/tree3/.*`); // erase dir contents
    t.is(shell.ls(`${TMP}/tree3`).length, 0);
  }
);

test(
  'removal of a sub-tree containing read-only and hidden files - without glob',
  t => {
    shell.mkdir('-p', `${TMP}/tree4`);
    shell.mkdir('-p', `${TMP}/tree4/subtree`);
    shell.mkdir('-p', `${TMP}/tree4/.hidden`);
    shell.ShellString('asdf').to(`${TMP}/tree4/subtree/file`);
    shell.ShellString('asdf').to(`${TMP}/tree4/.hidden/file`);
    shell.ShellString('asdf').to(`${TMP}/tree4/file`);
    fs.chmodSync(`${TMP}/tree4/file`, '0444'); // -r--r--r--
    fs.chmodSync(`${TMP}/tree4/subtree/file`, '0444'); // -r--r--r--
    fs.chmodSync(`${TMP}/tree4/.hidden/file`, '0444'); // -r--r--r--
    shell.rm('-rf', `${TMP}/tree4`); // erase dir contents
    t.is(fs.existsSync(`${TMP}/tree4`), false);
  }
);

test('remove symbolic link to a dir', t => {
  const result = shell.rm('-f', `${TMP}/rm/link_to_a_dir`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(fs.existsSync(`${TMP}/rm/link_to_a_dir`), false);
  t.is(fs.existsSync(`${TMP}/rm/a_dir`), true);
});

test('remove broken symbolic link', t => {
  if (process.platform !== 'win32') {
    t.truthy(shell.test('-L', `${TMP}/rm/fake.lnk`));
    const result = shell.rm(`${TMP}/rm/fake.lnk`);
    t.falsy(shell.error());
    t.is(result.code, 0);
    t.falsy(shell.test('-L', `${TMP}/rm/fake.lnk`));
    t.is(fs.existsSync(`${TMP}/rm/fake.lnk`), false);
  }
});
