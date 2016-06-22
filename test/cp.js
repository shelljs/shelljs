var shell = require('..');
var common = require('../src/common');

var assert = require('assert'),
    fs = require('fs'),
    numLines = require('./utils/utils').numLines;

shell.config.silent = true;

var isWindows = common.platform === 'win';

// On Windows, symlinks for files need admin permissions. This helper
// skips certain tests if we are on Windows and got an EPERM error
function skipOnWinForEPERM (action, test) {
    action();
    var error = shell.error();

    if (isWindows && error && /EPERM:/.test(error)) {
        console.log("Got EPERM when testing symlinks on Windows. Assuming non-admin environment and skipping test.");
    } else {
        test();
    }
}


shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Invalids
//

var result = shell.cp();
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(result.stderr, 'cp: missing <source> and/or <dest>');

result = shell.cp('file1');
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(result.stderr, 'cp: missing <source> and/or <dest>');

result = shell.cp('-f');
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(result.stderr, 'cp: missing <source> and/or <dest>');

shell.rm('-rf', 'tmp/*');
result = shell.cp('-@', 'resources/file1', 'tmp/file1'); // option not supported, files OK
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(fs.existsSync('tmp/file1'), false);
assert.equal(result.stderr, 'cp: option not recognized: @');

result = shell.cp('-Z', 'asdfasdf', 'tmp/file2'); // option not supported, files NOT OK
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(fs.existsSync('tmp/file2'), false);
assert.equal(result.stderr, 'cp: option not recognized: Z');

result = shell.cp('asdfasdf', 'tmp'); // source does not exist
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(numLines(result.stderr), 1);
assert.equal(fs.existsSync('tmp/asdfasdf'), false);
assert.equal(result.stderr, 'cp: no such file or directory: asdfasdf');

result = shell.cp('asdfasdf1', 'asdfasdf2', 'tmp'); // sources do not exist
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(numLines(result.stderr), 2);
assert.equal(fs.existsSync('tmp/asdfasdf1'), false);
assert.equal(fs.existsSync('tmp/asdfasdf2'), false);
assert.equal(result.stderr, 'cp: no such file or directory: asdfasdf1\ncp: no such file or directory: asdfasdf2');

result = shell.cp('asdfasdf1', 'asdfasdf2', 'resources/file1'); // too many sources (dest is file)
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(result.stderr, 'cp: dest is not a directory (too many sources)');

result = shell.cp('resources/file1', 'resources/file2', 'tmp/a_file'); // too many sources
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(fs.existsSync('tmp/a_file'), false);
assert.equal(result.stderr, 'cp: dest is not a directory (too many sources)');

//
// Valids
//

var oldContents = shell.cat('resources/file2').toString();
result = shell.cp('-n', 'resources/file1', 'resources/file2'); // dest already exists
assert.ok(!shell.error());
assert.equal(result.code, 0);
assert.equal(result.stderr, '');
assert.equal(shell.cat('resources/file2').toString(), oldContents);

// -f by default
result = shell.cp('resources/file2', 'resources/copyfile2');
result = shell.cp('resources/file1', 'resources/file2'); // dest already exists
assert.ok(!shell.error());
assert.equal(result.code, 0);
assert.ok(!result.stderr);
assert.equal(shell.cat('resources/file1') + '', shell.cat('resources/file2') + ''); // after cp
shell.mv('resources/copyfile2', 'resources/file2'); // restore
assert.ok(!shell.error());

// -f (explicitly)
result = shell.cp('resources/file2', 'resources/copyfile2');
result = shell.cp('-f', 'resources/file1', 'resources/file2'); // dest already exists
assert.ok(!shell.error());
assert.ok(!result.stderr);
assert.equal(result.code, 0);
assert.equal(shell.cat('resources/file1') + '', shell.cat('resources/file2') + ''); // after cp
shell.mv('resources/copyfile2', 'resources/file2'); // restore
assert.ok(!shell.error());
assert.equal(result.code, 0);

// simple - to dir
result = shell.cp('resources/file1', 'tmp');
assert.equal(shell.error(), null);
assert.ok(!result.stderr);
assert.equal(result.code, 0);
assert.equal(fs.existsSync('tmp/file1'), true);

