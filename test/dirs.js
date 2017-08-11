import path from 'path';

import test from 'ava';

import shell from '..';

test.beforeEach(() => {
  shell.config.resetForTesting();
  shell.pushd('test/resources/pushd');
  shell.pushd('a');
});

//
// Valids
//

const trail = [
  path.resolve(path.resolve(), 'test/resources/pushd/a'),
  path.resolve(path.resolve(), 'test/resources/pushd'),
  path.resolve(),
];

test('no arguments', t => {
  t.deepEqual(shell.dirs(), trail);
});

test('Single items', t => {
  t.is(shell.dirs('+0'), trail[0]);
  t.is(shell.dirs('+1'), trail[1]);
  t.is(shell.dirs('+2'), trail[2]);
  t.is(shell.dirs('-0'), trail[2]);
  t.is(shell.dirs('-1'), trail[1]);
  t.is(shell.dirs('-2'), trail[0]);
});

test('Clearing items', t => {
  t.deepEqual(shell.dirs('-c'), []);
  t.falsy(shell.error());
});
