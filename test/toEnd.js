import test from 'ava';
import shell from '..';
import fs from 'fs';
import utils from './utils/utils';

let TMP;

test.beforeEach(() => {
  TMP = utils.getTempDir();
  shell.config.silent = true;
  shell.mkdir(TMP);
});

test.afterEach.always(() => {
  shell.rm('-rf', TMP);
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
  t.falsy(fs.existsSync(`${TMP}/toEnd1`)); // Check file toEnd() creates does not already exist
  t.falsy(fs.existsSync(`${TMP}/toEnd2`));
  shell.ShellString('hello ').toEnd(`${TMP}/toEnd1`);
  t.truthy(fs.existsSync(`${TMP}/toEnd1`)); // Check that file was created
  shell.ShellString('world').toEnd(`${TMP}/toEnd1`).toEnd(`${TMP}/toEnd2`); // Write some more to the file
  result = shell.cat(`${TMP}/toEnd1`);
  t.falsy(shell.error());
  t.is(result.toString(), 'hello world'); // Check that the result is what we expect
  result = shell.cat(`${TMP}/toEnd2`);
  t.falsy(shell.error());
  t.is(result.toString(), 'world'); // Check that the result is what we expect
});

test('With a glob', t => {
  shell.touch(`${TMP}/toEnd1`);
  shell.ShellString('good').to(`${TMP}/toE*1`);
  shell.ShellString('bye').toEnd(`${TMP}/toE*1`);
  t.falsy(
    fs.existsSync(`${TMP}/toE*1`)
  );
  const result = shell.cat(`${TMP}/toEnd1`);
  t.falsy(shell.error());
  t.is(result.toString(), 'goodbye');
});
