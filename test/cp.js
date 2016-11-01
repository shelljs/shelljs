import test from 'ava';
import shell from '..';
import common from '../src/common';
import fs from 'fs';
import utils from './utils/utils';

const numLines = utils.numLines;
const skipOnWinForEPERM = require('./utils/utils').skipOnWinForEPERM;
const oldMaxDepth = shell.config.maxdepth;
const CWD = process.cwd();

let TMP;

test.beforeEach(() => {
  TMP = utils.getTempDir();
  shell.config.silent = true;
  shell.mkdir(TMP);
});

test.afterEach.always(() => {
  process.chdir(CWD);
  shell.rm('-rf', TMP);
  shell.config.maxdepth = oldMaxDepth;
});

//
// Invalids
//

test('no args', t => {
  const result = shell.cp();
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'cp: missing <source> and/or <dest>');
});

test('no destination', t => {
  const result = shell.cp('file1');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'cp: missing <source> and/or <dest>');
});

test('only an option', t => {
  const result = shell.cp('-f');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'cp: missing <source> and/or <dest>');
});

test('invalid option', t => {
  const result = shell.cp('-@', 'resources/file1', `${TMP}/file1`);
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(fs.existsSync(`${TMP}/file1`), false);
  t.is(result.stderr, 'cp: option not recognized: @');
});

test('invalid option', t => {
  const result = shell.cp('-Z', 'asdfasdf', `${TMP}/file2`);
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(fs.existsSync(`${TMP}/file2`), false);
  t.is(result.stderr, 'cp: option not recognized: Z');
});

test('source does not exist', t => {
  const result = shell.cp('asdfasdf', TMP);
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(numLines(result.stderr), 1);
  t.is(fs.existsSync(`${TMP}/asdfasdf`), false);
  t.is(result.stderr, 'cp: no such file or directory: asdfasdf');
});

test('sources does not exist', t => {
  const result = shell.cp('asdfasdf1', 'asdfasdf2', TMP);
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(numLines(result.stderr), 2);
  t.is(fs.existsSync(`${TMP}/asdfasdf1`), false);
  t.is(fs.existsSync(`${TMP}/asdfasdf2`), false);
  t.is(
    result.stderr,
    'cp: no such file or directory: asdfasdf1\ncp: no such file or directory: asdfasdf2'
  );
});

test('too many sources', t => {
  const result = shell.cp('asdfasdf1', 'asdfasdf2', 'resources/file1');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'cp: dest is not a directory (too many sources)');
});

test('too many sources #2', t => {
  const result = shell.cp('resources/file1', 'resources/file2', `${TMP}/a_file`);
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(fs.existsSync(`${TMP}/a_file`), false);
  t.is(result.stderr, 'cp: dest is not a directory (too many sources)');
});

//
// Valids
//

test('dest already exists', t => {
  const oldContents = shell.cat('resources/file2').toString();
  const result = shell.cp('-n', 'resources/file1', 'resources/file2');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stderr, '');
  t.is(shell.cat('resources/file2').toString(), oldContents);
});

test('-f by default', t => {
  shell.cp('resources/file2', 'resources/copyfile2');
  const result = shell.cp('resources/file1', 'resources/file2'); // dest already exists
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.falsy(result.stderr);
  t.is(shell.cat('resources/file1').toString(), shell.cat('resources/file2').toString()); // after cp
  shell.mv('resources/copyfile2', 'resources/file2'); // restore
  t.falsy(shell.error());
});

test('-f (explicitly)', t => {
  shell.cp('resources/file2', 'resources/copyfile2');
  const result = shell.cp('-f', 'resources/file1', 'resources/file2'); // dest already exists
  t.falsy(shell.error());
  t.falsy(result.stderr);
  t.is(result.code, 0);
  t.is(shell.cat('resources/file1').toString(), shell.cat('resources/file2').toString()); // after cp
  shell.mv('resources/copyfile2', 'resources/file2'); // restore
  t.falsy(shell.error());
  t.is(result.code, 0);
});

