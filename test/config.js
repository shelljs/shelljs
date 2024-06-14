import path from 'path';

import test from 'ava';

import shell from '..';
import common from '../src/common';
import utils from './utils/utils';

//
// Valids
//

//
// config.silent
//

test('config.silent is false by default', t => {
  t.falsy(shell.config.silent);
});

test('config.silent can be set to true', t => {
  shell.config.silent = true;
  t.truthy(shell.config.silent);
});

test('config.silent can be set to false', t => {
  shell.config.silent = false;
  t.falsy(shell.config.silent);
});

//
// config.fatal
//

test.cb('config.fatal = false', t => {
  t.falsy(shell.config.fatal);
  const script = 'require(\'./global.js\'); config.silent=true; config.fatal=false; cp("this_file_doesnt_exist", "."); echo("got here");';
  utils.runScript(script, (err, stdout) => {
    t.truthy(stdout.match('got here'));
    t.end();
  });
});

test.cb('config.fatal = true', t => {
  const script = 'require(\'./global.js\'); config.silent=true; config.fatal=true; cp("this_file_doesnt_exist", "."); echo("got here");';
  utils.runScript(script, (err, stdout) => {
    t.falsy(stdout.match('got here'));
    t.end();
  });
});

//
// config.globOptions
//

test('config.globOptions expands directories by default', t => {
  const result = common.expand(['test/resources/*a*']);
  const expected = [
    'test/resources/a.txt',
    'test/resources/badlink',
    'test/resources/cat',
    'test/resources/external',
    'test/resources/head',
  ];
  t.deepEqual(result, expected);
});

test('config.globOptions respects cwd', t => {
  // Both node-glob and fast-glob call this option 'cwd'.
  shell.config.globOptions = { cwd: 'test' };
  const result = common.expand(['resources/*a*']);
  const expected = [
    'resources/a.txt',
    'resources/badlink',
    'resources/cat',
    'resources/external',
    'resources/head',
  ];
  t.deepEqual(result, expected);
});

test('config.globOptions respects dot', t => {
  // Both node-glob and fast-glob call this option 'dot'.
  shell.config.globOptions = { dot: true };
  const result = common.expand(['test/resources/ls/*']);
  t.is(result.length, 8);
  t.truthy(result.indexOf('test/resources/ls/.hidden_dir') > -1);
  t.truthy(result.indexOf('test/resources/ls/.hidden_file') > -1);
});

test('config.globOptions respects ignore', t => {
  // Both node-glob and fast-glob call this option 'ignore'.
  shell.config.globOptions = { ignore: ['test/resources/external'] };
  const result = common.expand(['test/resources/*a*']);
  const expected = [
    'test/resources/a.txt',
    'test/resources/badlink',
    'test/resources/cat',
    'test/resources/head',
  ];
  t.deepEqual(result, expected);
  // Does not include the result that we chose to ignore
  t.truthy(result.indexOf('test/resources/external') < 0);
});

test('config.globOptions respects absolute', t => {
  // Both node-glob and fast-glob call this option 'absolute'.
  shell.config.globOptions = { absolute: true };
  const result = common.expand(['test/resources/*a*']);
  function abs(file) {
    // Normalize to posix-style path separators on all platforms.
    const CWD = process.platform === 'win32' ?
        process.cwd().replace(/\\/g, '/') :
        process.cwd();
    return path.posix.join(CWD, file);
  }
  const expected = [
    abs('test/resources/a.txt'),
    abs('test/resources/badlink'),
    abs('test/resources/cat'),
    abs('test/resources/external'),
    abs('test/resources/head'),
  ];
  t.deepEqual(result, expected);
});

test('config.globOptions respects nodir', t => {
  shell.config.globOptions = { nodir: true };
  const result = common.expand(['test/resources/*a*']);
  // Includes files and symlinks.
  const expected = [
    'test/resources/a.txt',
    'test/resources/badlink',
  ];
  t.deepEqual(result, expected);
  // Does not include the directories.
  t.truthy(result.indexOf('test/resources/cat') < 0);
  t.truthy(result.indexOf('test/resources/head') < 0);
  t.truthy(result.indexOf('test/resources/external') < 0);
});
