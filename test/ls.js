const fs = require('fs');

const test = require('ava');

const shell = require('..');
const common = require('../src/common');
const utils = require('./utils/utils');

const CWD = process.cwd();

function createTimedFile(filename, mtime) {
  fs.writeFileSync(filename, '');
  fs.utimesSync(filename, mtime, mtime);
}

test.beforeEach(t => {
  t.context.tmp = utils.getTempDir();
  shell.config.resetForTesting();
  shell.mkdir(t.context.tmp);
});

test.afterEach.always(t => {
  process.chdir(CWD);
  shell.rm('-rf', t.context.tmp);
});


//
// Invalids
//

test('no such file or dir', t => {
  t.falsy(fs.existsSync('/asdfasdf'));
  const result = shell.ls('/asdfasdf'); // no such file or dir
  t.truthy(shell.error());
  t.is(result.code, 2);
  t.is(result.length, 0);
});

//
// Valids
//

test("it's ok to use no arguments", t => {
  const result = shell.ls();
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(shell.errorCode(), 0);
});

test('root directory', t => {
  const result = shell.ls('/');
  t.falsy(shell.error());
  t.is(result.code, 0);
});

test('no args provides the correct result', t => {
  shell.cd('test/resources/ls');
  const result = shell.ls();
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('file1'));
  t.truthy(result.includes('file2'));
  t.truthy(result.includes('file1.js'));
  t.truthy(result.includes('file2.js'));
  t.truthy(result.includes('filename(with)[chars$]^that.must+be-escaped'));
  t.truthy(result.includes('a_dir'));
  t.is(result.length, 6);
});

test('simple arg', t => {
  const result = shell.ls('test/resources/ls');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('file1'));
  t.truthy(result.includes('file2'));
  t.truthy(result.includes('file1.js'));
  t.truthy(result.includes('file2.js'));
  t.truthy(result.includes('filename(with)[chars$]^that.must+be-escaped'));
  t.truthy(result.includes('a_dir'));
  t.is(result.length, 6);
});

test('simple arg, with a trailing slash', t => {
  const result = shell.ls('test/resources/ls/');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('file1'));
  t.truthy(result.includes('file2'));
  t.truthy(result.includes('file1.js'));
  t.truthy(result.includes('file2.js'));
  t.truthy(result.includes('filename(with)[chars$]^that.must+be-escaped'));
  t.truthy(result.includes('a_dir'));
  t.is(result.length, 6);
});

test('simple arg, a file', t => {
  const result = shell.ls('test/resources/ls/file1');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('test/resources/ls/file1'));
  t.is(result.length, 1);
});

test('-t sorts directory contents by modification time, newest first', t => {
  const dir = t.context.tmp;
  createTimedFile(dir + '/older', 1000000000);
  createTimedFile(dir + '/newer', 1000000200);
  createTimedFile(dir + '/middle', 1000000100);

  const result = shell.ls('-t', dir);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.deepEqual([...result], ['newer', 'middle', 'older']);
});

test('-t sorts explicit paths and glob matches without changing ordinary ls', t => {
  shell.cd(t.context.tmp);
  createTimedFile('older', 1000000000);
  createTimedFile('newer', 1000000200);
  createTimedFile('middle', 1000000100);

  t.deepEqual([...shell.ls('older', 'newer', 'middle')], ['older', 'newer', 'middle']);
  t.deepEqual([...shell.ls('-t', ['older', 'newer', 'middle'])], ['newer', 'middle', 'older']);
  t.deepEqual([...shell.ls('-t', '*')], ['newer', 'middle', 'older']);
  t.deepEqual([...shell.ls('-t')], ['newer', 'middle', 'older']);
  t.falsy(shell.error());
});

test('-t sorts equal modification times by name', t => {
  shell.cd(t.context.tmp);
  createTimedFile('b', 1000000000);
  createTimedFile('a', 1000000000);

  t.deepEqual([...shell.ls('-t', 'b', 'a', 'a')], ['a', 'a', 'b']);
  t.falsy(shell.error());
});

