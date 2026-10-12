const fs = require('fs');
const path = require('path');

const test = require('ava');

const shell = require('..');
const utils = require('./utils/utils');

const CWD = process.cwd();

test.beforeEach(t => {
  t.context.tmp = utils.getTempDir();
  shell.config.resetForTesting();
  shell.cp('-r', 'test/resources', t.context.tmp);
  process.chdir(CWD);
});

test.afterEach.always(t => {
  shell.rm('-rf', t.context.tmp);
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
  const original = fs.readFileSync(`${t.context.tmp}/file2`, 'utf8');
  const result = shell.ln(`${t.context.tmp}/file1`, `${t.context.tmp}/file2`);
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(fs.readFileSync(`${t.context.tmp}/file2`, 'utf8'), original);
});

test('-s does not replace an existing regular file without -f', t => {
  const dest = `${t.context.tmp}/file2`;
  const original = fs.readFileSync(dest, 'utf8');
  const result = shell.ln('-s', 'file1', dest);
  t.is(result.code, 1);
  t.is(result.stderr, 'ln: Destination file exists');
  t.false(fs.lstatSync(dest).isSymbolicLink());
  t.is(fs.readFileSync(dest, 'utf8'), original);
});

[false, true].forEach(symbolic => {
  const options = symbolic ? '-s' : '--';
  const name = symbolic ? 'symbolic link' : 'hard link';

  test(`${name} preserves an existing destination symlink without -f`, t => {
    utils.skipOnWin(t, () => {
      const dest = `${t.context.tmp}/existing-link`;
      fs.symlinkSync('file2', dest);
      const target = fs.readFileSync(`${t.context.tmp}/file2`, 'utf8');
      const source = path.resolve(`${t.context.tmp}/file1`);
      const result = shell.ln(options, source, dest);
      t.is(result.code, 1);
      t.is(result.stderr, 'ln: Destination file exists');
      t.true(fs.lstatSync(dest).isSymbolicLink());
      t.is(fs.readlinkSync(dest), 'file2');
      t.is(fs.readFileSync(dest, 'utf8'), target);
      t.is(fs.readFileSync(`${t.context.tmp}/file2`, 'utf8'), target);
    });
  });

  test(`${name} does not remove a source that is also the destination`, t => {
    const file = path.resolve(`${t.context.tmp}/file1`);
    const original = fs.readFileSync(file, 'utf8');
    const result = shell.ln(options, file, file);
    t.is(result.code, 1);
    t.true(fs.existsSync(file));
    t.false(fs.lstatSync(file).isSymbolicLink());
    t.is(fs.readFileSync(file, 'utf8'), original);
    t.is(result.stderr, 'ln: Destination file exists');
  });

  test(`${name} preserves an existing destination when the source is missing`, t => {
    const dest = `${t.context.tmp}/file2`;
    const original = fs.readFileSync(dest, 'utf8');
    const result = shell.ln(options, path.resolve(`${t.context.tmp}/missing`), dest);
    t.is(result.code, 1);
    t.true(fs.existsSync(dest));
    t.false(fs.lstatSync(dest).isSymbolicLink());
    t.is(fs.readFileSync(dest, 'utf8'), original);
    t.is(result.stderr, 'ln: Destination file exists');
  });
});

test('fatal mode preserves an existing destination', t => {
  const dest = `${t.context.tmp}/file2`;
  const original = fs.readFileSync(dest, 'utf8');
  shell.config.fatal = true;
  t.throws(() => shell.ln(`${t.context.tmp}/file1`, dest), {
    message: 'ln: Destination file exists',
  });
  t.is(fs.readFileSync(dest, 'utf8'), original);
});

test('without -f an existing dangling symlink remains unchanged', t => {
  utils.skipOnWin(t, () => {
    const dest = `${t.context.tmp}/dangling-link`;
    fs.symlinkSync('missing-target', dest);
    const result = shell.ln(`${t.context.tmp}/file1`, dest);
    t.is(result.code, 1);
    t.true(fs.lstatSync(dest).isSymbolicLink());
    t.is(fs.readlinkSync(dest), 'missing-target');
  });
});