test('simple - to dir', t => {
  const result = shell.cp('resources/file1', TMP);
  t.falsy(shell.error());
  t.falsy(result.stderr);
  t.is(result.code, 0);
  t.is(fs.existsSync(`${TMP}/file1`), true);
});

test('simple - to file', t => {
  const result = shell.cp('resources/file2', `${TMP}/file2`);
  t.falsy(shell.error());
  t.falsy(result.stderr);
  t.is(result.code, 0);
  t.is(fs.existsSync(`${TMP}/file2`), true);
});

test('simple - file list', t => {
  const result = shell.cp('resources/file1', 'resources/file2', TMP);
  t.falsy(shell.error());
  t.falsy(result.stderr);
  t.is(result.code, 0);
  t.is(fs.existsSync(`${TMP}/file1`), true);
  t.is(fs.existsSync(`${TMP}/file2`), true);
});

test('simple - file list, array syntax', t => {
  const result = shell.cp(['resources/file1', 'resources/file2'], TMP);
  t.falsy(shell.error());
  t.falsy(result.stderr);
  t.is(result.code, 0);
  t.is(fs.existsSync(`${TMP}/file1`), true);
  t.is(fs.existsSync(`${TMP}/file2`), true);
});

test('-f option', t => {
  shell.cp('resources/file2', `${TMP}/file3`);
  t.is(fs.existsSync(`${TMP}/file3`), true);
  const result = shell.cp('-f', 'resources/file2', `${TMP}/file3`); // file exists, but -f specified
  t.falsy(shell.error());
  t.falsy(result.stderr);
  t.is(result.code, 0);
  t.is(fs.existsSync(`${TMP}/file3`), true);
});

test('glob', t => {
  const result = shell.cp('resources/file?', TMP);
  t.falsy(shell.error());
  t.falsy(result.stderr);
  t.is(result.code, 0);
  t.truthy(fs.existsSync(`${TMP}/file1`));
  t.truthy(fs.existsSync(`${TMP}/file2`));
  t.falsy(fs.existsSync(`${TMP}/file1.js`));
  t.falsy(fs.existsSync(`${TMP}/file2.js`));
  t.falsy(fs.existsSync(`${TMP}/file1.txt`));
  t.falsy(fs.existsSync(`${TMP}/file2.txt`));
});

test('wildcard', t => {
  shell.rm(`${TMP}/file1`, `${TMP}/file2`);
  const result = shell.cp('resources/file*', TMP);
  t.falsy(shell.error());
  t.falsy(result.stderr);
  t.is(result.code, 0);
  t.truthy(fs.existsSync(`${TMP}/file1`));
  t.truthy(fs.existsSync(`${TMP}/file2`));
  t.truthy(fs.existsSync(`${TMP}/file1.js`));
  t.truthy(fs.existsSync(`${TMP}/file2.js`));
  t.truthy(fs.existsSync(`${TMP}/file1.txt`));
  t.truthy(fs.existsSync(`${TMP}/file2.txt`));
});

test('recursive, with regular files', t => {
  const result = shell.cp('-R', 'resources/file1', 'resources/file2', TMP);
  t.falsy(shell.error());
  t.falsy(result.stderr);
  t.is(result.code, 0);
  t.truthy(fs.existsSync(`${TMP}/file1`));
  t.truthy(fs.existsSync(`${TMP}/file2`));
});

test('recursive, nothing exists', t => {
  const result = shell.cp('-R', 'resources/cp', TMP);
  t.falsy(shell.error());
  t.falsy(result.stderr);
  t.is(result.code, 0);
  t.is(shell.ls('-R', 'resources/cp').toString(), shell.ls('-R', `${TMP}/cp`).toString());
});

test(
  'recursive, nothing exists, source ends in \'/\' (see Github issue #15)',
  t => {
    const result = shell.cp('-R', 'resources/cp/', `${TMP}/`);
    t.falsy(shell.error());
    t.falsy(result.stderr);
    t.is(result.code, 0);
    t.is(shell.ls('-R', 'resources/cp').toString(), shell.ls('-R', `${TMP}/cp`).toString());
  }
);

