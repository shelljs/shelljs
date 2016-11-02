import test from 'ava';
import shell from '..';
import path from 'path';
import fs from 'fs';
import utils from './utils/utils';

test.beforeEach(t => {
  t.context.tmp = utils.getTempDir();
  shell.config.silent = true;
  shell.cp('-r', 'resources', t.context.tmp);
});

test.afterEach.always(t => {
  shell.rm('-rf', t.context.tmp);
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
  t.truthy(fs.existsSync('resources/file1'));
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
  t.truthy(fs.existsSync(`${t.context.tmp}/file1`));
  const result = shell.rm(`${t.context.tmp}/file1`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.falsy(fs.existsSync(`${t.context.tmp}/file1`));
});

test('recursive dir removal - small-caps \'-r\'', t => {
  shell.mkdir('-p', `${t.context.tmp}/a/b/c`);
  t.truthy(fs.existsSync(`${t.context.tmp}/a/b/c`));
  const result = shell.rm('-rf', `${t.context.tmp}/a`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.falsy(fs.existsSync(`${t.context.tmp}/a`));
});

test('recursive dir removal - capital \'-R\'', t => {
  shell.mkdir('-p', `${t.context.tmp}/a/b/c`);
  t.truthy(fs.existsSync(`${t.context.tmp}/a/b/c`));
  const result = shell.rm('-Rf', `${t.context.tmp}/a`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.falsy(fs.existsSync(`${t.context.tmp}/a`));
});

test('recursive dir removal - absolute path', t => {
  shell.mkdir('-p', `${t.context.tmp}/a/b/c`);
  t.truthy(fs.existsSync(`${t.context.tmp}/a/b/c`));
  const result = shell.rm('-Rf', path.resolve(`./${t.context.tmp}/a`));
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.falsy(fs.existsSync(`${t.context.tmp}/a`));
});

test('wildcard', t => {
  const result = shell.rm(`${t.context.tmp}/file*`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.falsy(fs.existsSync(`${t.context.tmp}/file1`));
  t.falsy(fs.existsSync(`${t.context.tmp}/file2`));
  t.falsy(fs.existsSync(`${t.context.tmp}/file1.js`));
  t.falsy(fs.existsSync(`${t.context.tmp}/file2.js`));
});

test('recursive dir removal', t => {
  shell.mkdir('-p', `${t.context.tmp}/a/b/c`);
  shell.mkdir('-p', `${t.context.tmp}/b`);
  shell.mkdir('-p', `${t.context.tmp}/c`);
  shell.mkdir('-p', `${t.context.tmp}/.hidden`);
  t.truthy(fs.existsSync(`${t.context.tmp}/a/b/c`));
  t.truthy(fs.existsSync(`${t.context.tmp}/b`));
  t.truthy(fs.existsSync(`${t.context.tmp}/c`));
  t.truthy(fs.existsSync(`${t.context.tmp}/.hidden`));
  const result = shell.rm('-rf', `${t.context.tmp}/*`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  const contents = fs.readdirSync(t.context.tmp);
  t.is(contents.length, 1);
  t.is(contents[0], '.hidden'); // shouldn't remove hiddden if no .* given
});

test('recursive dir removal #2', t => {
  shell.mkdir('-p', `${t.context.tmp}/a/b/c`);
  shell.mkdir('-p', `${t.context.tmp}/b`);
  shell.mkdir('-p', `${t.context.tmp}/c`);
  shell.mkdir('-p', `${t.context.tmp}/.hidden`);
  t.truthy(fs.existsSync(`${t.context.tmp}/a/b/c`));
  t.truthy(fs.existsSync(`${t.context.tmp}/b`));
  t.truthy(fs.existsSync(`${t.context.tmp}/c`));
  t.truthy(fs.existsSync(`${t.context.tmp}/.hidden`));
  const result = shell.rm('-rf', `${t.context.tmp}/*`, `${t.context.tmp}/.*`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  const contents = fs.readdirSync(t.context.tmp);
  t.is(contents.length, 0);
});

test('recursive dir removal - array-syntax', t => {
  shell.mkdir('-p', `${t.context.tmp}/a/b/c`);
  shell.mkdir('-p', `${t.context.tmp}/b`);
  shell.mkdir('-p', `${t.context.tmp}/c`);
  shell.mkdir('-p', `${t.context.tmp}/.hidden`);
  t.truthy(fs.existsSync(`${t.context.tmp}/a/b/c`));
  t.truthy(fs.existsSync(`${t.context.tmp}/b`));
  t.truthy(fs.existsSync(`${t.context.tmp}/c`));
  t.truthy(fs.existsSync(`${t.context.tmp}/.hidden`));
  const result = shell.rm('-rf', [`${t.context.tmp}/*`, `${t.context.tmp}/.*`]);
  t.falsy(shell.error());
  t.is(result.code, 0);
  const contents = fs.readdirSync(t.context.tmp);
  t.is(contents.length, 0);
});

test('removal of a read-only file (unforced)', t => {
  shell.mkdir('-p', `${t.context.tmp}/readonly`);
  shell.ShellString('asdf').to(`${t.context.tmp}/readonly/file1`);
  fs.chmodSync(`${t.context.tmp}/readonly/file1`, '0444'); // -r--r--r--
  shell.rm(`${t.context.tmp}/readonly/file1`);
  t.truthy(fs.existsSync(`${t.context.tmp}/readonly/file1`)); // bash's rm always asks before removing read-only files
  // here we just assume "no"
});

test('removal of a read-only file (forced)', t => {
  shell.mkdir('-p', `${t.context.tmp}/readonly`);
  shell.ShellString('asdf').to(`${t.context.tmp}/readonly/file2`);
  fs.chmodSync(`${t.context.tmp}/readonly/file2`, '0444'); // -r--r--r--
  shell.rm('-f', `${t.context.tmp}/readonly/file2`);
  t.falsy(fs.existsSync(`${t.context.tmp}/readonly/file2`));
});

test('removal of a tree containing read-only files (unforced)', t => {
  shell.mkdir('-p', `${t.context.tmp}/tree2`);
  shell.ShellString('asdf').to(`${t.context.tmp}/tree2/file1`);
  shell.ShellString('asdf').to(`${t.context.tmp}/tree2/file2`);
  fs.chmodSync(`${t.context.tmp}/tree2/file1`, '0444'); // -r--r--r--
  shell.rm('-r', `${t.context.tmp}/tree2`);
  t.truthy(fs.existsSync(`${t.context.tmp}/tree2/file1`));
  t.falsy(fs.existsSync(`${t.context.tmp}/tree2/file2`));
});

test('removal of a tree containing read-only files (forced)', t => {
  shell.mkdir('-p', `${t.context.tmp}/tree`);
  shell.ShellString('asdf').to(`${t.context.tmp}/tree/file1`);
  shell.ShellString('asdf').to(`${t.context.tmp}/tree/file2`);
  fs.chmodSync(`${t.context.tmp}/tree/file1`, '0444'); // -r--r--r--
  shell.rm('-rf', `${t.context.tmp}/tree`);
  t.falsy(fs.existsSync(`${t.context.tmp}/tree`));
});

test(
  'removal of a sub-tree containing read-only and hidden files - glob',
  t => {
    shell.mkdir('-p', `${t.context.tmp}/tree3`);
    shell.mkdir('-p', `${t.context.tmp}/tree3/subtree`);
    shell.mkdir('-p', `${t.context.tmp}/tree3/.hidden`);
    shell.ShellString('asdf').to(`${t.context.tmp}/tree3/subtree/file`);
    shell.ShellString('asdf').to(`${t.context.tmp}/tree3/.hidden/file`);
    shell.ShellString('asdf').to(`${t.context.tmp}/tree3/file`);
    fs.chmodSync(`${t.context.tmp}/tree3/file`, '0444'); // -r--r--r--
    fs.chmodSync(`${t.context.tmp}/tree3/subtree/file`, '0444'); // -r--r--r--
    fs.chmodSync(`${t.context.tmp}/tree3/.hidden/file`, '0444'); // -r--r--r--
    shell.rm('-rf', `${t.context.tmp}/tree3/*`, `${t.context.tmp}/tree3/.*`); // erase dir contents
    t.is(shell.ls(`${t.context.tmp}/tree3`).length, 0);
  }
);

test(
  'removal of a sub-tree containing read-only and hidden files - without glob',
  t => {
    shell.mkdir('-p', `${t.context.tmp}/tree4`);
    shell.mkdir('-p', `${t.context.tmp}/tree4/subtree`);
    shell.mkdir('-p', `${t.context.tmp}/tree4/.hidden`);
    shell.ShellString('asdf').to(`${t.context.tmp}/tree4/subtree/file`);
    shell.ShellString('asdf').to(`${t.context.tmp}/tree4/.hidden/file`);
    shell.ShellString('asdf').to(`${t.context.tmp}/tree4/file`);
    fs.chmodSync(`${t.context.tmp}/tree4/file`, '0444'); // -r--r--r--
    fs.chmodSync(`${t.context.tmp}/tree4/subtree/file`, '0444'); // -r--r--r--
    fs.chmodSync(`${t.context.tmp}/tree4/.hidden/file`, '0444'); // -r--r--r--
    shell.rm('-rf', `${t.context.tmp}/tree4`); // erase dir contents
    t.falsy(fs.existsSync(`${t.context.tmp}/tree4`));
  }
);

test('remove symbolic link to a dir', t => {
  const result = shell.rm('-f', `${t.context.tmp}/rm/link_to_a_dir`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.falsy(fs.existsSync(`${t.context.tmp}/rm/link_to_a_dir`));
  t.truthy(fs.existsSync(`${t.context.tmp}/rm/a_dir`));
});

test('remove broken symbolic link', t => {
  if (process.platform !== 'win32') {
    t.truthy(shell.test('-L', `${t.context.tmp}/rm/fake.lnk`));
    const result = shell.rm(`${t.context.tmp}/rm/fake.lnk`);
    t.falsy(shell.error());
    t.is(result.code, 0);
    t.falsy(shell.test('-L', `${t.context.tmp}/rm/fake.lnk`));
    t.falsy(fs.existsSync(`${t.context.tmp}/rm/fake.lnk`));
  }
});
