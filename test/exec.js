import test from 'ava';
import shell from '..';
import util from 'util';
import path from 'path';
import os from 'os';

test.beforeEach(() => {
  shell.config.silent = true;
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
  const result = shell.exec(JSON.stringify(process.execPath) + ' -e "console.log(1234);"');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.stdout === '1234\n' || result.stdout === '1234\nundefined\n'); // 'undefined' for v0.4
});

test('check if stderr goes to output', t => {
  const result = shell.exec(JSON.stringify(process.execPath) + ' -e "console.error(1234);"');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.stdout === '' || result.stdout === 'undefined\n'); // 'undefined' for v0.4
  t.truthy(result.stderr === '1234\n' || result.stderr === '1234\nundefined\n'); // 'undefined' for v0.4
});

test('check if stdout + stderr go to output', t => {
  const result = shell.exec(JSON.stringify(process.execPath) + ' -e "console.error(1234); console.log(666);"');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.stdout === '666\n' || result.stdout === '666\nundefined\n');  // 'undefined' for v0.4
  t.truthy(result.stderr === '1234\n' || result.stderr === '1234\nundefined\n');  // 'undefined' for v0.4
});

test('check exit code', t => {
  const result = shell.exec(JSON.stringify(process.execPath) + ' -e "process.exit(12);"');
  t.truthy(shell.error());
  t.is(result.code, 12);
});

test('interaction with cd', t => {
  shell.cd('resources/external');
  const result = shell.exec(JSON.stringify(process.execPath) + ' node_script.js');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, 'node_script_1234\n');
  shell.cd('../..');
});

test('check quotes escaping', t => {
  const result = shell.exec(util.format(JSON.stringify(process.execPath) + ' -e "console.log(%s);"', "\\\"\\'+\\'_\\'+\\'\\\""));
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
  if (process.version >= 'v0.11') { // this option doesn't work on v0.10
    shell.exec('echo 1234567890', { maxBuffer: 6 });
    t.truthy(shell.error());
  }
});

test('set timeout option', t => {
  const result = shell.exec(JSON.stringify(process.execPath) + ' resources/exec/slow.js 100'); // default timeout is ok
  t.falsy(shell.error());
  t.is(result.code, 0);
  if (process.version >= 'v0.11') {
    // this option doesn't work on v0.10
    shell.exec(JSON.stringify(process.execPath) + ' resources/exec/slow.js 100', { timeout: 10 }); // times out

    t.truthy(shell.error());
  }
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
  if (process.platform !== 'win32') {
    let result = shell.exec('echo $0');
    t.falsy(shell.error());
    t.is(result.code, 0);
    t.is(result.stdout, '/bin/sh\n'); // sh by default
    const bashPath = shell.which('bash').trim();
    // this option doesn't work on v0.10
    if (bashPath && process.version >= 'v0.11') {
      result = shell.exec('echo $0', { shell: '/bin/bash' });
      t.falsy(shell.error());
      t.is(result.code, 0);
      t.is(result.stdout, '/bin/bash\n');
    }
  }
});

test('exec returns a ShellString', t => {
  const result = shell.exec('echo foo');
  t.truthy(typeof result === 'object');
  t.truthy(result instanceof String);
  t.truthy(typeof result.stdout === 'string');
  t.true(result.toString() === result.stdout);
});

//
// async
//

test.cb('no callback', t => {
  const c = shell.exec(JSON.stringify(process.execPath) + ' -e "console.log(1234)"', { async: true });
  t.falsy(shell.error());
  t.truthy('stdout' in c, 'async exec returns child process object');
  t.end();
});

test.cb('callback as 2nd argument', t => {
  shell.exec(JSON.stringify(process.execPath) + ' -e "console.log(5678);"', (code, stdout, stderr) => {
    t.is(code, 0);
    t.truthy(stdout === '5678\n');
    t.truthy(stderr === '');
    t.end();
  });
});

test.cb('callback as end argument', t => {
  shell.exec(JSON.stringify(process.execPath) + ' -e "console.log(5566);"', { async: true }, (code2, stdout2, stderr2) => {
    t.is(code2, 0);
    t.truthy(stdout2 === '5566\n');
    t.truthy(stderr2 === '');
    t.end();
  });
});

test.cb('callback as 3rd argument (silent:true)', t => {
  shell.exec(JSON.stringify(process.execPath) + ' -e "console.log(5678);"', { silent: true }, (code3, stdout3, stderr3) => {
    t.is(code3, 0);
    t.truthy(stdout3 === '5678\n' || stdout3 === '5678\nundefined\n');  // 'undefined' for v0.4
    t.truthy(stderr3 === '' || stderr3 === 'undefined\n');  // 'undefined' for v0.4
    t.end();
  });
});