test('-t preserves sub-millisecond modification-time precision', t => {
  shell.cd(t.context.tmp);
  createTimedFile('a-older', 1000000000.0001);
  createTimedFile('z-newer', 1000000000.0008);

  t.deepEqual([...shell.ls('-t', 'a-older', 'z-newer')], ['z-newer', 'a-older']);
  t.falsy(shell.error());
});

test('-lt preserves file metadata in modification-time order', t => {
  const dir = t.context.tmp;
  createTimedFile(dir + '/older', 1000000000);
  createTimedFile(dir + '/newer', 1000000100);

  const result = shell.ls('-lt', dir);
  t.falsy(shell.error());
  t.deepEqual(result.map(file => file.name), ['newer', 'older']);
  t.is(result[0].mtime.getTime(), 1000000100000);
  t.true(result[0].isFile());
  t.true(result[0].toString().endsWith(' newer'));
});

test('-lt sorts matching names from separate directories by their own timestamps', t => {
  const dir = t.context.tmp;
  shell.mkdir(dir + '/a', dir + '/b');
  createTimedFile(dir + '/a/shared', 1000000000);
  createTimedFile(dir + '/a/middle', 1000000100);
  createTimedFile(dir + '/b/shared', 1000000200);

  const result = shell.ls('-lt', dir + '/a', dir + '/b');
  t.falsy(shell.error());
  t.deepEqual(result.map(file => file.name), ['shared', 'middle', 'shared']);
  t.deepEqual(result.map(file => file.mtimeMs), [1000000200000, 1000000100000, 1000000000000]);
});

test('-t respects hidden-file filtering and -A', t => {
  const dir = t.context.tmp;
  createTimedFile(dir + '/visible', 1000000000);
  createTimedFile(dir + '/.hidden', 1000000100);

  t.deepEqual([...shell.ls('-t', dir)], ['visible']);
  t.deepEqual([...shell.ls('-At', dir)], ['.hidden', 'visible']);
  t.falsy(shell.error());
});

test('-Rt sorts the full recursive list and -dt sorts directories themselves', t => {
  const dir = t.context.tmp;
  shell.mkdir(dir + '/sub');
  createTimedFile(dir + '/older', 1000000000);
  createTimedFile(dir + '/sub/newer', 1000000200);
  fs.utimesSync(dir + '/sub', 1000000100, 1000000100);
  fs.utimesSync(dir, 1000000000, 1000000000);

  t.deepEqual([...shell.ls('-Rt', dir)], ['sub/newer', 'sub', 'older']);
  t.deepEqual([...shell.ls('-dt', dir, dir + '/sub')], [dir + '/sub', dir]);
  t.falsy(shell.error());
});

test('-t uses symlink timestamps unless -L is specified', t => {
  utils.skipOnWin(t, () => {
    shell.cd(t.context.tmp);
    createTimedFile('target', 1000000000);
    createTimedFile('middle', 1000000100);
    fs.symlinkSync('target', 'link');
    fs.lutimesSync('link', 1000000200, 1000000200);

    t.deepEqual([...shell.ls('-t')], ['link', 'middle', 'target']);
    t.deepEqual([...shell.ls('-Lt')], ['middle', 'link', 'target']);
    t.falsy(shell.error());
  });
});

test('-t lists broken symlinks without following them', t => {
  utils.skipOnWin(t, () => {
    shell.cd(t.context.tmp);
    createTimedFile('older', 1000000000);
    fs.symlinkSync('missing', 'broken');
    fs.lutimesSync('broken', 1000000100, 1000000100);

    t.deepEqual([...shell.ls('-t')], ['broken', 'older']);
    t.falsy(shell.error());
  });
});

