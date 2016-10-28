import test from 'ava';
import shell from '..';
import fs from 'fs';

const TMP = require('./utils/utils').getTempDir();

test.beforeEach(() => {
  shell.config.silent = true;
  shell.mkdir(TMP);
});

test.afterEach(() => {
  shell.rm('-rf', TMP);
});


//
// Invalids
//

test('No Test Title #26', t => {
  t.is(fs.existsSync('/asdfasdf'), false);
  const result = shell.ls('/asdfasdf'); // no such file or dir
  t.truthy(shell.error());
  t.is(result.code, 2);
  t.is(result.length, 0);
});

//
// Valids
//

test('No Test Title #27', t => {
  const result = shell.ls();
  t.is(shell.error(), null);
  t.is(result.code, 0);
});

test('No Test Title #28', t => {
  const result = shell.ls('/');
  t.is(shell.error(), null);
  t.is(result.code, 0);
});

test('no args', t => {
  shell.cd('resources/ls');
  const result = shell.ls();
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.indexOf('file1') > -1, true);
  t.is(result.indexOf('file2') > -1, true);
  t.is(result.indexOf('file1.js') > -1, true);
  t.is(result.indexOf('file2.js') > -1, true);
  t.is(result.indexOf('filename(with)[chars$]^that.must+be-escaped') > -1, true);
  t.is(result.indexOf('a_dir') > -1, true);
  t.is(result.length, 6);
  shell.cd('../..');
});

test('simple arg', t => {
  const result = shell.ls('resources/ls');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.indexOf('file1') > -1, true);
  t.is(result.indexOf('file2') > -1, true);
  t.is(result.indexOf('file1.js') > -1, true);
  t.is(result.indexOf('file2.js') > -1, true);
  t.is(result.indexOf('filename(with)[chars$]^that.must+be-escaped') > -1, true);
  t.is(result.indexOf('a_dir') > -1, true);
  t.is(result.length, 6);
});

test('simple arg, with a trailing slash', t => {
  const result = shell.ls('resources/ls/');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.indexOf('file1') > -1, true);
  t.is(result.indexOf('file2') > -1, true);
  t.is(result.indexOf('file1.js') > -1, true);
  t.is(result.indexOf('file2.js') > -1, true);
  t.is(result.indexOf('filename(with)[chars$]^that.must+be-escaped') > -1, true);
  t.is(result.indexOf('a_dir') > -1, true);
  t.is(result.length, 6);
});

test('no args, \'all\' option', t => {
  shell.cd('resources/ls');
  const result = shell.ls('-A');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.indexOf('file1') > -1, true);
  t.is(result.indexOf('file2') > -1, true);
  t.is(result.indexOf('file1.js') > -1, true);
  t.is(result.indexOf('file2.js') > -1, true);
  t.is(result.indexOf('filename(with)[chars$]^that.must+be-escaped') > -1, true);
  t.is(result.indexOf('a_dir') > -1, true);
  t.is(result.indexOf('.hidden_file') > -1, true);
  t.is(result.indexOf('.hidden_dir') > -1, true);
  t.is(result.length, 8);
  shell.cd('../..');
});

test('no args, \'all\' option', t => {
  shell.cd('resources/ls');
  const result = shell.ls('-a'); // (deprecated) backwards compatibility test
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.indexOf('file1') > -1, true);
  t.is(result.indexOf('file2') > -1, true);
  t.is(result.indexOf('file1.js') > -1, true);
  t.is(result.indexOf('file2.js') > -1, true);
  t.is(result.indexOf('filename(with)[chars$]^that.must+be-escaped') > -1, true);
  t.is(result.indexOf('a_dir') > -1, true);
  t.is(result.indexOf('.hidden_file') > -1, true);
  t.is(result.indexOf('.hidden_dir') > -1, true);
  t.is(result.length, 8);
  shell.cd('../..');
});

test('wildcard, very simple', t => {
  const result = shell.ls('resources/cat/*');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.indexOf('resources/cat/file1') > -1, true);
  t.is(result.indexOf('resources/cat/file2') > -1, true);
  t.is(result.length, 2);
});