// simple - to file
result = shell.cp('resources/file2', 'tmp/file2');
assert.equal(shell.error(), null);
assert.ok(!result.stderr);
assert.equal(result.code, 0);
assert.equal(fs.existsSync('tmp/file2'), true);

// simple - file list
shell.rm('-rf', 'tmp/*');
result = shell.cp('resources/file1', 'resources/file2', 'tmp');
assert.equal(shell.error(), null);
assert.ok(!result.stderr);
assert.equal(result.code, 0);
assert.equal(fs.existsSync('tmp/file1'), true);
assert.equal(fs.existsSync('tmp/file2'), true);

// simple - file list, array syntax
shell.rm('-rf', 'tmp/*');
result = shell.cp(['resources/file1', 'resources/file2'], 'tmp');
assert.equal(shell.error(), null);
assert.ok(!result.stderr);
assert.equal(result.code, 0);
assert.equal(fs.existsSync('tmp/file1'), true);
assert.equal(fs.existsSync('tmp/file2'), true);

result = shell.cp('resources/file2', 'tmp/file3');
assert.equal(fs.existsSync('tmp/file3'), true);
result = shell.cp('-f', 'resources/file2', 'tmp/file3'); // file exists, but -f specified
assert.equal(shell.error(), null);
assert.ok(!result.stderr);
assert.equal(result.code, 0);
assert.equal(fs.existsSync('tmp/file3'), true);

// glob
shell.rm('-rf', 'tmp/*');
result = shell.cp('resources/file?', 'tmp');
assert.equal(shell.error(), null);
assert.ok(!result.stderr);
assert.equal(result.code, 0);
assert.ok(fs.existsSync('tmp/file1'));
assert.ok(fs.existsSync('tmp/file2'));
assert.ok(!fs.existsSync('tmp/file1.js'));
assert.ok(!fs.existsSync('tmp/file2.js'));
assert.ok(!fs.existsSync('tmp/file1.txt'));
assert.ok(!fs.existsSync('tmp/file2.txt'));

// wildcard
shell.rm('tmp/file1', 'tmp/file2');
result = shell.cp('resources/file*', 'tmp');
assert.equal(shell.error(), null);
assert.ok(!result.stderr);
assert.equal(result.code, 0);
assert.ok(fs.existsSync('tmp/file1'));
assert.ok(fs.existsSync('tmp/file2'));
assert.ok(fs.existsSync('tmp/file1.js'));
assert.ok(fs.existsSync('tmp/file2.js'));
assert.ok(fs.existsSync('tmp/file1.txt'));
assert.ok(fs.existsSync('tmp/file2.txt'));

// recursive, with regular files
shell.rm('-rf', 'tmp/*');
result = shell.cp('-R', 'resources/file1', 'resources/file2', 'tmp');
assert.equal(shell.error(), null);
assert.ok(!result.stderr);
assert.equal(result.code, 0);
assert.ok(fs.existsSync('tmp/file1'));
assert.ok(fs.existsSync('tmp/file2'));

// recursive, nothing exists
shell.rm('-rf', 'tmp/*');
result = shell.cp('-R', 'resources/cp', 'tmp');
assert.equal(shell.error(), null);
assert.ok(!result.stderr);
assert.equal(result.code, 0);
assert.equal(shell.ls('-R', 'resources/cp') + '', shell.ls('-R', 'tmp/cp') + '');

//recursive, nothing exists, source ends in '/' (see Github issue #15)
shell.rm('-rf', 'tmp/*');
result = shell.cp('-R', 'resources/cp/', 'tmp/');
assert.equal(shell.error(), null);
assert.ok(!result.stderr);
assert.equal(result.code, 0);
assert.equal(shell.ls('-R', 'resources/cp') + '', shell.ls('-R', 'tmp/cp') + '');

// recursive, globbing regular files with extension (see Github issue #376)
shell.rm('-rf', 'tmp/*');
result = shell.cp('-R', 'resources/file*.txt', 'tmp');
assert.equal(shell.error(), null);
assert.ok(!result.stderr);
assert.equal(result.code, 0);
assert.ok(fs.existsSync('tmp/file1.txt'));
assert.ok(fs.existsSync('tmp/file2.txt'));

