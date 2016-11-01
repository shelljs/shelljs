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

test('Normal strings don\'t have \'.to()\' anymore', t => {
  const str = 'hello world';
  t.is(typeof str.to, 'undefined');
});

test('no file argument', t => {
  shell.ShellString('hello world').to();
  t.truthy(shell.error());
});

test('cannot write to a non-existent directory', t => {
  t.is(fs.existsSync('/asdfasdf'), false); // sanity check
  shell.ShellString('hello world').to('/asdfasdf/file');
  t.truthy(shell.error());
});

//
// Valids
//

test('can be chained', t => {
  shell.ShellString('hello world').to(`${TMP}/to1`).to(`${TMP}/to2`);
  let result = shell.cat(`${TMP}/to1`);
  t.falsy(shell.error());
  t.is(result.toString(), 'hello world');
  result = shell.cat(`${TMP}/to2`);
  t.falsy(shell.error());
  t.is(result.toString(), 'hello world');
});

test('With a glob', t => {
  shell.touch(`${TMP}/to1`);
  shell.ShellString('goodbye').to(`${TMP}/t*1`);
  t.is(fs.existsSync(`${TMP}/t*1`), false, 'globs are not interpreted literally');
  const result = shell.cat(`${TMP}/to1`);
  t.falsy(shell.error());
  t.is(result.toString(), 'goodbye');
});
