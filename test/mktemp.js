import fs from 'fs';
import path from 'path';

import test from 'ava';

import shell from '..';
import common from '../src/common';
import utils from './utils/utils';

const isNotWindows = common.platform !== 'win';

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

test('errors in case of conflict', t => {
  const fname = `${t.context.tmp}/tmp.A`;
  shell.touch(fname);
  const result = shell.mktemp(fname); // Guarenteed to have a confilct, no randomness.
  t.truthy(shell.error());
  t.is(result.code, 2);
});

//
// Valids
//

test('Basics', t => {
  const result = shell.mktemp();
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.length, 1);
  t.truthy(fs.existsSync(result[0]));
  t.truthy(fs.statSync(result[0]).isFile());
  if (isNotWindows) t.is(fs.statSync(result[0]).mode & parseInt('777', 8), parseInt('0600', 8));
});

test('Directory', t => {
  const result = shell.mktemp('-d');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.length, 1);
  t.truthy(fs.existsSync(result[0]));
  t.truthy(fs.statSync(result[0]).isDirectory());
  if (isNotWindows) t.is(fs.statSync(result[0]).mode & parseInt('777', 8), parseInt('0600', 8));
});

test('Custom Template', t => {
  const result = shell.mktemp(`${t.context.tmp}/tmp.XXX`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.length, 1);
  t.is(result[0].slice(0, -3), `${t.context.tmp}/tmp.`);
  t.truthy(fs.existsSync(result[0]));
  t.truthy(fs.statSync(result[0]).isFile());
  if (isNotWindows) t.is(fs.statSync(result[0]).mode & parseInt('777', 8), parseInt('0600', 8));
});

test('Custom Template (Directory)', t => {
  const result = shell.mktemp('-d', path.resolve('.', `${t.context.tmp}/tmp.XXX`));
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.length, 1);
  t.is(result[0].slice(0, -3), path.resolve('.', `${t.context.tmp}/tmp.`));
  t.truthy(fs.existsSync(result[0]));
  t.truthy(fs.statSync(result[0]).isDirectory());
  if (isNotWindows) t.is(fs.statSync(result[0]).mode & parseInt('777', 8), parseInt('0600', 8));
});

test('Custom Templates', t => {
  const result = shell.mktemp(path.resolve('.', `${t.context.tmp}/tmp.AXXX`), path.resolve('.', `${t.context.tmp}/tmp.BXXX`));
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.length, 2);
  t.is(result[0].slice(0, -3), path.resolve('.', `${t.context.tmp}/tmp.A`));
  t.is(result[1].slice(0, -3), path.resolve('.', `${t.context.tmp}/tmp.B`));
  t.truthy(fs.existsSync(result[0]));
  t.truthy(fs.statSync(result[0]).isFile());
  t.truthy(fs.existsSync(result[1]));
  t.truthy(fs.statSync(result[1]).isFile());
  if (isNotWindows) t.is(fs.statSync(result[0]).mode & parseInt('777', 8), parseInt('0600', 8));
  if (isNotWindows) t.is(fs.statSync(result[1]).mode & parseInt('777', 8), parseInt('0600', 8));
});

test('Custom Templates (Directory)', t => {
  const result = shell.mktemp('-d', path.resolve('.', `${t.context.tmp}/tmp.AXXX`), path.resolve('.', `${t.context.tmp}/tmp.BXXX`));
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.length, 2);
  t.is(result[0].slice(0, -3), path.resolve('.', `${t.context.tmp}/tmp.A`));
  t.is(result[1].slice(0, -3), path.resolve('.', `${t.context.tmp}/tmp.B`));
  t.truthy(fs.existsSync(result[0]));
  t.truthy(fs.statSync(result[0]).isDirectory());
  t.truthy(fs.existsSync(result[1]));
  t.truthy(fs.statSync(result[1]).isDirectory());
  if (isNotWindows) t.is(fs.statSync(result[0]).mode & parseInt('777', 8), parseInt('0600', 8));
});

test('Unsafe Mode', t => {
  const result = shell.mktemp('-u');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.length, 1);
  t.falsy(fs.existsSync(result[0]));
});

test('Unsafe Mode (Custom Templates)', t => {
  const result = shell.mktemp('-u', path.resolve('.', `${t.context.tmp}/tmp.AXXX`), path.resolve('.', `${t.context.tmp}/tmp.BXXX`));
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.length, 2);
  t.is(result[0].slice(0, -3), path.resolve('.', `${t.context.tmp}/tmp.A`));
  t.is(result[1].slice(0, -3), path.resolve('.', `${t.context.tmp}/tmp.B`));
  t.falsy(fs.existsSync(result[0]));
  t.falsy(fs.existsSync(result[1]));
});
