import os from 'os';
import path from 'path';
import util from 'util';

import test from 'ava';

import shell from '..';
import utils from './utils/utils';

const CWD = process.cwd();
shell.config.silent = true;

test.afterEach.always(() => {
  process.chdir(CWD);
});

//
// Invalids
//

test('no args', t => {
  shell.exec();
  t.truthy(shell.error());
});

test('unknown command', t => {
  const result = shell.exec('asdfasdf'); // could not find command
  t.truthy(result.code > 0);
});

test('config.fatal and unknown command', t => {
  const oldFatal = shell.config.fatal;
  shell.config.fatal = true;
  t.throws(() => {
    shell.exec('asdfasdf'); // could not find command
  }, /exec: internal error/);
  shell.config.fatal = oldFatal;
});

//
// Valids
//

//
// sync
//

test('check if stdout goes to output', t => {
  const result = shell.exec(`${JSON.stringify(shell.config.execPath)} -e "console.log(1234);"`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, '1234\n');
});

test('check if stderr goes to output', t => {
  const result = shell.exec(`${JSON.stringify(shell.config.execPath)} -e "console.error(1234);"`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, '');
  t.is(result.stderr, '1234\n');
});

test('check if stdout + stderr go to output', t => {
  const result = shell.exec(`${JSON.stringify(shell.config.execPath)} -e "console.error(1234); console.log(666);"`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, '666\n');
  t.is(result.stderr, '1234\n');
});

test('check exit code', t => {
  const result = shell.exec(`${JSON.stringify(shell.config.execPath)} -e "process.exit(12);"`);
  t.truthy(shell.error());
  t.is(result.code, 12);
});

test('interaction with cd', t => {
  shell.cd('test/resources/external');
  const result = shell.exec(`${JSON.stringify(shell.config.execPath)} node_script.js`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, 'node_script_1234\n');
});

test('check quotes escaping', t => {
  const result = shell.exec(util.format(JSON.stringify(shell.config.execPath) + ' -e "console.log(%s);"', "\\\"\\'+\\'_\\'+\\'\\\""));
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, "'+'_'+'\n");
});

test('set cwd', t => {
  const cmdString = process.platform === 'win32' ? 'cd' : 'pwd';
  const result = shell.exec(cmdString, { cwd: '..' });
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, path.resolve('..') + os.EOL);
});

test('set maxBuffer (very small)', t => {
  const result = shell.exec('echo 1234567890'); // default maxBuffer is ok
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, '1234567890' + os.EOL);
  shell.exec('echo 1234567890', { maxBuffer: 6 });
  t.truthy(shell.error());
});

test('multiple commands should work', t => {
  const result = shell.exec('echo abc ; echo bcd');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, 'abc' + os.EOL + 'bcd' + os.EOL);
});

test('set timeout option', t => {
  const result = shell.exec(`${JSON.stringify(shell.config.execPath)} test/resources/exec/slow.js 100`); // default timeout is ok
  t.falsy(shell.error());
  t.is(result.code, 0);
  if (process.version >= 'v0.11') {
    // this option doesn't work on v0.10
    shell.exec(`${JSON.stringify(shell.config.execPath)} test/resources/exec/slow.js 100`, { timeout: 10 }); // times out
  }
  t.truthy(shell.error());
});

test('check process.env works', t => {
  t.falsy(shell.env.FOO);
  shell.env.FOO = 'Hello world';
  const result = shell.exec(process.platform !== 'win32' ? 'echo $FOO' : 'echo %FOO%');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, 'Hello world' + os.EOL);
  t.is(result.stderr, '');
});

test('set shell option (TODO: add tests for Windows)', t => {
  utils.skipOnWin(t, () => {
    let result = shell.exec('echo $0');
    t.falsy(shell.error());
    t.is(result.code, 0);
    t.is(result.stdout, '/bin/sh\n'); // sh by default
    const bashPath = shell.which('bash').trim();
    // this option doesn't work on v0.10
    if (bashPath) {
      result = shell.exec('echo $0', { shell: '/bin/bash' });
      t.falsy(shell.error());
      t.is(result.code, 0);
      t.is(result.stdout, '/bin/bash\n');
    }
  });
});

test('exec returns a ShellString', t => {
  const result = shell.exec('echo foo');
  t.is(typeof result, 'object');
  t.truthy(result instanceof String);
  t.is(typeof result.stdout, 'string');
  t.is(result.toString(), result.stdout);
});

//
// async
//

test.cb('no callback', t => {
  const c = shell.exec(`${JSON.stringify(shell.config.execPath)} -e "console.log(1234)"`, { async: true });
  t.falsy(shell.error());
  t.truthy('stdout' in c, 'async exec returns child process object');
  t.end();
});

test.cb('callback as 2nd argument', t => {
  shell.exec(`${JSON.stringify(shell.config.execPath)} -e "console.log(5678);"`, (code, stdout, stderr) => {
    t.is(code, 0);
    t.is(stdout, '5678\n');
    t.is(stderr, '');
    t.end();
  });
});

test.cb('callback as end argument', t => {
  shell.exec(`${JSON.stringify(shell.config.execPath)} -e "console.log(5566);"`, { async: true }, (code, stdout, stderr) => {
    t.is(code, 0);
    t.is(stdout, '5566\n');
    t.is(stderr, '');
    t.end();
  });
});

test.cb('callback as 3rd argument (silent:true)', t => {
  shell.exec(`${JSON.stringify(shell.config.execPath)} -e "console.log(5678);"`, { silent: true }, (code, stdout, stderr) => {
    t.is(code, 0);
    t.is(stdout, '5678\n');
    t.is(stderr, '');
    t.end();
  });
});

test.cb('command that fails', t => {
  shell.exec('shx cp onlyOneCpArgument.txt', { silent: true }, (code, stdout, stderr) => {
    t.is(code, 1);
    t.is(stdout, '');
    t.is(stderr, 'cp: missing <source> and/or <dest>\n');
    t.end();
  });
});