test(
  'recursive, globbing regular files with extension (see Github issue #376)',
  t => {
    const result = shell.cp('-R', 'resources/file*.txt', TMP);
    t.falsy(shell.error());
    t.falsy(result.stderr);
    t.is(result.code, 0);
    t.truthy(fs.existsSync(`${TMP}/file1.txt`));
    t.truthy(fs.existsSync(`${TMP}/file2.txt`));
  }
);

test(
  'recursive, copying one regular file (also related to Github issue #376)',
  t => {
    const result = shell.cp('-R', 'resources/file1.txt', TMP);
    t.falsy(shell.error());
    t.falsy(result.stderr);
    t.is(result.code, 0);
    t.truthy(fs.existsSync(`${TMP}/file1.txt`));
    t.falsy(fs.statSync(`${TMP}/file1.txt`).isDirectory()); // don't let it be a dir
  }
);

test('recursive, everything exists, no force flag', t => {
  shell.cp('-R', 'resources/cp', TMP);
  const result = shell.cp('-R', 'resources/cp', TMP);
  t.falsy(shell.error()); // crash test only
  t.falsy(result.stderr);
  t.is(result.code, 0);
});

test('-R implies to not follow links', t => {
  if (process.platform !== 'win32') {
    shell.cp('-R', 'resources/cp/*', TMP);
    t.truthy(fs.lstatSync(`${TMP}/links/sym.lnk`).isSymbolicLink()); // this one is a link
    t.falsy((fs.lstatSync(`${TMP}/fakeLinks/sym.lnk`).isSymbolicLink())); // this one isn't
    t.not(
      shell.cat(`${TMP}/links/sym.lnk`).toString(),
      shell.cat(`${TMP}/fakeLinks/sym.lnk`).toString()
    );
    const result = shell.cp('-R', `${TMP}/links/*`, `${TMP}/fakeLinks`);
    t.falsy(shell.error());
    t.falsy(result.stderr);
    t.is(result.code, 0);
    t.truthy(fs.lstatSync(`${TMP}/links/sym.lnk`).isSymbolicLink()); // this one is a link
    t.truthy(fs.lstatSync(`${TMP}/fakeLinks/sym.lnk`).isSymbolicLink()); // this one is now a link
    t.is(
      shell.cat(`${TMP}/links/sym.lnk`).toString(),
      shell.cat(`${TMP}/fakeLinks/sym.lnk`).toString()
    );
  }
});

test('Missing -R implies -L', t => {
  if (process.platform !== 'win32') {
    // Recursive, everything exists, overwrite a real file *by following a link*
    // Because missing the -R implies -L.
    shell.cp('-R', 'resources/cp/*', TMP);
    t.truthy(fs.lstatSync(`${TMP}/links/sym.lnk`).isSymbolicLink()); // this one is a link
    t.falsy((fs.lstatSync(`${TMP}/fakeLinks/sym.lnk`).isSymbolicLink())); // this one isn't
    t.not(
      shell.cat(`${TMP}/links/sym.lnk`).toString(),
      shell.cat(`${TMP}/fakeLinks/sym.lnk`).toString()
    );
    const result = shell.cp(`${TMP}/links/*`, `${TMP}/fakeLinks`); // don't use -R
    t.falsy(shell.error());
    t.falsy(result.stderr);
    t.is(result.code, 0);
    t.truthy(fs.lstatSync(`${TMP}/links/sym.lnk`).isSymbolicLink()); // this one is a link
    t.falsy(fs.lstatSync(`${TMP}/fakeLinks/sym.lnk`).isSymbolicLink()); // this one is still not a link
    // But it still follows the link
    t.is(
      shell.cat(`${TMP}/links/sym.lnk`).toString(),
      shell.cat(`${TMP}/fakeLinks/sym.lnk`).toString()
    );
  }
});