// recursive, copying one regular file (also related to Github issue #376)
shell.rm('-rf', 'tmp/*');
result = shell.cp('-R', 'resources/file1.txt', 'tmp');
assert.equal(shell.error(), null);
assert.ok(!result.stderr);
assert.equal(result.code, 0);
assert.ok(fs.existsSync('tmp/file1.txt'));
assert.ok(!fs.statSync('tmp/file1.txt').isDirectory()); // don't let it be a dir

//recursive, everything exists, no force flag
shell.rm('-rf', 'tmp/*');
result = shell.cp('-R', 'resources/cp', 'tmp');
result = shell.cp('-R', 'resources/cp', 'tmp');
assert.equal(shell.error(), null); // crash test only
assert.ok(!result.stderr);
assert.equal(result.code, 0);

if (process.platform !== 'win32') {
  // Recursive, everything exists, overwrite a real file with a link (if same name)
  // Because -R implies to not follow links!
  shell.rm('-rf', 'tmp/*');
  shell.cp('-R', 'resources/cp/*', 'tmp');
  assert.ok(fs.lstatSync('tmp/links/sym.lnk').isSymbolicLink()); // this one is a link
  assert.ok(!(fs.lstatSync('tmp/fakeLinks/sym.lnk').isSymbolicLink())); // this one isn't
  assert.notEqual(shell.cat('tmp/links/sym.lnk').toString(), shell.cat('tmp/fakeLinks/sym.lnk').toString());
  result = shell.cp('-R', 'tmp/links/*', 'tmp/fakeLinks');
  assert.equal(shell.error(), null);
  assert.ok(!result.stderr);
  assert.equal(result.code, 0);
  assert.ok(fs.lstatSync('tmp/links/sym.lnk').isSymbolicLink()); // this one is a link
  assert.ok(fs.lstatSync('tmp/fakeLinks/sym.lnk').isSymbolicLink()); // this one is now a link
  assert.equal(shell.cat('tmp/links/sym.lnk').toString(), shell.cat('tmp/fakeLinks/sym.lnk').toString());

  // Recursive, everything exists, overwrite a real file *by following a link*
  // Because missing the -R implies -L.
  shell.rm('-rf', 'tmp/*');
  shell.cp('-R', 'resources/cp/*', 'tmp');
  assert.ok(fs.lstatSync('tmp/links/sym.lnk').isSymbolicLink()); // this one is a link
  assert.ok(!(fs.lstatSync('tmp/fakeLinks/sym.lnk').isSymbolicLink())); // this one isn't
  assert.notEqual(shell.cat('tmp/links/sym.lnk').toString(), shell.cat('tmp/fakeLinks/sym.lnk').toString());
  result = shell.cp('tmp/links/*', 'tmp/fakeLinks'); // don't use -R
  assert.equal(shell.error(), null);
  assert.ok(!result.stderr);
  assert.equal(result.code, 0);
  assert.ok(fs.lstatSync('tmp/links/sym.lnk').isSymbolicLink()); // this one is a link
  assert.ok(!fs.lstatSync('tmp/fakeLinks/sym.lnk').isSymbolicLink()); // this one is still not a link
  // But it still follows the link
  assert.equal(shell.cat('tmp/links/sym.lnk').toString(), shell.cat('tmp/fakeLinks/sym.lnk').toString());
}

//recursive, everything exists, with force flag
shell.rm('-rf', 'tmp/*');
result = shell.cp('-R', 'resources/cp', 'tmp');
shell.ShellString('changing things around').to('tmp/cp/dir_a/z');
assert.notEqual(shell.cat('resources/cp/dir_a/z') + '', shell.cat('tmp/cp/dir_a/z') + ''); // before cp
result = shell.cp('-Rf', 'resources/cp', 'tmp');
assert.equal(shell.error(), null);
assert.ok(!result.stderr);
assert.equal(result.code, 0);
assert.equal(shell.cat('resources/cp/dir_a/z') + '', shell.cat('tmp/cp/dir_a/z') + ''); // after cp

