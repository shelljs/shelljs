import fs from 'fs';
import os from 'os';
import path from 'path';

import test from 'ava';

import shell from '..';
import utils from './utils/utils';

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