test('recursive, everything exists, with force flag', t => {
  let result = shell.cp('-R', 'resources/cp', TMP);
  shell.ShellString('changing things around').to(`${TMP}/cp/dir_a/z`);
  t.not(shell.cat('resources/cp/dir_a/z').toString(), shell.cat(`${TMP}/cp/dir_a/z`).toString()); // before cp
  result = shell.cp('-Rf', 'resources/cp', TMP);
  t.falsy(shell.error());
  t.falsy(result.stderr);
  t.is(result.code, 0);
  t.is(shell.cat('resources/cp/dir_a/z').toString(), shell.cat(`${TMP}/cp/dir_a/z`).toString()); // after cp
});

test(
  'recursive, creates dest dir since it\'s only one level deep (see Github issue #44)',
  t => {
    const result = shell.cp('-r', 'resources/issue44', `${TMP}/dir2`);
    t.falsy(shell.error());
    t.falsy(result.stderr);
    t.is(result.code, 0);
    t.is(shell.ls('-R', 'resources/issue44').toString(), shell.ls('-R', `${TMP}/dir2`).toString());
    t.is(
      shell.cat('resources/issue44/main.js').toString(),
      shell.cat(`${TMP}/dir2/main.js`).toString()
    );
  }
);

test(
  'recursive, does *not* create dest dir since it\'s too deep (see Github issue #44)',
  t => {
    const result = shell.cp('-r', 'resources/issue44', `${TMP}/dir2/dir3`);
    t.truthy(shell.error());
    t.is(
      result.stderr,
      `cp: cannot create directory '${TMP}/dir2/dir3': No such file or directory`
    );
    t.is(result.code, 1);
    t.is(fs.existsSync(`${TMP}/dir2`), false);
  }
);

test('recursive, copies entire directory', t => {
  const result = shell.cp('-r', 'resources/cp/dir_a', `${TMP}/dest`);
  t.falsy(shell.error());
  t.falsy(result.stderr);
  t.is(result.code, 0);
  t.is(fs.existsSync(`${TMP}/dest/z`), true);
});

test('recursive, with trailing slash, does the exact same', t => {
  const result = shell.cp('-r', 'resources/cp/dir_a/', `${TMP}/dest`);
  t.is(result.code, 0);
  t.falsy(shell.error());
  t.is(fs.existsSync(`${TMP}/dest/z`), true);
});

test(
  'On Windows, permission bits are quite different so skip those tests for now',
  t => {
    if (common.platform !== 'win') {
      // preserve mode bits
      const execBit = parseInt('001', 8);
      t.is(fs.statSync('resources/cp-mode-bits/executable').mode & execBit, execBit);
      shell.cp('resources/cp-mode-bits/executable', `${TMP}/executable`);
      t.is(
        fs.statSync('resources/cp-mode-bits/executable').mode,
        fs.statSync(`${TMP}/executable`).mode
      );
    }
  }
);

test('Make sure hidden files are copied recursively', t => {
  shell.rm('-rf', TMP);
  const result = shell.cp('-r', 'resources/ls/', TMP);
  t.falsy(shell.error());
  t.falsy(result.stderr);
  t.is(result.code, 0);
  t.truthy(fs.existsSync(`${TMP}/.hidden_file`));
});

test('no-recursive will copy regular files only', t => {
  const result = shell.cp('resources/file1.txt', 'resources/ls/', TMP);
  t.is(result.code, 1);
  t.truthy(shell.error());
  t.falsy(fs.existsSync(`${TMP}/.hidden_file`)); // doesn't copy dir contents
  t.falsy(fs.existsSync(`${TMP}/ls`)); // doesn't copy dir itself
  t.truthy(fs.existsSync(`${TMP}/file1.txt`));
});