//recursive, creates dest dir since it's only one level deep (see Github issue #44)
shell.rm('-rf', 'tmp/*');
result = shell.cp('-r', 'resources/issue44', 'tmp/dir2');
assert.equal(shell.error(), null);
assert.ok(!result.stderr);
assert.equal(result.code, 0);
assert.equal(shell.ls('-R', 'resources/issue44') + '', shell.ls('-R', 'tmp/dir2') + '');
assert.equal(shell.cat('resources/issue44/main.js') + '', shell.cat('tmp/dir2/main.js') + '');

//recursive, does *not* create dest dir since it's too deep (see Github issue #44)
shell.rm('-rf', 'tmp/*');
result = shell.cp('-r', 'resources/issue44', 'tmp/dir2/dir3');
assert.ok(shell.error());
assert.equal(result.stderr, 'cp: cannot create directory \'tmp/dir2/dir3\': No such file or directory');
assert.equal(result.code, 1);
assert.equal(fs.existsSync('tmp/dir2'), false);

//recursive, copies entire directory
shell.rm('-rf', 'tmp/*');
result = shell.cp('-r', 'resources/cp/dir_a', 'tmp/dest');
assert.equal(shell.error(), null);
assert.ok(!result.stderr);
assert.equal(result.code, 0);
assert.equal(fs.existsSync('tmp/dest/z'), true);

//recursive, with trailing slash, does the exact same
shell.rm('-rf', 'tmp/*');
result = shell.cp('-r', 'resources/cp/dir_a/', 'tmp/dest');
assert.equal(shell.error(), null);
assert.equal(fs.existsSync('tmp/dest/z'), true);

// On Windows, permission bits are quite different so skip those tests for now
if (common.platform !== 'win') {
  //preserve mode bits
  shell.rm('-rf', 'tmp/*');
  var execBit = parseInt('001', 8);
  assert.equal(fs.statSync('resources/cp-mode-bits/executable').mode & execBit, execBit);
  shell.cp('resources/cp-mode-bits/executable', 'tmp/executable');
  assert.equal(fs.statSync('resources/cp-mode-bits/executable').mode, fs.statSync('tmp/executable').mode);
}

// Make sure hidden files are copied recursively
shell.rm('-rf', 'tmp/');
result = shell.cp('-r', 'resources/ls/', 'tmp/');
assert.ok(!shell.error());
assert.ok(!result.stderr);
assert.equal(result.code, 0);
assert.ok(fs.existsSync('tmp/.hidden_file'));

// no-recursive will copy regular files only
shell.rm('-rf', 'tmp/');
shell.mkdir('tmp/');
result = shell.cp('resources/file1.txt', 'resources/ls/', 'tmp/');
assert.ok(shell.error());
assert.ok(!fs.existsSync('tmp/.hidden_file')); // doesn't copy dir contents
assert.ok(!fs.existsSync('tmp/ls')); // doesn't copy dir itself
assert.ok(fs.existsSync('tmp/file1.txt'));

// no-recursive will copy regular files only
shell.rm('-rf', 'tmp/');
shell.mkdir('tmp/');
result = shell.cp('resources/file1.txt', 'resources/file2.txt', 'resources/cp',
  'resources/ls/', 'tmp/');
assert.ok(shell.error());
assert.ok(!fs.existsSync('tmp/.hidden_file')); // doesn't copy dir contents
assert.ok(!fs.existsSync('tmp/ls')); // doesn't copy dir itself
assert.ok(!fs.existsSync('tmp/a')); // doesn't copy dir contents
assert.ok(!fs.existsSync('tmp/cp')); // doesn't copy dir itself
assert.ok(fs.existsSync('tmp/file1.txt'));
assert.ok(fs.existsSync('tmp/file2.txt'));

