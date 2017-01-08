import path from 'path';

import test from 'ava';

import shell from '..';

const rootDir = path.resolve();

function reset() {
  shell.dirs('-c');
  shell.cd(rootDir);
}

test.beforeEach(() => {
  shell.config.resetForTesting();
  reset();
});


test.after.always(() => {
  reset();
});

//
// Valids
//

test('basic usage', t => {
  shell.pushd('resources/pushd');
  const trail = shell.popd();
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [rootDir]);
});

test('two directories on the stack', t => {
  shell.pushd('resources/pushd');
  shell.pushd('a');
  const trail = shell.popd();
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'resources/pushd'),
    rootDir,
  ]);
});

test('three directories on the stack', t => {
  shell.pushd('resources/pushd');
  shell.pushd('b');
  shell.pushd('c');
  const trail = shell.popd();
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'resources/pushd/b'),
    path.resolve(rootDir, 'resources/pushd'),
    rootDir,
  ]);
});

test('Valid by index', t => {
  shell.pushd('resources/pushd');
  const trail = shell.popd('+0');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [rootDir]);
});

test('Using +1 option', t => {
  shell.pushd('resources/pushd');
  const trail = shell.popd('+1');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [path.resolve(rootDir, 'resources/pushd')]);
});

test('Using -0 option', t => {
  shell.pushd('resources/pushd');
  const trail = shell.popd('-0');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [path.resolve(rootDir, 'resources/pushd')]);
});

test('Using -1 option', t => {
  shell.pushd('resources/pushd');
  const trail = shell.popd('-1');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [rootDir]);
});

test('Using -n option', t => {
  shell.pushd('resources/pushd');
  const trail = shell.popd('-n');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [path.resolve(rootDir, 'resources/pushd')]);
});

test('Popping an empty stack', t => {
  shell.popd();
  t.truthy(shell.error('popd: directory stack empty\n'));
});

test('Test that rootDir is not stored', t => {
  shell.cd('resources/pushd');
  shell.pushd('b');
  const trail = shell.popd();
  t.falsy(shell.error());
  t.is(trail[0], path.resolve(rootDir, 'resources/pushd'));
  t.is(process.cwd(), trail[0]);
  shell.popd(); // no more in the stack
  t.truthy(shell.error());
});