test('no-recursive will copy regular files only', t => {
  const result = shell.cp('resources/file1.txt', 'resources/file2.txt', 'resources/cp',
    'resources/ls/', TMP);

  t.is(result.code, 1);
  t.truthy(shell.error());
  t.falsy(fs.existsSync(`${TMP}/.hidden_file`)); // doesn't copy dir contents
  t.falsy(fs.existsSync(`${TMP}/ls`)); // doesn't copy dir itself
  t.falsy(fs.existsSync(`${TMP}/a`)); // doesn't copy dir contents
  t.falsy(fs.existsSync(`${TMP}/cp`)); // doesn't copy dir itself
  t.truthy(fs.existsSync(`${TMP}/file1.txt`));
  t.truthy(fs.existsSync(`${TMP}/file2.txt`));
});

test('-R implies -P', t => {
  if (process.platform !== 'win32') {
    shell.cp('-R', 'resources/cp/links/sym.lnk', TMP);
    t.truthy(fs.lstatSync(`${TMP}/sym.lnk`).isSymbolicLink());
  }
});

test('using -P explicitly works', t => {
  if (process.platform !== 'win32') {
    shell.cp('-P', 'resources/cp/links/sym.lnk', TMP);
    t.truthy(fs.lstatSync(`${TMP}/sym.lnk`).isSymbolicLink());
  }
});

test('using -PR on a link to a folder does not follow the link', t => {
  if (process.platform !== 'win32') {
    shell.cp('-PR', 'resources/cp/symFolder', TMP);
    t.truthy(fs.lstatSync(`${TMP}/symFolder`).isSymbolicLink());
  }
});

test('-L overrides -P for copying directory', t => {
  if (process.platform !== 'win32') {
    shell.cp('-LPR', 'resources/cp/symFolder', TMP);
    t.falsy(fs.lstatSync(`${TMP}/symFolder`).isSymbolicLink());
    t.falsy(fs.lstatSync(`${TMP}/symFolder/sym.lnk`).isSymbolicLink());
  }
});

test('Recursive, copies entire directory with no symlinks and -L option does not cause change in behavior', t => {
  if (process.platform !== 'win32') {
    const result = shell.cp('-rL', 'resources/cp/dir_a', `${TMP}/dest`);
    t.falsy(shell.error());
    t.falsy(result.stderr);
    t.is(result.code, 0);
    t.is(fs.existsSync(`${TMP}/dest/z`), true);
  }
});

test('-u flag won\'t overwrite newer files', t => {
  shell.touch(`${TMP}/file1.js`);
  shell.cp('-u', 'resources/file1.js', TMP);
  t.falsy(shell.error());
  t.not(shell.cat('resources/file1.js').toString(), shell.cat(`${TMP}/file1.js`).toString());
});

test('-u flag does overwrite older files', t => {
  shell.touch({ '-d': new Date(10) }, `${TMP}/file1.js`); // really old file
  shell.cp('-u', 'resources/file1.js', TMP);
  t.falsy(shell.error());
  t.is(shell.cat('resources/file1.js').toString(), shell.cat(`${TMP}/file1.js`).toString());
});

test('-u flag works even if it\'s not overwriting a file', t => {
  t.falsy(fs.existsSync(`${TMP}/file1.js`));
  shell.cp('-u', 'resources/file1.js', TMP);
  t.falsy(shell.error());
  t.is(shell.cat('resources/file1.js').toString(), shell.cat(`${TMP}/file1.js`).toString());
});

test('-u flag works correctly recursively', t => {
  shell.mkdir(`${TMP}/foo`);
  [1, 2, 3].forEach(num => {
    new shell.ShellString('old\n').to(`${TMP}/foo/file${num}`);
    shell.touch({ '-d': new Date(10) }, `${TMP}/foo/file${num}`);
  });
  shell.mkdir(`${TMP}/bar`);
  [1, 2, 3].forEach(num => {
    new shell.ShellString('new\n').to(`${TMP}/bar/file${num}`);
    shell.touch({ '-d': new Date(1000) }, `${TMP}/bar/file${num}`);
  });
  // put one new one in the foo directory
  new shell.ShellString('newest\n').to(`${TMP}/foo/file3`);
  shell.touch({ '-d': new Date(10000) }, `${TMP}/foo/file3`);
  shell.cp('-u', `${TMP}/foo/*`, `${TMP}/bar`);
  t.falsy(shell.error());
  t.is(shell.cat(`${TMP}/bar/*`).toString(), 'new\nnew\nnewest\n');
});

