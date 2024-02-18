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
// Default glob expansion behavior
//

test('Expands to directories by default', t => {
  const result = common.expand(['test/resources/*a*']);
  t.is(result.length, 5);
  t.truthy(result.indexOf('test/resources/a.txt') > -1);
  t.truthy(result.indexOf('test/resources/badlink') > -1);
  t.truthy(result.indexOf('test/resources/cat') > -1);
  t.truthy(result.indexOf('test/resources/head') > -1);
  t.truthy(result.indexOf('test/resources/external') > -1);
});
