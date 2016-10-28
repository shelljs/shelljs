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

test('config.silent is false by defaul', t => {
  t.is(shell.config.silent, false);
});

test('config.silent can be set to true', t => {
  shell.config.silent = true;
  t.is(shell.config.silent, true);
});

test('config.silent can be set to false', t => {
  shell.config.silent = false;
  t.is(shell.config.silent, false);
});

//
// config.fatal
//

test.cb('config.fatal = false', t => {
  t.is(shell.config.fatal, false);
  const script = 'require(\'../global.js\'); config.silent=true; config.fatal=false; cp("this_file_doesnt_exist", "."); echo("got here");';
  utils.runScript(script, (err, stdout) => {
    t.truthy(stdout.match('got here'));
    t.end();
  });
});

test.cb('config.fatal = true', t => {
  const script = 'require(\'../global.js\'); config.silent=true; config.fatal=true; cp("this_file_doesnt_exist", "."); echo("got here");';
  utils.runScript(script, (err, stdout) => {
    t.falsy(stdout.match('got here'));
    t.end();
  });
});

//
// config.globOptions
//

test('Expands to directories by default', t => {
  const result = common.expand(['resources/*a*']);
  t.is(result.length, 5);
  t.truthy(result.indexOf('resources/a.txt') > -1);
  t.truthy(result.indexOf('resources/badlink') > -1);
  t.truthy(result.indexOf('resources/cat') > -1);
  t.truthy(result.indexOf('resources/head') > -1);
  t.truthy(result.indexOf('resources/external') > -1);
});

test(
  'Check to make sure options get passed through (nodir is an example)',
  t => {
    shell.config.globOptions = { nodir: true };
    const result = common.expand(['resources/*a*']);
    t.is(result.length, 2);
    t.truthy(result.indexOf('resources/a.txt') > -1);
    t.truthy(result.indexOf('resources/badlink') > -1);
    t.truthy(result.indexOf('resources/cat') < 0);
    t.truthy(result.indexOf('resources/external') < 0);
  }
);