if (process.platform !== 'win32') {
  // -R implies -P
  shell.rm('-rf', 'tmp/*');
  shell.cp('-R', 'resources/cp/links/sym.lnk', 'tmp');
  assert.ok(fs.lstatSync('tmp/sym.lnk').isSymbolicLink());

  // using -P explicitly works
  shell.rm('-rf', 'tmp/*');
  shell.cp('-P', 'resources/cp/links/sym.lnk', 'tmp');
  assert.ok(fs.lstatSync('tmp/sym.lnk').isSymbolicLink());

  // using -PR on a link to a folder does not follow the link
  shell.rm('-rf', 'tmp/*');
  shell.cp('-PR', 'resources/cp/symFolder', 'tmp');
  assert.ok(fs.lstatSync('tmp/symFolder').isSymbolicLink());

  // -L overrides -P for copying directory
  shell.rm('-rf', 'tmp/*');
  shell.cp('-LPR', 'resources/cp/symFolder', 'tmp');
  assert.ok(!fs.lstatSync('tmp/symFolder').isSymbolicLink());
  assert.ok(!fs.lstatSync('tmp/symFolder/sym.lnk').isSymbolicLink());

  // Recursive, copies entire directory with no symlinks and -L option does not cause change in behavior.
  shell.rm('-rf', 'tmp/*');
  result = shell.cp('-rL', 'resources/cp/dir_a', 'tmp/dest');
  assert.equal(shell.error(), null);
  assert.ok(!result.stderr);
  assert.equal(result.code, 0);
  assert.equal(fs.existsSync('tmp/dest/z'), true);
}

// using -R on a link to a folder *does* follow the link
shell.rm('-rf', 'tmp/*');
shell.cp('-R', 'resources/cp/symFolder', 'tmp');
assert.ok(!fs.lstatSync('tmp/symFolder').isSymbolicLink());

// Without -R, -L is implied
shell.rm('-rf', 'tmp/*');
shell.cp('resources/cp/links/sym.lnk', 'tmp');
assert.ok(!fs.lstatSync('tmp/sym.lnk').isSymbolicLink());

// -L explicitly works
shell.rm('-rf', 'tmp/*');
shell.cp('-L', 'resources/cp/links/sym.lnk', 'tmp');
assert.ok(!fs.lstatSync('tmp/sym.lnk').isSymbolicLink());

// using -LR does not imply -P
shell.rm('-rf', 'tmp/*');
shell.cp('-LR', 'resources/cp/links/sym.lnk', 'tmp');
assert.ok(!fs.lstatSync('tmp/sym.lnk').isSymbolicLink());

// using -LR also works recursively on directories containing links
shell.rm('-rf', 'tmp/*');
shell.cp('-LR', 'resources/cp/links', 'tmp');
assert.ok(!fs.lstatSync('tmp/links/sym.lnk').isSymbolicLink());

// -L always overrides a -P
shell.rm('-rf', 'tmp/*');
shell.cp('-LP', 'resources/cp/links/sym.lnk', 'tmp');
assert.ok(!fs.lstatSync('tmp/sym.lnk').isSymbolicLink());
shell.rm('-rf', 'tmp/*');
shell.cp('-LPR', 'resources/cp/links/sym.lnk', 'tmp');
assert.ok(!fs.lstatSync('tmp/sym.lnk').isSymbolicLink());

// Test max depth.
shell.rm('-rf', 'tmp/');
shell.mkdir('tmp/');
shell.config.maxdepth = 32;
var directory = '';
for (var i = 1; i < 40; i++) {
  directory += '/'+i;
}
var directory32deep = '';
for (var i = 1; i < 32; i++) {
  directory32deep += '/'+i;
}
shell.mkdir('-p', 'tmp/0' + directory);
shell.cp('-r', 'tmp/0', 'tmp/copytestdepth');
// Check full directory exists.
assert.ok(shell.test('-d', 'tmp/0/' + directory));
// Check full copy of directory does not exist.
assert.ok(!shell.test('-d', 'tmp/copytestdepth'+directory));
// Check last directory to exist is bellow maxdepth.
assert.ok(shell.test('-d', 'tmp/copytestdepth'+directory32deep));
assert.ok(!shell.test('-d', 'tmp/copytestdepth'+directory32deep+'/32'));

