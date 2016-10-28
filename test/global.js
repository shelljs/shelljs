/* globals cat, config, cp, env, error, exit, mkdir, rm */
import test from 'ava';
import '../global';
import fs from 'fs';

const TMP = require('./utils/utils').getTempDir();

test.beforeEach(() => {
  config.silent = true;
  mkdir(TMP);
});

test.afterEach(() => {
  rm('-rf', TMP);
});


//
// Valids
//

test('env is exported', t => {
  t.is(process.env, env);
});

test('cat', t => {
  const result = cat('resources/cat/file1');
  t.is(error(), null);
  t.is(result.code, 0);
  t.is(result.toString(), 'test1\n');
});

test('rm', t => {
  cp('-f', 'resources/file1', `${TMP}/file1`);
  t.is(fs.existsSync(`${TMP}/file1`), true);
  const result = rm(`${TMP}/file1`);
  t.is(error(), null);
  t.is(result.code, 0);
  t.is(fs.existsSync(`${TMP}/file1`), false);
});

test('String.prototype is modified for global require', t => {
  'foo'.to(`${TMP}/testfile.txt`);
  t.is('foo', cat(`${TMP}/testfile.txt`).toString());
  'bar'.toEnd(`${TMP}/testfile.txt`);
  t.is('foobar', cat(`${TMP}/testfile.txt`).toString());
});

