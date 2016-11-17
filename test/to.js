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

test('Normal strings don\'t have \'.to()\' anymore', t => {
  const str = 'hello world';
  t.is(typeof str.to, 'undefined');
});

test('no file argument', t => {
  shell.ShellString('hello world').to();
  t.truthy(shell.error());
});

test('cannot write to a non-existent directory', t => {
  t.falsy(fs.existsSync('/asdfasdf')); // sanity check
  shell.ShellString('hello world').to('/asdfasdf/file');
  t.truthy(shell.error());
});

//
// Valids
//

test('can be chained', t => {
  shell.ShellString('hello world').to(`${t.context.tmp}/to1`).to(`${t.context.tmp}/to2`);
  let result = shell.cat(`${t.context.tmp}/to1`);
  t.falsy(shell.error());
  t.is(result.toString(), 'hello world');
  result = shell.cat(`${t.context.tmp}/to2`);
  t.falsy(shell.error());
  t.is(result.toString(), 'hello world');
});

test('With a glob', t => {
  shell.touch(`${t.context.tmp}/to1`);
  shell.ShellString('goodbye').to(`${t.context.tmp}/t*1`);
  t.falsy(fs.existsSync(`${t.context.tmp}/t*1`), 'globs are not interpreted literally');
  const result = shell.cat(`${t.context.tmp}/to1`);
  t.falsy(shell.error());
  t.is(result.toString(), 'goodbye');
});