test('using -R on a link to a folder *does* follow the link', t => {
  shell.cp('-R', 'resources/cp/symFolder', TMP);
  t.falsy(fs.lstatSync(`${TMP}/symFolder`).isSymbolicLink());
});

test('Without -R, -L is implied', t => {
  shell.cp('resources/cp/links/sym.lnk', TMP);
  t.falsy(fs.lstatSync(`${TMP}/sym.lnk`).isSymbolicLink());
});

test('-L explicitly works', t => {
  shell.cp('-L', 'resources/cp/links/sym.lnk', TMP);
  t.falsy(fs.lstatSync(`${TMP}/sym.lnk`).isSymbolicLink());
});

test('using -LR does not imply -P', t => {
  shell.cp('-LR', 'resources/cp/links/sym.lnk', TMP);
  t.falsy(fs.lstatSync(`${TMP}/sym.lnk`).isSymbolicLink());
});

test('using -LR also works recursively on directories containing links', t => {
  shell.cp('-LR', 'resources/cp/links', TMP);
  t.falsy(fs.lstatSync(`${TMP}/links/sym.lnk`).isSymbolicLink());
});

test('-L always overrides a -P', t => {
  shell.cp('-LP', 'resources/cp/links/sym.lnk', TMP);
  t.falsy(fs.lstatSync(`${TMP}/sym.lnk`).isSymbolicLink());
  shell.cp('-LPR', 'resources/cp/links/sym.lnk', TMP);
  t.falsy(fs.lstatSync(`${TMP}/sym.lnk`).isSymbolicLink());
});

test('Make sure max depth does not limit shallow directory structures', t => {
  shell.config.maxdepth = 3;
  shell.mkdir(`${TMP}/foo`);
  for (let k = 0; k < 5; k++) {
    shell.mkdir(`${TMP}/foo/dir${k}`);
  }
  shell.cp('-r', `${TMP}/foo`, `${TMP}/bar`);
  t.is(shell.ls(`${TMP}/foo`).stdout, shell.ls(`${TMP}/bar`).stdout);
});

test('Test max depth.', t => {
  shell.config.maxdepth = 32;
  let directory = '';
  for (let i = 1; i < 40; i++) {
    directory += '/' + i;
  }
  let directory32deep = '';
  for (let i = 1; i < 32; i++) {
    directory32deep += '/' + i;
  }
  shell.mkdir('-p', `${TMP}/0${directory}`);
  shell.cp('-r', `${TMP}/0`, `${TMP}/copytestdepth`);
  // Check full directory exists.
  t.truthy(shell.test('-d', `${TMP}/0/${directory}`));
  // Check full copy of directory does not exist.
  t.falsy(shell.test('-d', `${TMP}/copytestdepth${directory}`));
  // Check last directory to exist is below maxdepth.
  t.truthy(shell.test('-d', `${TMP}/copytestdepth${directory32deep}`));
  t.falsy(shell.test('-d', `${TMP}/copytestdepth${directory32deep}/32`));
  skipOnWinForEPERM(shell.ln.bind(shell, '-s', `${TMP}/0`, `${TMP}/symlinktest`), () => {
    if (!shell.test('-L', `${TMP}/symlinktest`)) {
      t.fail();
    }

    // Create symlinks to check for cycle.
    shell.cd(`${TMP}/0/1/2/3/4`);
    t.falsy(shell.error());
    shell.ln('-s', '../../../2', 'link');
    t.falsy(shell.error());
    shell.ln('-s', './5/6/7', 'link1');
    t.falsy(shell.error());
    shell.cd('../../../../../..');
    t.falsy(shell.error());
    t.truthy(shell.test('-d', TMP));

    shell.cp('-r', `${TMP}/0/1`, `${TMP}/copytestdepth`);
    t.falsy(shell.error());
    t.truthy(shell.test('-d', `${TMP}/copytestdepth/1/2/3/4/link/3/4/link/3/4`));
  });
});