// Only complete sym link checks if script has permission to do so.
skipOnWinForEPERM(shell.ln.bind(shell, '-s', 'tmp/0', 'tmp/symlinktest'), function () {
    if (!shell.test('-L', 'tmp/symlinktest')) {
        return;
    }
    shell.rm('-rf', 'tmp/symlinktest');
    // Create sym links to check for cycle.
    shell.cd('tmp/0/1/2/3/4');
    shell.ln('-s', '../../../2', 'link');
    shell.ln('-s', './5/6/7', 'link1');
    shell.cd('../../../../../..');
    assert.ok(shell.test('-d', 'tmp/'));

    shell.rm('-fr', 'tmp/copytestdepth');
    shell.cp('-r', 'tmp/0', 'tmp/copytestdepth');
    assert.ok(shell.test('-d', 'tmp/copytestdepth/1/2/3/4/link/3/4/link/3/4'));

    // Test copying of symlinked files cp -L.
    shell.rm('-fr', 'tmp');
    shell.mkdir('-p', 'tmp/sub');
    shell.mkdir('-p', 'tmp/new');
    shell.cp('-f', 'resources/file1.txt', 'tmp/sub/file.txt');
    shell.cd('tmp/sub');
    shell.ln('-s', 'file.txt', 'foo.lnk');
    shell.ln('-s', 'file.txt', 'sym.lnk');
    shell.cd('..');
    shell.cp('-L', 'sub/*', 'new/');

    // Ensure copies are files.
    shell.cd('new');
    shell.cp('-f', '../../resources/file2.txt', 'file.txt');
    assert.equal(shell.cat('file.txt').toString(), 'test2\n');
    // Ensure other files have not changed.
    assert.equal(shell.cat('foo.lnk').toString(), 'test1\n');
    assert.equal(shell.cat('sym.lnk').toString(), 'test1\n');

    // Ensure the links are converted to files.
    assert.equal(shell.test('-L', 'foo.lnk'), false);
    assert.equal(shell.test('-L', 'sym.lnk'), false);
    shell.cd('../..');

    // Test with recurisve option and symlinks.

    shell.rm('-fr', 'tmp');
    shell.mkdir('-p', 'tmp/sub/sub1');
    shell.cp('-f', 'resources/file1.txt', 'tmp/sub/file.txt');
    shell.cp('-f', 'resources/file1.txt', 'tmp/sub/sub1/file.txt');
    shell.cd('tmp/sub');
    shell.ln('-s', 'file.txt', 'foo.lnk');
    shell.ln('-s', 'file.txt', 'sym.lnk');
    shell.cd('sub1');
    shell.ln('-s', '../file.txt', 'foo.lnk');
    shell.ln('-s', '../file.txt', 'sym.lnk');

    // Ensure file reads from proper source.
    assert.equal(shell.cat('file.txt').toString(), 'test1\n');
    assert.equal(shell.cat('foo.lnk').toString(), 'test1\n');
    assert.equal(shell.cat('sym.lnk').toString(), 'test1\n');
    assert.equal(shell.test('-L', 'foo.lnk'), true);
    assert.equal(shell.test('-L', 'sym.lnk'), true);
    shell.cd('../..');
    shell.cp('-rL', 'sub/', 'new/');
    shell.cd('new');

    // Ensure copies of files are symlinks by updating file contents.
    shell.cp('-f', '../../resources/file2.txt', 'file.txt');
    assert.equal(shell.cat('file.txt').toString(), 'test2\n');
    // Ensure other files have not changed.
    assert.equal(shell.cat('foo.lnk').toString(), 'test1\n');
    assert.equal(shell.cat('sym.lnk').toString(), 'test1\n');

    // Ensure the links are converted to files.
    assert.equal(shell.test('-L', 'foo.lnk'), false);
    assert.equal(shell.test('-L', 'sym.lnk'), false);

    shell.cd('sub1');
    shell.cp('-f', '../../../resources/file2.txt', 'file.txt');
    assert.equal(shell.cat('file.txt').toString(), 'test2\n');
    // Ensure other files have not changed.
    assert.equal(shell.cat('foo.lnk').toString(), 'test1\n');
    assert.equal(shell.cat('sym.lnk').toString(), 'test1\n');

    // Ensure the links are converted to files.
    assert.equal(shell.test('-L', 'foo.lnk'), false);
    assert.equal(shell.test('-L', 'sym.lnk'), false);
});

shell.exit(123);
