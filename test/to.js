import test from 'ava';
import shell from '..';
import fs from 'fs';

let TMP;

test.beforeEach(() => {
  TMP = require('./utils/utils').getTempDir();
  shell.config.silent = true;

  shell.rm('-rf', TMP);
  shell.mkdir(TMP);
});


//
// Invalids
//

test('Normal strings don\'t have \'.to()\' anymore', t => {
  const str = 'hello world';
  t.truthy(typeof str.to === 'undefined');
});

test('No Test Title #48', t => {
  shell.ShellString('hello world').to();
  t.truthy(shell.error());
});

test('No Test Title #49', t => {
  t.is(fs.existsSync('/asdfasdf'), false); // sanity check
  shell.ShellString('hello world').to('/asdfasdf/file');
  t.truthy(shell.error());
});

//
// Valids
//

test('No Test Title #51', t => {
  shell.ShellString('hello world').to(`${TMP}/to1`).to(`${TMP}/to2`);
  let result = shell.cat(`${TMP}/to1`);
  t.is(shell.error(), null);
  t.is(result.toString(), 'hello world');
  result = shell.cat(`${TMP}/to2`);
  t.is(shell.error(), null);
  t.is(result.toString(), 'hello world');
});

test('With a glob', t => {
  shell.touch(`${TMP}/to1`);
  shell.ShellString('goodbye').to(`${TMP}/t*1`);
  t.is(fs.existsSync(`${TMP}/t*1`), false, 'globs are not interpreted literally');
  const result = shell.cat(`${TMP}/to1`);
  t.is(shell.error(), null);
  t.is(result.toString(), 'goodbye');
});
