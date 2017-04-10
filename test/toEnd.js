import fs from 'fs';

import test from 'ava';

import shell from '..';
import utils from './utils/utils';

test.beforeEach(t => {
  t.context.tmp = utils.getTempDir();
  shell.config.resetForTesting();
  shell.mkdir(t.context.tmp);
});

test.afterEach.always(t => {
  shell.rm('-rf', t.context.tmp);
});


//
// Invalids
//

test('Normal strings don\'t have \'.toEnd()\' anymore', t => {
  const str = 'hello world';
  t.is(str.toEnd, undefined);
});

test('missing file argument', t => {
  shell.ShellString('hello world').toEnd();
  t.truthy(shell.error());
});

test('cannot write to a non-existent directory', t => {
  t.falsy(fs.existsSync('/asdfasdf')); // sanity check
  shell.ShellString('hello world').toEnd('/asdfasdf/file');
  t.truthy(shell.error());
});

//
// Valids
//

test('creates a new file', t => {
  t.falsy(fs.existsSync(`${t.context.tmp}/toEnd1`)); // Check file toEnd() creates does not already exist
  shell.ShellString('hello ').toEnd(`${t.context.tmp}/toEnd1`);
  t.truthy(fs.existsSync(`${t.context.tmp}/toEnd1`)); // Check that file was created
  const result = shell.cat(`${t.context.tmp}/toEnd1`);
  t.is(result.toString(), 'hello ');
});

test('can be chained', t => {
  t.falsy(fs.existsSync(`${t.context.tmp}/toEnd1`));
  t.falsy(fs.existsSync(`${t.context.tmp}/toEnd2`));
  shell.ShellString('hello ').toEnd(`${t.context.tmp}/toEnd1`);
  shell.ShellString('world')
    .toEnd(`${t.context.tmp}/toEnd1`)
    .toEnd(`${t.context.tmp}/toEnd2`); // Write some more to the file
  const result1 = shell.cat(`${t.context.tmp}/toEnd1`);
  t.falsy(shell.error());
  t.is(result1.toString(), 'hello world'); // Check that the result is what we expect
  const result2 = shell.cat(`${t.context.tmp}/toEnd2`);
  t.falsy(shell.error());
  t.is(result2.toString(), 'world'); // Check that the result is what we expect
});

test('With a glob', t => {
  shell.touch(`${t.context.tmp}/toEnd1`);
  shell.ShellString('good').to(`${t.context.tmp}/toE*1`);
  shell.ShellString('bye').toEnd(`${t.context.tmp}/toE*1`);
  t.falsy(
    fs.existsSync(`${t.context.tmp}/toE*1`)
  );
  const result = shell.cat(`${t.context.tmp}/toEnd1`);
  t.falsy(shell.error());
  t.is(result.toString(), 'goodbye');
});
