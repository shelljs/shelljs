import os from 'os';
import path from 'path';
import util from 'util';

import test from 'ava';

import shell from '..';
import utils from './utils/utils';
import mocks from './utils/mocks';

const CWD = process.cwd();
const ORIG_EXEC_PATH = shell.config.execPath;
shell.config.silent = true;

test.beforeEach(() => {
  mocks.init();
});

test.afterEach.always(() => {
  process.chdir(CWD);
  shell.config.execPath = ORIG_EXEC_PATH;
  mocks.restore();
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
  }, /asdfasdf/); // name of command should be in error message
  shell.config.fatal = oldFatal;
});

test('options.fatal = true and unknown command', t => {
  const oldFatal = shell.config.fatal;
  shell.config.fatal = false;
  t.throws(() => {
    shell.exec('asdfasdf', { fatal: true }); // could not find command
  }, /asdfasdf/); // name of command should be in error message
  shell.config.fatal = oldFatal; // TODO(nfischer): this setting won't get reset if the assertion above fails
});

test('exec exits gracefully if we cannot find the execPath', t => {
  shell.config.execPath = null;
  shell.exec('echo foo');
  t.regex(
    shell.error(),
    /Unable to find a path to the node binary\. Please manually set config\.execPath/
  );
});

test('cannot require exec-child.js', t => {
  t.throws(() => {
    require('../src/exec-child.js');
  }, /This file should not be required/);
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

test('check if stdout + stderr should not be printed to console if silent', t => {
  shell.exec(`${JSON.stringify(shell.config.execPath)} -e "console.error(1234); console.log(666); process.exit(12);"`, { silent: true });
  const stdout = mocks.stdout();
  const stderr = mocks.stderr();
  t.is(stdout, '');
  t.is(stderr, '');
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
  const result2 = shell.exec('echo 1234567890', { maxBuffer: 6 });
  t.truthy(shell.error());
  t.is(result2.code, 1);
  t.is(result2.stdout, '1234567890' + os.EOL);
  const maxBufferErrorPattern = /.*\bmaxBuffer\b.*\bexceeded\b.*/;
  t.regex(result2.stderr, maxBufferErrorPattern);
});

test('set timeout option', t => {
  const result = shell.exec(`${JSON.stringify(shell.config.execPath)} test/resources/exec/slow.js 100`); // default timeout is ok
  t.falsy(shell.error());
  t.is(result.code, 0);
  shell.exec(`${JSON.stringify(shell.config.execPath)} test/resources/exec/slow.js 2000`, { timeout: 1000 }); // times out
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

test('encoding option works', t => {
  const result = shell.exec(`${JSON.stringify(shell.config.execPath)} -e "console.log(1234);"`, { encoding: 'buffer' });
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(Buffer.isBuffer(result.stdout));
  t.truthy(Buffer.isBuffer(result.stderr));
  t.is(result.stdout.toString(), '1234\n');
  t.is(result.stderr.toString(), '');
});

test('options.fatal = false and unknown command', t => {
  const oldFatal = shell.config.fatal;
  shell.config.fatal = true;
  const result = shell.exec('asdfasdf', { fatal: false }); // could not find command
  shell.config.fatal = oldFatal;
  t.truthy(shell.error());
  t.truthy(result.code);
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

test.cb('encoding option works with async', t => {
  shell.exec(`${JSON.stringify(shell.config.execPath)} -e "console.log(5566);"`, { async: true, encoding: 'buffer' }, (code, stdout, stderr) => {
    t.is(code, 0);
    t.truthy(Buffer.isBuffer(stdout));
    t.truthy(Buffer.isBuffer(stderr));
    t.is(stdout.toString(), '5566\n');
    t.is(stderr.toString(), '');
    t.end();
  });
});
