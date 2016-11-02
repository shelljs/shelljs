/* globals cat, config, cp, env, error, exit, mkdir, rm */
import test from 'ava';
import '../global';
import fs from 'fs';
import utils from './utils/utils';

test.beforeEach(t => {
  t.context.tmp = utils.getTempDir();
  config.silent = true;
  mkdir(t.context.tmp);
});

test.afterEach.always(t => {
  rm('-rf', t.context.tmp);
});


//
// Valids
//

test('env is exported', t => {
  t.is(process.env, env);
});

test('cat', t => {
  const result = cat('resources/cat/file1');
  t.falsy(error());
  t.is(result.code, 0);
  t.is(result.toString(), 'test1\n');
});

test('rm', t => {
  cp('-f', 'resources/file1', `${t.context.tmp}/file1`);
  t.truthy(fs.existsSync(`${t.context.tmp}/file1`));
  const result = rm(`${t.context.tmp}/file1`);
  t.falsy(error());
  t.is(result.code, 0);
  t.falsy(fs.existsSync(`${t.context.tmp}/file1`));
});

test('String.prototype is modified for global require', t => {
  'foo'.to(`${t.context.tmp}/testfile.txt`);
  t.is('foo', cat(`${t.context.tmp}/testfile.txt`).toString());
  'bar'.toEnd(`${t.context.tmp}/testfile.txt`);
  t.is('foobar', cat(`${t.context.tmp}/testfile.txt`).toString());
});