test('no args, -A option', t => {
  shell.cd('test/resources/ls');
  const result = shell.ls('-A');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('file1'));
  t.truthy(result.includes('file2'));
  t.truthy(result.includes('file1.js'));
  t.truthy(result.includes('file2.js'));
  t.truthy(result.includes('filename(with)[chars$]^that.must+be-escaped'));
  t.truthy(result.includes('a_dir'));
  t.truthy(result.includes('.hidden_file'));
  t.truthy(result.includes('.hidden_dir'));
  t.is(result.length, 8);
});

test('no args, deprecated -a option', t => {
  shell.cd('test/resources/ls');
  const result = shell.ls('-a'); // (deprecated) backwards compatibility test
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('file1'));
  t.truthy(result.includes('file2'));
  t.truthy(result.includes('file1.js'));
  t.truthy(result.includes('file2.js'));
  t.truthy(result.includes('filename(with)[chars$]^that.must+be-escaped'));
  t.truthy(result.includes('a_dir'));
  t.truthy(result.includes('.hidden_file'));
  t.truthy(result.includes('.hidden_dir'));
  t.is(result.length, 8);
});

test('wildcard, very simple', t => {
  const result = shell.ls('test/resources/cat/*');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('test/resources/cat/file1'));
  t.truthy(result.includes('test/resources/cat/file2'));
  t.truthy(result.includes('test/resources/cat/file3'));
  t.truthy(result.includes('test/resources/cat/file4'));
  t.truthy(result.includes('test/resources/cat/file5'));
  t.is(result.length, 5);
});

test('wildcard, simple', t => {
  const result = shell.ls('test/resources/ls/*');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('test/resources/ls/file1'));
  t.truthy(result.includes('test/resources/ls/file2'));
  t.truthy(result.includes('test/resources/ls/file1.js'));
  t.truthy(result.includes('test/resources/ls/file2.js'));
  t.truthy(
    result.includes('test/resources/ls/filename(with)[chars$]^that.must+be-escaped')
  );
  t.falsy(result.includes('test/resources/ls/a_dir')); // this shouldn't be there
  t.truthy(result.includes('nada'));
  t.truthy(result.includes('b_dir'));
  t.is(result.length, 7);
});

test('wildcard, simple, with -d', t => {
  const result = shell.ls('-d', 'test/resources/ls/*');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('test/resources/ls/file1'));
  t.truthy(result.includes('test/resources/ls/file2'));
  t.truthy(result.includes('test/resources/ls/file1.js'));
  t.truthy(result.includes('test/resources/ls/file2.js'));
  t.truthy(
    result.includes('test/resources/ls/filename(with)[chars$]^that.must+be-escaped')
  );
  t.truthy(result.includes('test/resources/ls/a_dir'));
  t.is(result.length, 6);
});

test('wildcard, hidden only', t => {
  const result = shell.ls('-d', 'test/resources/ls/.*');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('test/resources/ls/.hidden_file'));
  t.truthy(result.includes('test/resources/ls/.hidden_dir'));
  t.is(result.length, 2);
});

test('wildcard, mid-file', t => {
  const result = shell.ls('test/resources/ls/f*le*');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.length, 5);
  t.truthy(result.includes('test/resources/ls/file1'));
  t.truthy(result.includes('test/resources/ls/file2'));
  t.truthy(result.includes('test/resources/ls/file1.js'));
  t.truthy(result.includes('test/resources/ls/file2.js'));
  t.truthy(
    result.includes('test/resources/ls/filename(with)[chars$]^that.must+be-escaped')
  );
});

test('wildcard, mid-file with dot (should escape dot for regex)', t => {
  const result = shell.ls('test/resources/ls/f*le*.js');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.length, 2);
  t.truthy(result.includes('test/resources/ls/file1.js'));
  t.truthy(result.includes('test/resources/ls/file2.js'));
});

