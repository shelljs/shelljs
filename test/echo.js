import test from 'ava';
import shell from '..';
import child from 'child_process';

const TMP = require('./utils/utils').getTempDir();

test.beforeEach(() => {
  shell.config.silent = true;
  shell.mkdir(TMP);
});

test.afterEach(() => {
  shell.rm('-rf', TMP);
});


//
// Valids
//

let file;

test.beforeEach(() => {
  file = `${TMP}/tempscript${Math.random()}.js`;
});

test.cb('simple test with defaults', t => {
  const script = 'require(\'../../global.js\'); echo("hello", "world");';
  shell.ShellString(script).to(file);
  child.exec(JSON.stringify(process.execPath) + ' ' + file, (err, stdout, stderr) => {
    t.is(stdout, 'hello world\n');
    t.is(stderr, '');
    t.end();
  });
});

test.cb('allow arguments to begin with a hyphen', t => {
  // see issue #20
  const script = 'require(\'../../global.js\'); echo("-asdf", "111");';
  shell.ShellString(script).to(file);
  child.exec(JSON.stringify(process.execPath) + ' ' + file, (err, stdout, stderr) => {
    t.is(stdout, '-asdf 111\n');
    t.is(stderr, '');
    t.end();
  });
});

test.cb("using null as an explicit argument doesn't crash the function", t => {
  const script = 'require(\'../../global.js\'); echo(null);';
  shell.ShellString(script).to(file);
  child.exec(JSON.stringify(process.execPath) + ' ' + file, (err, stdout, stderr) => {
    t.is(stdout, 'null\n');
    t.is(stderr, '');
    t.end();
  });
});

test.cb('simple test with silent(true)', t => {
  const script = 'require(\'../../global.js\'); config.silent=true; echo(555);';
  shell.ShellString(script).to(file);
  child.exec(JSON.stringify(process.execPath) + ' ' + file, (err, stdout) => {
    t.is(stdout, '555\n');
    t.end();
  });
});

test.cb('-e option', t => {
  const script = "require('../../global.js'); echo('-e', '\\tmessage');";
  shell.ShellString(script).to(file);
  child.exec(JSON.stringify(process.execPath) + ' ' + file, (err, stdout) => {
    t.is(stdout, '\tmessage\n');
    t.end();
  });
});