test('cp -L follows symlinks', t => {
  skipOnWinForEPERM(shell.ln.bind(shell, '-s', `${TMP}/0`, `${TMP}/symlinktest`), () => {
    shell.mkdir('-p', `${TMP}/sub`);
    shell.mkdir('-p', `${TMP}/new`);
    shell.cp('-f', 'resources/file1.txt', `${TMP}/sub/file.txt`);
    shell.cd(`${TMP}/sub`);
    shell.ln('-s', 'file.txt', 'foo.lnk');
    shell.ln('-s', 'file.txt', 'sym.lnk');
    shell.cd('..');
    shell.cp('-L', 'sub/*', 'new/');
    shell.cd('new');

    shell.cp('-f', '../../resources/file2.txt', 'file.txt');
    t.is(shell.cat('file.txt').toString(), 'test2\n');
    // Ensure other files have not changed.
    t.is(shell.cat('foo.lnk').toString(), 'test1\n');
    t.is(shell.cat('sym.lnk').toString(), 'test1\n');
    t.is(shell.test('-L', 'foo.lnk'), false);
    t.is(shell.test('-L', 'sym.lnk'), false);
    shell.cd('../..');
  });
});

test('Test with recursive option and symlinks.', t => {
  skipOnWinForEPERM(shell.ln.bind(shell, '-s', `${TMP}/0`, `${TMP}/symlinktest`), () => {
    shell.mkdir('-p', `${TMP}/sub/sub1`);
    shell.cp('-f', 'resources/file1.txt', `${TMP}/sub/file.txt`);
    shell.cp('-f', 'resources/file1.txt', `${TMP}/sub/sub1/file.txt`);
    shell.cd(`${TMP}/sub`);
    shell.ln('-s', 'file.txt', 'foo.lnk');
    shell.ln('-s', 'file.txt', 'sym.lnk');
    shell.cd('sub1');
    shell.ln('-s', '../file.txt', 'foo.lnk');
    shell.ln('-s', '../file.txt', 'sym.lnk');

    // Ensure file reads from proper source
    t.is(shell.cat('file.txt').toString(), 'test1\n');
    t.is(shell.cat('foo.lnk').toString(), 'test1\n');
    t.is(shell.cat('sym.lnk').toString(), 'test1\n');
    t.is(shell.test('-L', 'foo.lnk'), true);
    t.is(shell.test('-L', 'sym.lnk'), true);
    shell.cd('../..');
    shell.cp('-rL', 'sub/', 'new/');
    shell.cd('new');

    // Ensure copies of files are symlinks by updating file contents.
    shell.cp('-f', '../../resources/file2.txt', 'file.txt');
    t.is(shell.cat('file.txt').toString(), 'test2\n');
    // Ensure other files have not changed.
    t.is(shell.cat('foo.lnk').toString(), 'test1\n');
    t.is(shell.cat('sym.lnk').toString(), 'test1\n');

    // Ensure the links are converted to files.
    t.is(shell.test('-L', 'foo.lnk'), false);
    t.is(shell.test('-L', 'sym.lnk'), false);

    // Ensure other files have not changed.
    shell.cd('sub1');
    shell.cp('-f', '../../../resources/file2.txt', 'file.txt');
    t.is(shell.cat('file.txt').toString(), 'test2\n');
    t.is(shell.cat('foo.lnk').toString(), 'test1\n');
    t.is(shell.cat('sym.lnk').toString(), 'test1\n');

    // Ensure the links are converted to files
    t.is(shell.test('-L', 'foo.lnk'), false);
    t.is(shell.test('-L', 'sym.lnk'), false);
  });
});