test("one file that exists, one that doesn't", t => {
  const result = shell.ls('test/resources/ls/file1.js', 'test/resources/ls/thisdoesntexist');
  t.truthy(shell.error());
  t.is(result.code, 2);
  t.is(result.length, 1);
  t.truthy(result.includes('test/resources/ls/file1.js'));
});

test("one file that exists, one that doesn't (other order)", t => {
  const result = shell.ls('test/resources/ls/thisdoesntexist', 'test/resources/ls/file1.js');
  t.truthy(shell.error());
  t.is(result.code, 2);
  t.is(result.length, 1);
  t.truthy(result.includes('test/resources/ls/file1.js'));
});

test('wildcard, should not do partial matches', t => {
  const result = shell.ls('test/resources/ls/*.j'); // shouldn't get .js
  t.truthy(shell.error());
  t.is(result.code, 2);
  t.is(result.length, 0);
});

test('wildcard, all files with extension', t => {
  const result = shell.ls('test/resources/ls/*.*');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.length, 3);
  t.truthy(result.includes('test/resources/ls/file1.js'));
  t.truthy(result.includes('test/resources/ls/file2.js'));
  t.truthy(
    result.includes('test/resources/ls/filename(with)[chars$]^that.must+be-escaped')
  );
});

test('wildcard, with additional path', t => {
  const result = shell.ls('test/resources/ls/f*le*.js', 'test/resources/ls/a_dir');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.length, 4);
  t.truthy(result.includes('test/resources/ls/file1.js'));
  t.truthy(result.includes('test/resources/ls/file2.js'));
  t.truthy(result.includes('b_dir')); // no wildcard == no path prefix
  t.truthy(result.includes('nada')); // no wildcard == no path prefix
});

test('wildcard for both paths', t => {
  const result = shell.ls('test/resources/ls/f*le*.js', 'test/resources/ls/a_dir/*');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.length, 4);
  t.truthy(result.includes('test/resources/ls/file1.js'));
  t.truthy(result.includes('test/resources/ls/file2.js'));
  t.truthy(result.includes('z'));
  t.truthy(result.includes('test/resources/ls/a_dir/nada'));
});

test('wildcard for both paths, array', t => {
  const result = shell.ls(['test/resources/ls/f*le*.js', 'test/resources/ls/a_dir/*']);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.length, 4);
  t.truthy(result.includes('test/resources/ls/file1.js'));
  t.truthy(result.includes('test/resources/ls/file2.js'));
  t.truthy(result.includes('z'));
  t.truthy(result.includes('test/resources/ls/a_dir/nada'));
});

test('recursive, no path', t => {
  shell.cd('test/resources/ls');
  const result = shell.ls('-R');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('a_dir'));
  t.truthy(result.includes('a_dir/b_dir'));
  t.truthy(result.includes('a_dir/b_dir/z'));
  t.is(result.length, 9);
});

test('recursive, path given', t => {
  const result = shell.ls('-R', 'test/resources/ls');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('a_dir'));
  t.truthy(result.includes('a_dir/b_dir'));
  t.truthy(result.includes('a_dir/b_dir/z'));
  t.is(result.length, 9);
});

test('-RA flag, path given', t => {
  const result = shell.ls('-RA', 'test/resources/ls');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('a_dir'));
  t.truthy(result.includes('a_dir/b_dir'));
  t.truthy(result.includes('a_dir/b_dir/z'));
  t.truthy(result.includes('a_dir/.hidden_dir/nada'));
  t.is(result.length, 14);
});

test('-RA flag, symlinks are not followed', t => {
  const result = shell.ls('-RA', 'test/resources/rm');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('a_dir'));
  t.truthy(result.includes('a_dir/a_file'));
  t.truthy(result.includes('link_to_a_dir'));
  t.falsy(result.includes('link_to_a_dir/a_file'));
  t.truthy(result.includes('fake.lnk'));
  t.is(result.length, 4);
});

