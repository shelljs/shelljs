import test from 'ava';
import shell from '..';
import fs from 'fs';
import utils from './utils/utils';

test.beforeEach(t => {
  t.context.tmp = utils.getTempDir();
  shell.config.silent = true;
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
  t.is(typeof str.toEnd, 'undefined');
});

test('missing file argument', t => {
  shell.ShellString('hello world').toEnd();
  t.truthy(shell.error());
});

//
// Valids
//

// TODO(nate): break this into multiple tests
test('creates a new file', t => {
  let result;
  t.falsy(fs.existsSync(`${t.context.tmp}/toEnd1`)); // Check file toEnd() creates does not already exist
  t.falsy(fs.existsSync(`${t.context.tmp}/toEnd2`));
  shell.ShellString('hello ').toEnd(`${t.context.tmp}/toEnd1`);
  t.truthy(fs.existsSync(`${t.context.tmp}/toEnd1`)); // Check that file was created
  shell.ShellString('world').toEnd(`${t.context.tmp}/toEnd1`).toEnd(`${t.context.tmp}/toEnd2`); // Write some more to the file
  result = shell.cat(`${t.context.tmp}/toEnd1`);
  t.falsy(shell.error());
  t.is(result.toString(), 'hello world'); // Check that the result is what we expect
  result = shell.cat(`${t.context.tmp}/toEnd2`);
  t.falsy(shell.error());
  t.is(result.toString(), 'world'); // Check that the result is what we expect
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
