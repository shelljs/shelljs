import test from 'ava';
import shell from '..';
import path from 'path';
import common from '../src/common';
import fs from 'fs';

const cur = shell.pwd().toString();
const TMP = require('./utils/utils').getTempDir();

test.beforeEach(() => {
  shell.config.silent = true;
  process.chdir(cur);
  shell.mkdir(TMP);
});

test.afterEach(() => {
  process.chdir(cur);
  shell.rm('-rf', TMP);
});

//
// Invalids
//

test('nonexistent directory', t => {
  t.is(fs.existsSync('/asdfasdf'), false);
  const result = shell.cd('/asdfasdf'); // dir does not exist
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'cd: no such file or directory: /asdfasdf');
});

test('file not dir', t => {
  t.is(fs.existsSync('resources/file1'), true); // sanity check
  const result = shell.cd('resources/file1'); // file, not dir
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'cd: not a directory: resources/file1');
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
  const result = shell.cd(TMP);
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(path.basename(process.cwd()), TMP);
});

test('absolute path', t => {
  const result = shell.cd('/');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(process.cwd(), path.resolve('/'));
});

test('previous directory (-)', t => {
  shell.cd('/');
  const result = shell.cd('-');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(process.cwd(), path.resolve(cur.toString()));
});

test('cd + other commands', t => {
  shell.rm('-f', `${TMP}/*`);
  t.is(fs.existsSync(`${TMP}/file1`), false);
  let result = shell.cd('resources');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  result = shell.cp('file1', `../${TMP}`);
  t.is(shell.error(), null);
  t.is(result.code, 0);
  result = shell.cd(`../${TMP}`);
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(fs.existsSync('file1'), true);
});

test('Tilde expansion', t => {
  shell.cd('~');
  t.is(process.cwd(), common.getUserHome());
  shell.cd('..');
  t.not(process.cwd(), common.getUserHome());
  shell.cd('~'); // Change back to home
  t.is(process.cwd(), common.getUserHome());
});

test('Goes to home directory if no arguments are passed', t => {
  const result = shell.cd();
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(process.cwd(), common.getUserHome());
});