test('-RAL flag, follows symlinks', t => {
  utils.skipOnWin(t, () => {
    const result = shell.ls('-RAL', 'test/resources/rm');
    t.falsy(shell.error());
    t.is(result.code, 0);
    t.truthy(result.includes('a_dir'));
    t.truthy(result.includes('a_dir/a_file'));
    t.truthy(result.includes('link_to_a_dir'));
    t.truthy(result.includes('link_to_a_dir/a_file'));
    t.truthy(result.includes('fake.lnk'));
    t.is(result.length, 5);
  });
});

test('-L flag, path is symlink', t => {
  utils.skipOnWin(t, () => {
    const result = shell.ls('-L', 'test/resources/rm/link_to_a_dir');
    t.falsy(shell.error());
    t.is(result.code, 0);
    t.truthy(result.includes('a_file'));
    t.is(result.length, 1);
  });
});

test('follow links to directories by default', t => {
  utils.skipOnWin(t, () => {
    const result = shell.ls('test/resources/rm/link_to_a_dir');
    t.falsy(shell.error());
    t.is(result.code, 0);
    t.truthy(result.includes('a_file'));
    t.is(result.length, 1);
  });
});

test('-Rd works like -d', t => {
  const result = shell.ls('-Rd', 'test/resources/ls');
  t.falsy(shell.error());
  t.is(result.length, 1);
});

test('directory option, single arg', t => {
  const result = shell.ls('-d', 'test/resources/ls');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.length, 1);
});

test("directory option, single arg with trailing '/'", t => {
  const result = shell.ls('-d', 'test/resources/ls/');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.length, 1);
});

test('directory option, multiple args', t => {
  const result = shell.ls('-d', 'test/resources/ls/a_dir', 'test/resources/ls/file1');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('test/resources/ls/a_dir'));
  t.truthy(result.includes('test/resources/ls/file1'));
  t.is(result.length, 2);
});

test('directory option, globbed arg', t => {
  const result = shell.ls('-d', 'test/resources/ls/*');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('test/resources/ls/a_dir'));
  t.truthy(result.includes('test/resources/ls/file1'));
  t.truthy(result.includes('test/resources/ls/file1.js'));
  t.truthy(result.includes('test/resources/ls/file2'));
  t.truthy(result.includes('test/resources/ls/file2.js'));
  t.truthy(result.includes('test/resources/ls/file2'));
  t.truthy(
    result.includes('test/resources/ls/filename(with)[chars$]^that.must+be-escaped')
  );
  t.is(result.length, 6);
});

test('long option, single file', t => {
  let result = shell.ls('-l', 'test/resources/ls/file1');
  t.is(result.length, 1);
  result = result[0];
  t.falsy(shell.error());
  t.truthy(result.name, 'file1');
  t.is(result.nlink, 1);
  t.is(result.size, 5);
  t.truthy(result.mode); // check that these keys exist
  utils.skipOnWin(t, () => {
    t.truthy(result.uid);
    t.truthy(result.gid);
  });
  t.truthy(result.mtime); // check that these keys exist
  t.truthy(result.atime); // check that these keys exist
  t.truthy(result.ctime); // check that these keys exist
  t.truthy(result.toString().match(/^(\d+ +){5}.*$/));
});

test('long option, glob files', t => {
  let result = shell.ls('-l', 'test/resources/ls/f*le1');
  t.is(result.length, 1);
  result = result[0];
  t.falsy(shell.error());
  t.truthy(result.name, 'file1');
  t.is(result.nlink, 1);
  t.is(result.size, 5);
  t.truthy(result.mode); // check that these keys exist
  utils.skipOnWin(t, () => {
    t.truthy(result.uid);
    t.truthy(result.gid);
  });
  t.truthy(result.mtime); // check that these keys exist
  t.truthy(result.atime); // check that these keys exist
  t.truthy(result.ctime); // check that these keys exist
  t.truthy(result.toString().match(/^(\d+ +){5}.*$/));
});

