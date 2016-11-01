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

test.afterEach(() => {
  shell.rm('-rf', TMP);
});


//
// Invalids
//

test('Normal strings don\'t have \'.toEnd()\' anymore', t => {
  const str = 'hello world';
  t.truthy(typeof str.toEnd === 'undefined');
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
  t.is(fs.existsSync(`${TMP}/toEnd1`), false); // Check file toEnd() creates does not already exist
  t.is(fs.existsSync(`${TMP}/toEnd2`), false);
  shell.ShellString('hello ').toEnd(`${TMP}/toEnd1`);
  t.is(fs.existsSync(`${TMP}/toEnd1`), true); // Check that file was created
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
  t.is(
    fs.existsSync(`${TMP}/toE*1`),
    false,
    'globs are not interpreted literally'
  );
  const result = shell.cat(`${TMP}/toEnd1`);
  t.falsy(shell.error());
  t.is(result.toString(), 'goodbye');
});
