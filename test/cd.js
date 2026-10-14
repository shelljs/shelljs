const fs = require('fs');
const os = require('os');
const path = require('path');

const test = require('ava');

const shell = require('..');
const utils = require('./utils/utils');

const cur = shell.pwd().toString();

test.beforeEach(t => {
  t.context.tmp = utils.getTempDir();
  shell.config.resetForTesting();
  process.chdir(cur);
  shell.mkdir(t.context.tmp);
});

test.afterEach.always(t => {
  process.chdir(cur);
  shell.rm('-rf', t.context.tmp);
});

//
// Invalids
//

test('nonexistent directory', t => {
  t.falsy(fs.existsSync('/asdfasdf'));
  const result = shell.cd('/asdfasdf'); // dir does not exist
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'cd: no such file or directory: /asdfasdf');
});

test('file not dir', t => {
  t.truthy(fs.existsSync('test/resources/file1')); // sanity check
  const result = shell.cd('test/resources/file1'); // file, not dir
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'cd: not a directory: test/resources/file1');
});

test('no previous dir', t => {
  const result = shell.cd('-'); // Haven't changed yet, so there is no previous directory
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'cd: could not find previous directory');
});

//
// Valids
//

test('relative path', t => {
  const result = shell.cd(t.context.tmp);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(path.basename(process.cwd()), t.context.tmp);
});

test('absolute path', t => {
  const result = shell.cd('/');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(process.cwd(), path.resolve('/'));
});

test('previous directory (-)', t => {
  shell.cd('/');
  const result = shell.cd('-');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(process.cwd(), path.resolve(cur.toString()));
});

test('cd + other commands', t => {
  t.falsy(fs.existsSync(`${t.context.tmp}/file1`));
  let result = shell.cd('test/resources');
  t.falsy(shell.error());
  t.is(result.code, 0);
  result = shell.cp('file1', `../../${t.context.tmp}`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  result = shell.cd(`../../${t.context.tmp}`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(fs.existsSync('file1'));
});

test('Tilde expansion', t => {
  shell.cd('~');
  t.is(process.cwd(), os.homedir());
  shell.cd('..');
  t.not(process.cwd(), os.homedir());
  shell.cd('~'); // Change back to home
  t.is(process.cwd(), os.homedir());
});

test('Goes to home directory if no arguments are passed', t => {
  const result = shell.cd();
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(process.cwd(), os.homedir());
});

// Windows does not allow removing the working directory of a running process.
const testDeletedCwd = process.platform === 'win32' ? test.skip : test;

async function runFromDeletedCwd(t, script) {
  const result = await utils.runScript(`
    const fs = require('fs');
    const shell = require(${JSON.stringify(path.resolve(__dirname, '..'))});
    shell.config.resetForTesting();
    const start = process.cwd();
    const removed = fs.mkdtempSync(${JSON.stringify(path.resolve(t.context.tmp, 'deleted-cwd-'))});
    try {
      process.chdir(removed);
      fs.rmdirSync(removed);
      ${script}
    } finally {
      process.chdir(start);
      if (fs.existsSync(removed)) fs.rmdirSync(removed);
    }
  `);
  return JSON.parse(result.stdout);
}

[false, true].forEach(fatal => {
  ['absolute path', 'previous directory'].forEach(destination => {
    testDeletedCwd(`recovers from a deleted cwd with ${destination}, fatal=${fatal}`, async t => {
      const result = await runFromDeletedCwd(t, `
        shell.config.fatal = ${fatal};
        process.env.OLDPWD = start;
        const result = shell.cd(${destination === 'absolute path' ? 'start' : "'-'"});
        const output = {
          code: result.code,
          stderr: result.stderr,
          error: shell.error(),
          cwd: process.cwd(),
          hasOldpwd: Object.hasOwn(process.env, 'OLDPWD'),
        };
        shell.cd(start);
        output.nextOldpwd = process.env.OLDPWD;
        console.log(JSON.stringify(output));
      `);
      t.is(result.code, 0);
      t.is(result.stderr, null);
      t.is(result.error, null);
      t.is(result.cwd, cur);
      t.false(result.hasOldpwd);
      t.is(result.nextOldpwd, cur);
      t.is(process.cwd(), cur);
    });
  });

  ['missing directory', 'file'].forEach(destination => {
    testDeletedCwd(`preserves ${destination} errors from a deleted cwd, fatal=${fatal}`, async t => {
      const target = destination === 'file'
        ? path.resolve('test/resources/file1') : path.resolve(t.context.tmp, 'missing');
      const message = `cd: ${destination === 'file' ? 'not a directory' : 'no such file or directory'}: ${target}`;
      const result = await runFromDeletedCwd(t, `
        shell.config.fatal = ${fatal};
        process.env.OLDPWD = start;
        let output;
        try {
          const result = shell.cd(${JSON.stringify(target)});
          output = { code: result.code, message: result.stderr, threw: false };
        } catch (error) {
          output = { code: error.code, message: error.message, threw: true };
        }
        output.oldpwd = process.env.OLDPWD;
        console.log(JSON.stringify(output));
      `);
      t.is(result.code, 1);
      t.is(result.message, message);
      t.is(result.threw, fatal);
      t.is(result.oldpwd, cur);
      t.is(process.cwd(), cur);
    });
  });
});

test('does not ignore cwd errors other than ENOENT', async t => {
  const result = await utils.runScript(`
    const shell = require(${JSON.stringify(path.resolve(__dirname, '..'))});
    shell.config.resetForTesting();
    shell.config.noglob = true;
    const start = process.cwd();
    const cwd = process.cwd;
    const chdir = process.chdir;
    process.env.OLDPWD = start;
    let chdirCalled = false;
    let output;
    try {
      process.cwd = () => {
        const error = new Error('cannot read current directory');
        error.code = 'EACCES';
        throw error;
      };
      process.chdir = () => { chdirCalled = true; };
      const result = shell.cd(start);
      output = { code: result.code, stderr: result.stderr, oldpwd: process.env.OLDPWD };
    } finally {
      process.cwd = cwd;
      process.chdir = chdir;
    }
    output.chdirCalled = chdirCalled;
    console.log(JSON.stringify(output));
  `);
  const output = JSON.parse(result.stdout);
  t.is(output.code, 1);
  t.truthy(output.stderr);
  t.false(output.chdirCalled);
  t.is(output.oldpwd, cur);
});