test('long option, directory', t => {
  let result = shell.ls('-l', 'test/resources/ls');
  t.falsy(shell.error());
  t.is(result.code, 0);
  const idx = result.map(r => r.name).indexOf('file1');
  t.truthy(idx >= 0);
  t.is(result.length, 6);
  result = result[idx];
  t.is(result.name, 'file1');
  t.is(result.nlink, 1);
  t.is(result.size, 5);
  t.truthy(result.mode); // check that these keys exist
  utils.skipOnWin(t, () => {
    t.truthy(result.uid);
    t.truthy(result.gid);
  });
  t.truthy(result.mtime); // check that these keys exist
  t.truthy(result.atime); // check that these keys exist
  t.truthy(result.ctime); // check that these keys exist
  t.truthy(result.toString().match(/^(\d+ +){5}.*$/));
});

test('long option, directory, recursive (and windows converts slashes)', t => {
  let result = shell.ls('-lR', 'test/resources/ls/');
  t.falsy(shell.error());
  t.is(result.code, 0);
  const idx = result.map(r => r.name).indexOf('a_dir/b_dir');
  t.is(result.length, 9);
  t.truthy(idx >= 0);
  result = result[idx];
  t.is(result.name, result.name);
  t.truthy(common.statFollowLinks('test/resources/ls/a_dir/b_dir').isDirectory());
  t.is(typeof result.nlink, 'number'); // This can vary between the local machine and travis
  t.is(typeof result.size, 'number'); // This can vary between different file systems
  t.truthy(result.mode); // check that these keys exist
  utils.skipOnWin(t, () => {
    t.truthy(result.uid);
    t.truthy(result.gid);
  });
  t.truthy(result.mtime); // check that these keys exist
  t.truthy(result.atime); // check that these keys exist
  t.truthy(result.ctime); // check that these keys exist
  t.truthy(result.toString().match(/^(\d+ +){5}.*$/));
});

test('still lists broken links', t => {
  const result = shell.ls('test/resources/badlink');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('test/resources/badlink'));
  t.is(result.length, 1);
});

test('Test new ShellString-like attributes', t => {
  const result = shell.ls('test/resources/ls');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.stdout.includes('file1'));
  t.truthy(result.stdout.includes('file2'));
  t.truthy(result.stdout.includes('file1.js'));
  t.truthy(result.stdout.includes('file2.js'));
  t.truthy(
    result.stdout.includes('filename(with)[chars$]^that.must+be-escaped')
  );
  t.truthy(result.stdout.includes('a_dir'));
  t.is(typeof result.stdout, 'string');
  t.truthy(result.to);
  t.truthy(result.toEnd);
  result.to(`${t.context.tmp}/testingToOutput.txt`);
  t.is(shell.cat(`${t.context.tmp}/testingToOutput.txt`).toString(), result.stdout);
  shell.rm(`${t.context.tmp}/testingToOutput.txt`);
});

test('No trailing newline for ls() on empty directories', t => {
  shell.mkdir('foo');
  t.falsy(shell.error());
  const result = shell.ls('foo');
  t.falsy(shell.error());
  t.is(result.stdout, '');
  shell.rm('-r', 'foo');
  t.falsy(shell.error());
});

test('Check stderr field', t => {
  t.falsy(fs.existsSync('/asdfasdf')); // sanity check
  const result = shell.ls('test/resources/ls/file1', '/asdfasdf');
  t.truthy(shell.error());
  t.is('ls: no such file or directory: /asdfasdf', result.stderr);
});

test('non-normalized paths are still ok with -R', t => {
  const result = shell.ls('-R', 'test/resources/./ls/../ls');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('a_dir'));
  t.truthy(result.includes('a_dir/b_dir'));
  t.truthy(result.includes('a_dir/b_dir/z'));
  t.is(result.length, 9);
});