test('non-existent source', t => {
  const result = shell.ln(`${t.context.tmp}/noexist`, `${t.context.tmp}/linkfile1`);
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('non-existent source (-sf)', t => {
  const result = shell.ln('-sf', 'no/exist', `${t.context.tmp}/badlink`);
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('non-existent source (-f)', t => {
  const result = shell.ln('-f', 'noexist', `${t.context.tmp}/badlink`);
  t.truthy(shell.error());
  t.is(result.code, 1);
});

//
// Valids
//

test('basic usage', t => {
  const result = shell.ln(`${t.context.tmp}/file1`, `${t.context.tmp}/linkfile1`);
  t.truthy(fs.existsSync(`${t.context.tmp}/linkfile1`));
  t.is(
    fs.readFileSync(`${t.context.tmp}/file1`).toString(),
    fs.readFileSync(`${t.context.tmp}/linkfile1`).toString()
  );
  fs.writeFileSync(`${t.context.tmp}/file1`, 'new content 1');
  t.is(fs.readFileSync(`${t.context.tmp}/linkfile1`).toString(), 'new content 1');
  t.is(result.code, 0);
});

test('With glob', t => {
  shell.rm(`${t.context.tmp}/linkfile1`);
  const result = shell.ln(`${t.context.tmp}/fi*1`, `${t.context.tmp}/linkfile1`);
  t.truthy(fs.existsSync(`${t.context.tmp}/linkfile1`));
  t.is(
    fs.readFileSync(`${t.context.tmp}/file1`).toString(),
    fs.readFileSync(`${t.context.tmp}/linkfile1`).toString()
  );
  fs.writeFileSync(`${t.context.tmp}/file1`, 'new content 1');
  t.is(fs.readFileSync(`${t.context.tmp}/linkfile1`).toString(), 'new content 1');
  t.is(result.code, 0);
});

test('-s option', t => {
  utils.skipOnWinForEPERM(shell.ln.bind(shell, '-s', 'file2', `${t.context.tmp}/linkfile2`), () => {
    t.truthy(fs.existsSync(`${t.context.tmp}/linkfile2`));
    t.is(
      fs.readFileSync(`${t.context.tmp}/file2`).toString(),
      fs.readFileSync(`${t.context.tmp}/linkfile2`).toString()
    );
    fs.writeFileSync(`${t.context.tmp}/file2`, 'new content 2');
    t.is(fs.readFileSync(`${t.context.tmp}/linkfile2`).toString(), 'new content 2');
  });
});

test('Symbolic link directory test', t => {
  shell.mkdir(`${t.context.tmp}/ln`);
  shell.touch(`${t.context.tmp}/ln/hello`);
  const result = shell.ln('-s', 'ln', `${t.context.tmp}/dir1`);
  t.truthy(fs.existsSync(`${t.context.tmp}/ln/hello`));
  t.truthy(fs.existsSync(`${t.context.tmp}/dir1/hello`));
  t.is(result.code, 0);
});

test('To current directory', t => {
  shell.cd(t.context.tmp);
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
  const result = shell.ln('-f', `${t.context.tmp}/file1.js`, `${t.context.tmp}/file2.js`);
  t.is(result.code, 0);
  t.truthy(fs.existsSync(`${t.context.tmp}/file2.js`));
  t.is(
    fs.readFileSync(`${t.context.tmp}/file1.js`).toString(),
    fs.readFileSync(`${t.context.tmp}/file2.js`).toString()
  );
  fs.writeFileSync(`${t.context.tmp}/file1.js`, 'new content js');
  t.is(fs.readFileSync(`${t.context.tmp}/file2.js`).toString(), 'new content js');
});

test('-sf option', t => {
  utils.skipOnWinForEPERM(shell.ln.bind(shell, '-sf', 'file1.txt', `${t.context.tmp}/file2.txt`), () => {
    t.truthy(fs.existsSync(`${t.context.tmp}/file2.txt`));
    t.is(
      fs.readFileSync(`${t.context.tmp}/file1.txt`).toString(),
      fs.readFileSync(`${t.context.tmp}/file2.txt`).toString()
    );
    fs.writeFileSync(`${t.context.tmp}/file1.txt`, 'new content txt');
    t.is(fs.readFileSync(`${t.context.tmp}/file2.txt`).toString(), 'new content txt');
  });
});

test('Abspath regression', t => {
  utils.skipOnWinForEPERM(shell.ln.bind(shell, '-sf', 'file1', path.resolve(`${t.context.tmp}/abspath`)), () => {
    t.truthy(fs.existsSync(`${t.context.tmp}/abspath`));
    t.is(
      fs.readFileSync(`${t.context.tmp}/file1`).toString(),
      fs.readFileSync(`${t.context.tmp}/abspath`).toString()
    );
    fs.writeFileSync(`${t.context.tmp}/file1`, 'new content 3');
    t.is(fs.readFileSync(`${t.context.tmp}/abspath`).toString(), 'new content 3');
  });
});

test('Relative regression', t => {
  utils.skipOnWinForEPERM(shell.ln.bind(shell, '-sf', 'file1.txt', `${t.context.tmp}/file2.txt`), () => {
    shell.mkdir('-p', `${t.context.tmp}/new`);
    // Move the symlink first, as the reverse confuses `mv`.
    shell.mv(`${t.context.tmp}/file2.txt`, `${t.context.tmp}/new/file2.txt`);
    shell.mv(`${t.context.tmp}/file1.txt`, `${t.context.tmp}/new/file1.txt`);
    t.truthy(fs.existsSync(`${t.context.tmp}/new/file2.txt`));
    t.is(
      fs.readFileSync(`${t.context.tmp}/new/file1.txt`).toString(),
      fs.readFileSync(`${t.context.tmp}/new/file2.txt`).toString()
    );
    fs.writeFileSync(`${t.context.tmp}/new/file1.txt`, 'new content txt');
    t.is(fs.readFileSync(`${t.context.tmp}/new/file2.txt`).toString(), 'new content txt');
  });
});
