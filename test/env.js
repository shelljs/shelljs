const path = require('path');

const test = require('ava');

const shell = require('..');
const utils = require('./utils/utils');

shell.config.silent = true;

//
// Valids
//

test('existing variables', t => {
  t.is(shell.env.PATH, process.env.PATH);
});

test('variables are exported', t => {
  shell.env.SHELLJS_TEST = 'hello world';
  t.is(shell.env.SHELLJS_TEST, process.env.SHELLJS_TEST);
});

async function assertImportPreservesOldpwd(t, oldpwd) {
  const result = await utils.runScript(`
    ${oldpwd === undefined ? 'delete process.env.OLDPWD;' : `process.env.OLDPWD = ${JSON.stringify(oldpwd)};`}
    const shell = require(${JSON.stringify(path.resolve(__dirname, '..'))});
    console.log(JSON.stringify({
      present: Object.hasOwn(process.env, 'OLDPWD'),
      value: shell.env.OLDPWD,
    }));
  `);
  const output = JSON.parse(result.stdout);
  t.is(output.present, oldpwd !== undefined);
  t.is(output.value, oldpwd);
}

test('import preserves absent OLDPWD', async t => {
  await assertImportPreservesOldpwd(t, undefined);
});

test('import preserves empty OLDPWD', async t => {
  await assertImportPreservesOldpwd(t, '');
});

test('import preserves nonempty OLDPWD', async t => {
  await assertImportPreservesOldpwd(t, 'previous directory');
});

test('cd can use an inherited previous directory after import', async t => {
  const result = await utils.runScript(`
    const path = require('path');
    const start = process.cwd();
    const previous = path.resolve('test/resources');
    process.env.OLDPWD = previous;
    const shell = require(${JSON.stringify(path.resolve(__dirname, '..'))});
    shell.config.silent = true;
    const result = shell.cd('-');
    console.log(JSON.stringify({
      code: result.code,
      cwd: process.cwd(),
      oldpwd: process.env.OLDPWD,
      previous,
      start,
    }));
  `);
  const output = JSON.parse(result.stdout);
  t.is(output.code, 0);
  t.is(output.cwd, output.previous);
  t.is(output.oldpwd, output.start);
});
