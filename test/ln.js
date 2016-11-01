import test from 'ava';
import shell from '..';
import fs from 'fs';
import path from 'path';
import utils from './utils/utils';

const skipOnWinForEPERM = require('./utils/utils').skipOnWinForEPERM;

let TMP;

test.beforeEach(() => {
  TMP = utils.getTempDir();
  shell.config.silent = true;
  shell.cp('-r', 'resources', TMP);
});

test.afterEach.always(() => {
  shell.rm('-rf', TMP);
});


//
// Invalids
//

test('no args', t => {
  const result = shell.ln();
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('too few args', t => {
  const result = shell.ln('file');
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('only an option', t => {
  const result = shell.ln('-f');
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('destination already exists', t => {
  const result = shell.ln(`${TMP}/file1`, `${TMP}/file2`);
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('non-existent source', t => {
  const result = shell.ln(`${TMP}/noexist`, `${TMP}/linkfile1`);
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('non-existent source (-sf)', t => {
  const result = shell.ln('-sf', 'no/exist', `${TMP}/badlink`);
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('non-existent source (-f)', t => {
  const result = shell.ln('-f', 'noexist', `${TMP}/badlink`);
  t.truthy(shell.error());
  t.is(result.code, 1);
});

//
// Valids
//

test('basic usage', t => {
  const result = shell.ln(`${TMP}/file1`, `${TMP}/linkfile1`);
  t.truthy(fs.existsSync(`${TMP}/linkfile1`));
  t.is(
    fs.readFileSync(`${TMP}/file1`).toString(),
    fs.readFileSync(`${TMP}/linkfile1`).toString()
  );
  fs.writeFileSync(`${TMP}/file1`, 'new content 1');
  t.is(fs.readFileSync(`${TMP}/linkfile1`).toString(), 'new content 1');
  t.is(result.code, 0);
});

test('With glob', t => {
  shell.rm(`${TMP}/linkfile1`);
  const result = shell.ln(`${TMP}/fi*1`, `${TMP}/linkfile1`);
  t.truthy(fs.existsSync(`${TMP}/linkfile1`));
  t.is(
    fs.readFileSync(`${TMP}/file1`).toString(),
    fs.readFileSync(`${TMP}/linkfile1`).toString()
  );
  fs.writeFileSync(`${TMP}/file1`, 'new content 1');
  t.is(fs.readFileSync(`${TMP}/linkfile1`).toString(), 'new content 1');
  t.is(result.code, 0);
});

test('-s option', t => {
  skipOnWinForEPERM(shell.ln.bind(shell, '-s', 'file2', `${TMP}/linkfile2`), () => {
    t.truthy(fs.existsSync(`${TMP}/linkfile2`));
    t.is(
      fs.readFileSync(`${TMP}/file2`).toString(),
      fs.readFileSync(`${TMP}/linkfile2`).toString()
    );
    fs.writeFileSync(`${TMP}/file2`, 'new content 2');
    t.is(fs.readFileSync(`${TMP}/linkfile2`).toString(), 'new content 2');
  });
});

test('Symbolic link directory test', t => {
  shell.mkdir(`${TMP}/ln`);
  shell.touch(`${TMP}/ln/hello`);
  const result = shell.ln('-s', 'ln', `${TMP}/dir1`);
  t.truthy(fs.existsSync(`${TMP}/ln/hello`));
  t.truthy(fs.existsSync(`${TMP}/dir1/hello`));
  t.is(result.code, 0);
});

test('To current directory', t => {
  shell.cd(TMP);
  let result = shell.ln('-s', './', 'dest');
  t.is(result.code, 0);
  shell.touch('testfile.txt');
  t.truthy(fs.existsSync('testfile.txt'));
  t.truthy(fs.existsSync('dest/testfile.txt'));
  shell.rm('-f', 'dest');
  shell.mkdir('dir1');
  shell.cd('dir1');
  result = shell.ln('-s', './', '../dest');
  t.is(result.code, 0);
  shell.touch('insideDir.txt');
  shell.cd('..');
  t.truthy(fs.existsSync('testfile.txt'));
  t.truthy(fs.existsSync('dest/testfile.txt'));
  t.truthy(fs.existsSync('dir1/insideDir.txt'));
  t.falsy(fs.existsSync('dest/insideDir.txt'));
  shell.cd('..');
});

test('-f option', t => {
  const result = shell.ln('-f', `${TMP}/file1.js`, `${TMP}/file2.js`);
  t.is(result.code, 0);
  t.truthy(fs.existsSync(`${TMP}/file2.js`));
  t.is(
    fs.readFileSync(`${TMP}/file1.js`).toString(),
    fs.readFileSync(`${TMP}/file2.js`).toString()
  );
  fs.writeFileSync(`${TMP}/file1.js`, 'new content js');
  t.is(fs.readFileSync(`${TMP}/file2.js`).toString(), 'new content js');
});

test('-sf option', t => {
  skipOnWinForEPERM(shell.ln.bind(shell, '-sf', 'file1.txt', `${TMP}/file2.txt`), () => {
    t.truthy(fs.existsSync(`${TMP}/file2.txt`));
    t.is(
      fs.readFileSync(`${TMP}/file1.txt`).toString(),
      fs.readFileSync(`${TMP}/file2.txt`).toString()
    );
    fs.writeFileSync(`${TMP}/file1.txt`, 'new content txt');
    t.is(fs.readFileSync(`${TMP}/file2.txt`).toString(), 'new content txt');
  });
});

test('Abspath regression', t => {
  skipOnWinForEPERM(shell.ln.bind(shell, '-sf', 'file1', path.resolve(`${TMP}/abspath`)), () => {
    t.truthy(fs.existsSync(`${TMP}/abspath`));
    t.is(
      fs.readFileSync(`${TMP}/file1`).toString(),
      fs.readFileSync(`${TMP}/abspath`).toString()
    );
    fs.writeFileSync(`${TMP}/file1`, 'new content 3');
    t.is(fs.readFileSync(`${TMP}/abspath`).toString(), 'new content 3');
  });
});

test('Relative regression', t => {
  skipOnWinForEPERM(shell.ln.bind(shell, '-sf', 'file1.txt', `${TMP}/file2.txt`), () => {
    shell.mkdir('-p', `${TMP}/new`);
      // Move the symlink first, as the reverse confuses `mv`.
    shell.mv(`${TMP}/file2.txt`, `${TMP}/new/file2.txt`);
    shell.mv(`${TMP}/file1.txt`, `${TMP}/new/file1.txt`);
    t.truthy(fs.existsSync(`${TMP}/new/file2.txt`));
    t.is(
      fs.readFileSync(`${TMP}/new/file1.txt`).toString(),
      fs.readFileSync(`${TMP}/new/file2.txt`).toString()
    );
    fs.writeFileSync(`${TMP}/new/file1.txt`, 'new content txt');
    t.is(fs.readFileSync(`${TMP}/new/file2.txt`).toString(), 'new content txt');
  });
});