test('wildcard, simple', t => {
  const result = shell.ls('resources/ls/*');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.indexOf('resources/ls/file1') > -1, true);
  t.is(result.indexOf('resources/ls/file2') > -1, true);
  t.is(result.indexOf('resources/ls/file1.js') > -1, true);
  t.is(result.indexOf('resources/ls/file2.js') > -1, true);
  t.is(
    result.indexOf('resources/ls/filename(with)[chars$]^that.must+be-escaped') > -1,
    true
  );
  t.truthy(result.indexOf('resources/ls/a_dir') === -1); // this shouldn't be there
  t.truthy(result.indexOf('nada') > -1);
  t.truthy(result.indexOf('b_dir') > -1);
  t.is(result.length, 7);
});

test('wildcard, simple, with -d', t => {
  const result = shell.ls('-d', 'resources/ls/*');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.indexOf('resources/ls/file1') > -1, true);
  t.is(result.indexOf('resources/ls/file2') > -1, true);
  t.is(result.indexOf('resources/ls/file1.js') > -1, true);
  t.is(result.indexOf('resources/ls/file2.js') > -1, true);
  t.is(
    result.indexOf('resources/ls/filename(with)[chars$]^that.must+be-escaped') > -1,
    true
  );
  t.truthy(result.indexOf('resources/ls/a_dir') > -1);
  t.is(result.length, 6);
});

test('wildcard, hidden only', t => {
  const result = shell.ls('-d', 'resources/ls/.*');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.indexOf('resources/ls/.hidden_file') > -1, true);
  t.is(result.indexOf('resources/ls/.hidden_dir') > -1, true);
  t.is(result.length, 2);
});

test('wildcard, mid-file', t => {
  const result = shell.ls('resources/ls/f*le*');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.length, 5);
  t.is(result.indexOf('resources/ls/file1') > -1, true);
  t.is(result.indexOf('resources/ls/file2') > -1, true);
  t.is(result.indexOf('resources/ls/file1.js') > -1, true);
  t.is(result.indexOf('resources/ls/file2.js') > -1, true);
  t.is(
    result.indexOf('resources/ls/filename(with)[chars$]^that.must+be-escaped') > -1,
    true
  );
});

test('wildcard, mid-file with dot (should escape dot for regex)', t => {
  const result = shell.ls('resources/ls/f*le*.js');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.length, 2);
  t.is(result.indexOf('resources/ls/file1.js') > -1, true);
  t.is(result.indexOf('resources/ls/file2.js') > -1, true);
});

test('one file that exists, one that doesn\'t', t => {
  const result = shell.ls('resources/ls/file1.js', 'resources/ls/thisdoesntexist');
  t.truthy(shell.error());
  t.is(result.code, 2);
  t.is(result.length, 1);
  t.is(result.indexOf('resources/ls/file1.js') > -1, true);
});

test('one file that exists, one that doesn\'t (other order)', t => {
  const result = shell.ls('resources/ls/thisdoesntexist', 'resources/ls/file1.js');
  t.truthy(shell.error());
  t.is(result.code, 2);
  t.is(result.length, 1);
  t.is(result.indexOf('resources/ls/file1.js') > -1, true);
});

test('wildcard, should not do partial matches', t => {
  const result = shell.ls('resources/ls/*.j'); // shouldn't get .js
  t.truthy(shell.error());
  t.is(result.code, 2);
  t.is(result.length, 0);
});

test('wildcard, all files with extension', t => {
  const result = shell.ls('resources/ls/*.*');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.length, 3);
  t.is(result.indexOf('resources/ls/file1.js') > -1, true);
  t.is(result.indexOf('resources/ls/file2.js') > -1, true);
  t.is(
    result.indexOf('resources/ls/filename(with)[chars$]^that.must+be-escaped') > -1,
    true
  );
});

test('wildcard, with additional path', t => {
  const result = shell.ls('resources/ls/f*le*.js', 'resources/ls/a_dir');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.length, 4);
  t.is(result.indexOf('resources/ls/file1.js') > -1, true);
  t.is(result.indexOf('resources/ls/file2.js') > -1, true);
  t.is(result.indexOf('b_dir') > -1, true); // no wildcard == no path prefix
  t.is(result.indexOf('nada') > -1, true); // no wildcard == no path prefix
});

