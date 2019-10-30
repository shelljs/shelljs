import path from 'path';

import test from 'ava';

import shell from '..';

// TODO(nfischer): remove this when shell.cmd() is finished. For now, load it
// like any other plugin.
require('../src/cmd');

const CWD = process.cwd();

test.beforeEach(() => {
  process.chdir(CWD);
  shell.config.resetForTesting();
});

//
// Invalids
//

test('no args', t => {
  shell.cmd();
  t.truthy(shell.error());
});

test('unknown command', t => {
  const result = shell.cmd('asdfasdf'); // could not find command
  t.truthy(result.code > 0);
  t.is(result.code, 127);
});

test('config.fatal and unknown command', t => {
  shell.config.fatal = true;
  t.throws(() => {
    shell.cmd('asdfasdf'); // could not find command
  }, /.*command not found.*/);
});

// TODO(nfischer): enable only if we implement realtime output + captured
// output.
test.skip('cmd exits gracefully if we cannot find the execPath', t => {
  shell.config.execPath = null;
  shell.cmd('shx', 'echo', 'foo');
  t.regex(
    shell.error(),
    /Unable to find a path to the node binary\. Please manually set config\.execPath/
  );
});

//
// Valids
//

//
// sync
//

test('check if stdout goes to output', t => {
  const result = shell.cmd('shx', 'echo', 'this is stdout');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, 'this is stdout\n');
});

test('check if stderr goes to output', t => {
  const result = shell.cmd(shell.config.execPath, '-e', 'console.error("1234");');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, '');
  t.is(result.stderr, '1234\n');
});

test('check if stdout + stderr go to output', t => {
  const result = shell.cmd(shell.config.execPath, '-e', 'console.error(1234); console.log(666);');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, '666\n');
  t.is(result.stderr, '1234\n');
});

test('check exit code', t => {
  const result = shell.cmd(shell.config.execPath, '-e', 'process.exit(12);');
  t.truthy(shell.error());
  t.is(result.code, 12);
});

test('interaction with cd', t => {
  shell.cd('test/resources/external');
  const result = shell.cmd(shell.config.execPath, 'node_script.js');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, 'node_script_1234\n');
});

test('no need to escape quotes', t => {
  const result = shell.cmd(shell.config.execPath, '-e',
      `console.log("'+'_'+'");`); // eslint-disable-line quotes
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, "'+'_'+'\n");
});

test('commands can contain newlines', t => {
  // Github issue #175
  const result = shell.cmd(shell.config.execPath, '-e', `
console.log('line1')
console.log('line2')
`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, 'line1\nline2\n');
});

test('does not expand shell-style variables', t => {
  shell.env.FOO = 'Hello world';
  const result = shell.cmd('shx', 'echo', '$FOO');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, '$FOO\n');
});

test('does not expand windows-style variables', t => {
  shell.env.FOO = 'Hello world';
  let result = shell.cmd('shx', 'echo', '%FOO%');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, '%FOO%\n');
  result = shell.cmd('shx', 'echo', '!FOO!');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, '!FOO!\n');
});

test('cannot inject multiple commands', t => {
  const injection = '; echo semicolon && echo and || echo or';
  const result = shell.cmd('shx', 'echo', `hi${injection}`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, `hi${injection}\n`);
});

test('supports globbing by default', t => {
  // `echo` on windows will not glob, so it depends on shell.cmd() to expand the
  // glob before spawning the subprocess.
  const result = shell.cmd('shx', 'echo', 'test/resources/*.txt');
  t.falsy(shell.error());
  t.is(result.code, 0);
  const expectedFiles = [
    'test/resources/a.txt',
    'test/resources/file1.txt',
    'test/resources/file2.txt',
  ];
  t.is(result.stdout, `${expectedFiles.join(' ')}\n`);
});

test('globbing respects config.noglob', t => {
  shell.config.noglob = true;
  const result = shell.cmd('shx', 'echo', 'test/resources/*.txt');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, 'test/resources/*.txt\n');
});

test('set cwd', t => {
  const result = shell.cmd('shx', 'pwd', { cwd: '..' });
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, path.resolve('..') + '\n');
});

test('set maxBuffer (very small)', t => {
  const result = shell.cmd('shx', 'echo', '1234567890'); // default maxBuffer is ok
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, '1234567890\n');
  shell.cmd('shx', 'echo', '1234567890', { maxBuffer: 6 });
  t.truthy(shell.error());
});

test('set timeout option', t => {
  const result = shell.cmd(shell.config.execPath, 'test/resources/exec/slow.js', '100'); // default timeout is ok
  t.falsy(shell.error());
  t.is(result.code, 0);
  shell.cmd(shell.config.execPath, 'test/resources/exec/slow.js', '2000', { timeout: 1000 }); // times out
  t.truthy(shell.error());
});

test('check process.env works', t => {
  shell.env.FOO = 'Hello world';
  // Launch any sub process, and process.env should be propagated through.
  const result =
    shell.cmd(shell.config.execPath, '-p', 'process.env.FOO');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, 'Hello world\n');
  t.is(result.stderr, '');
});

test('cmd returns a ShellString', t => {
  const result = shell.cmd('shx', 'echo', 'foo');
  t.is(typeof result, 'object');
  t.truthy(result instanceof String);
  t.is(typeof result.stdout, 'string');
  t.is(result.toString(), result.stdout);
});

//
// async
//

// TODO(nfischer): enable after we implement async.
test.cb.skip('no callback', t => {
  const c = shell.cmd(shell.config.execPath, '-e', 'console.log(1234)', { async: true });
  t.falsy(shell.error());
  t.truthy('stdout' in c, 'async exec returns child process object');
  t.end();
});

// TODO(nfischer): enable after we implement async.
test.cb.skip('callback as 2nd argument', t => {
  shell.cmd(shell.config.execPath, '-e', 'console.log(5678);', (code, stdout, stderr) => {
    t.is(code, 0);
    t.is(stdout, '5678\n');
    t.is(stderr, '');
    t.end();
  });
});

// TODO(nfischer): enable after we implement async.
test.cb.skip('callback as end argument', t => {
  shell.cmd(shell.config.execPath, '-e', 'console.log(5566);', { async: true }, (code, stdout, stderr) => {
    t.is(code, 0);
    t.is(stdout, '5566\n');
    t.is(stderr, '');
    t.end();
  });
});

// TODO(nfischer): enable after we implement async.
test.cb.skip('callback as 3rd argument (silent:true)', t => {
  shell.cmd(shell.config.execPath, '-e', 'console.log(5678);', { silent: true }, (code, stdout, stderr) => {
    t.is(code, 0);
    t.is(stdout, '5678\n');
    t.is(stderr, '');
    t.end();
  });
});

// TODO(nfischer): enable after we implement async.
test.cb.skip('command that fails', t => {
  shell.cmd('shx', 'cp', 'onlyOneCpArgument.txt', { silent: true }, (code, stdout, stderr) => {
    t.is(code, 1);
    t.is(stdout, '');
    t.is(stderr, 'cp: missing <source> and/or <dest>\n');
    t.end();
  });
});
