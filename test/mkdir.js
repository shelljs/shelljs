import test from 'ava';
import shell from '..';
import fs from 'fs';
import utils from './utils/utils';

const numLines = utils.numLines;

test.beforeEach(t => {
  t.context.tmp = utils.getTempDir();
  shell.config.silent = true;
  shell.mkdir(t.context.tmp);
});

test.afterEach.always(t => {
  shell.rm('-rf', t.context.tmp);
});


//
// Invalids
//

test('no args', t => {
  const result = shell.mkdir();
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'mkdir: no paths given');
});

test('dir already exists', t => {
  const mtime = fs.statSync(t.context.tmp).mtime.toString();
  const result = shell.mkdir(t.context.tmp); // dir already exists
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, `mkdir: path already exists: ${t.context.tmp}`);
  t.is(fs.statSync(t.context.tmp).mtime.toString(), mtime); // didn't mess with dir
});

test('Can\'t overwrite a broken link', t => {
  const mtime = fs.lstatSync('resources/badlink').mtime.toString();
  const result = shell.mkdir('resources/badlink');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'mkdir: path already exists: resources/badlink');
  t.is(fs.lstatSync('resources/badlink').mtime.toString(), mtime); // didn't mess with file
});

test('root path does not exist', t => {
  t.falsy(fs.existsSync('/asdfasdf')); // sanity check
  const result = shell.mkdir('/asdfasdf/foobar'); // root path does not exist
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'mkdir: no such file or directory: /asdfasdf');
  t.falsy(fs.existsSync('/asdfasdf'));
  t.falsy(fs.existsSync('/asdfasdf/foobar'));
});

test('Check for invalid permissions', t => {
  if (process.platform !== 'win32') {
    // This test case only works on unix, but should work on Windows as well
    const dirName = 'nowritedir';
    shell.mkdir(dirName);
    t.falsy(shell.error());
    shell.chmod('-w', dirName);
    const result = shell.mkdir(dirName + '/foo');
    t.is(result.code, 1);
    t.is(
        result.stderr,
        'mkdir: cannot create directory nowritedir/foo: Permission denied'
      );
    t.truthy(shell.error());
    t.falsy(fs.existsSync(dirName + '/foo'));
    shell.rm('-rf', dirName); // clean up
  }
});

//
// Valids
//

test('basic usage', t => {
  t.falsy(fs.existsSync(`${t.context.tmp}/t1`));
  const result = shell.mkdir(`${t.context.tmp}/t1`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(fs.existsSync(`${t.context.tmp}/t1`));
});

test('multiple dirs', t => {
  t.falsy(fs.existsSync(`${t.context.tmp}/t2`));
  t.falsy(fs.existsSync(`${t.context.tmp}/t3`));
  const result = shell.mkdir(`${t.context.tmp}/t2`, `${t.context.tmp}/t3`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(fs.existsSync(`${t.context.tmp}/t2`));
  t.truthy(fs.existsSync(`${t.context.tmp}/t3`));
});

test('one dir exists, the other does not', t => {
  shell.mkdir(`${t.context.tmp}/t1`);
  t.truthy(fs.existsSync(`${t.context.tmp}/t1`));
  t.falsy(fs.existsSync(`${t.context.tmp}/t4`));
  const result = shell.mkdir(`${t.context.tmp}/t1`, `${t.context.tmp}/t4`);
  t.is(result.code, 1);
  t.is(numLines(shell.error()), 1);
  t.truthy(fs.existsSync(`${t.context.tmp}/t1`));
  t.truthy(fs.existsSync(`${t.context.tmp}/t4`));
});

test('-p flag', t => {
  t.falsy(fs.existsSync(`${t.context.tmp}/a`));
  const result = shell.mkdir('-p', `${t.context.tmp}/a/b/c`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(fs.existsSync(`${t.context.tmp}/a/b/c`));
  shell.rm('-Rf', `${t.context.tmp}/a`); // revert
});

test('multiple dirs', t => {
  const result = shell.mkdir('-p', `${t.context.tmp}/zzza`, `${t.context.tmp}/zzzb`, `${t.context.tmp}/zzzc`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(fs.existsSync(`${t.context.tmp}/zzza`));
  t.truthy(fs.existsSync(`${t.context.tmp}/zzzb`));
  t.truthy(fs.existsSync(`${t.context.tmp}/zzzc`));
});

test('multiple dirs, array syntax', t => {
  const result = shell.mkdir('-p', [`${t.context.tmp}/yyya`, `${t.context.tmp}/yyyb`, `${t.context.tmp}/yyyc`]);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(fs.existsSync(`${t.context.tmp}/yyya`));
  t.truthy(fs.existsSync(`${t.context.tmp}/yyyb`));
  t.truthy(fs.existsSync(`${t.context.tmp}/yyyc`));
});

test('globbed dir', t => {
  let result = shell.mkdir('-p', `${t.context.tmp}/mydir`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(fs.existsSync(`${t.context.tmp}/mydir`));
  result = shell.mkdir('-p', `${t.context.tmp}/m*ir`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(fs.existsSync(`${t.context.tmp}/mydir`));
  t.falsy(fs.existsSync(`${t.context.tmp}/m*ir`)); // doesn't create literal name
});