test('wildcard for both paths', t => {
  const result = shell.ls('resources/ls/f*le*.js', 'resources/ls/a_dir/*');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.length, 4);
  t.is(result.indexOf('resources/ls/file1.js') > -1, true);
  t.is(result.indexOf('resources/ls/file2.js') > -1, true);
  t.is(result.indexOf('z') > -1, true);
  t.is(result.indexOf('resources/ls/a_dir/nada') > -1, true);
});

test('wildcard for both paths, array', t => {
  const result = shell.ls(['resources/ls/f*le*.js', 'resources/ls/a_dir/*']);
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.length, 4);
  t.is(result.indexOf('resources/ls/file1.js') > -1, true);
  t.is(result.indexOf('resources/ls/file2.js') > -1, true);
  t.is(result.indexOf('z') > -1, true);
  t.is(result.indexOf('resources/ls/a_dir/nada') > -1, true);
});

test('recursive, no path', t => {
  shell.cd('resources/ls');
  const result = shell.ls('-R');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.indexOf('a_dir') > -1, true);
  t.is(result.indexOf('a_dir/b_dir') > -1, true);
  t.is(result.indexOf('a_dir/b_dir/z') > -1, true);
  t.is(result.length, 9);
  shell.cd('../..');
});

test('recusive, path given', t => {
  const result = shell.ls('-R', 'resources/ls');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.indexOf('a_dir') > -1, true);
  t.is(result.indexOf('a_dir/b_dir') > -1, true);
  t.is(result.indexOf('a_dir/b_dir/z') > -1, true);
  t.is(result.length, 9);
});

test('recusive, path given - \'all\' flag', t => {
  const result = shell.ls('-RA', 'resources/ls');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.indexOf('a_dir') > -1, true);
  t.is(result.indexOf('a_dir/b_dir') > -1, true);
  t.is(result.indexOf('a_dir/b_dir/z') > -1, true);
  t.is(result.indexOf('a_dir/.hidden_dir/nada') > -1, true);
  t.is(result.length, 14);
});

test('recursive, wildcard', t => {
  const result = shell.ls('-R', 'resources/ls');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.indexOf('a_dir') > -1, true);
  t.is(result.indexOf('a_dir/b_dir') > -1, true);
  t.is(result.indexOf('a_dir/b_dir/z') > -1, true);
  t.is(result.length, 9);
});

test('-Rd works like -d', t => {
  const result = shell.ls('-Rd', 'resources/ls');
  t.is(shell.error(), null);
  t.is(result.length, 1);
});

test('directory option, single arg', t => {
  const result = shell.ls('-d', 'resources/ls');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.length, 1);
});

test('directory option, single arg with trailing \'/\'', t => {
  const result = shell.ls('-d', 'resources/ls/');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.length, 1);
});

test('directory option, multiple args', t => {
  const result = shell.ls('-d', 'resources/ls/a_dir', 'resources/ls/file1');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.truthy(result.indexOf('resources/ls/a_dir') > -1);
  t.truthy(result.indexOf('resources/ls/file1') > -1);
  t.is(result.length, 2);
});

test('directory option, globbed arg', t => {
  const result = shell.ls('-d', 'resources/ls/*');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.truthy(result.indexOf('resources/ls/a_dir') > -1);
  t.truthy(result.indexOf('resources/ls/file1') > -1);
  t.truthy(result.indexOf('resources/ls/file1.js') > -1);
  t.truthy(result.indexOf('resources/ls/file2') > -1);
  t.truthy(result.indexOf('resources/ls/file2.js') > -1);
  t.truthy(result.indexOf('resources/ls/file2') > -1);
  t.truthy(
    result.indexOf('resources/ls/filename(with)[chars$]^that.must+be-escaped') > -1
  );
  t.is(result.length, 6);
});

test('long option, single file', t => {
  let result = shell.ls('-l', 'resources/ls/file1');
  t.is(result.length, 1);
  result = result[0];
  t.is(shell.error(), null);
  t.truthy(result.name, 'file1');
  t.is(result.nlink, 1);
  t.is(result.size, 5);
  t.truthy(result.mode); // check that these keys exist
  t.truthy(process.platform === 'win32' || result.uid); // only on unix
  t.truthy(process.platform === 'win32' || result.gid); // only on unix
  t.truthy(result.mtime); // check that these keys exist
  t.truthy(result.atime); // check that these keys exist
  t.truthy(result.ctime); // check that these keys exist
  t.truthy(result.toString().match(/^(\d+ +){5}.*$/));
});

test('long option, glob files', t => {
  let result = shell.ls('-l', 'resources/ls/f*le1');
  t.is(result.length, 1);
  result = result[0];
  t.is(shell.error(), null);
  t.truthy(result.name, 'file1');
  t.is(result.nlink, 1);
  t.is(result.size, 5);
  t.truthy(result.mode); // check that these keys exist
  t.truthy(process.platform === 'win32' || result.uid); // only on unix
  t.truthy(process.platform === 'win32' || result.gid); // only on unix
  t.truthy(result.mtime); // check that these keys exist
  t.truthy(result.atime); // check that these keys exist
  t.truthy(result.ctime); // check that these keys exist
  t.truthy(result.toString().match(/^(\d+ +){5}.*$/));
});

test('long option, directory', t => {
  let result = shell.ls('-l', 'resources/ls');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  let idx = -1;
  for (let k = 0; k < result.length; k++) {
    if (result[k].name === 'file1') {
      idx = k;
      break;
    }
  }
  t.truthy(idx >= 0);
  t.is(result.length, 6);
  result = result[idx];
  t.is(result.name, 'file1');
  t.is(result.nlink, 1);
  t.is(result.size, 5);
  t.truthy(result.mode); // check that these keys exist
  t.truthy(process.platform === 'win32' || result.uid); // only on unix
  t.truthy(process.platform === 'win32' || result.gid); // only on unix
  t.truthy(result.mtime); // check that these keys exist
  t.truthy(result.atime); // check that these keys exist
  t.truthy(result.ctime); // check that these keys exist
  t.truthy(result.toString().match(/^(\d+ +){5}.*$/));
});

test('long option, directory, recursive (and windows converts slashes)', t => {
  let result = shell.ls('-lR', 'resources/ls/');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  let idx = -1;
  for (let k = 0; k < result.length; k++) {
    if (result[k].name === 'a_dir/b_dir') {
      idx = k;
      break;
    }
  }

  t.is(result.length, 9);
  t.truthy(idx >= 0);
  result = result[idx];
  t.is(result.name, result.name);
  t.truthy(fs.statSync('resources/ls/a_dir/b_dir').isDirectory());
  t.truthy(typeof result.nlink === 'number'); // This can vary between the local machine and travis
  t.truthy(typeof result.size === 'number'); // This can vary between different file systems
  t.truthy(result.mode); // check that these keys exist
  t.truthy(process.platform === 'win32' || result.uid); // only on unix
  t.truthy(process.platform === 'win32' || result.gid); // only on unix
  t.truthy(result.mtime); // check that these keys exist
  t.truthy(result.atime); // check that these keys exist
  t.truthy(result.ctime); // check that these keys exist
  t.truthy(result.toString().match(/^(\d+ +){5}.*$/));
});

test('still lists broken links', t => {
  const result = shell.ls('resources/badlink');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.indexOf('resources/badlink') > -1, true);
  t.is(result.length, 1);
});

test('Test new ShellString-like attributes', t => {
  const result = shell.ls('resources/ls');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.stdout.indexOf('file1') > -1, true);
  t.is(result.stdout.indexOf('file2') > -1, true);
  t.is(result.stdout.indexOf('file1.js') > -1, true);
  t.is(result.stdout.indexOf('file2.js') > -1, true);
  t.is(
    result.stdout.indexOf('filename(with)[chars$]^that.must+be-escaped') > -1,
    true
  );
  t.is(result.stdout.indexOf('a_dir') > -1, true);
  t.true(typeof result.stdout === 'string');
  t.truthy(result.to);
  t.truthy(result.toEnd);
  result.to(`${TMP}/testingToOutput.txt`);
  t.is(shell.cat(`${TMP}/testingToOutput.txt`).toString(), result.stdout);
  shell.rm(`${TMP}/testingToOutput.txt`);
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
  t.is(fs.existsSync('/asdfasdf'), false); // sanity check
  const result = shell.ls('resources/ls/file1', '/asdfasdf');
  t.truthy(shell.error());
  t.is('ls: no such file or directory: /asdfasdf', result.stderr);
});
