import path from 'path';

import test from 'ava';

import shell from '..';
import mocks from './utils/mocks';

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

test('Push valid directories', t => {
  const trail = shell.pushd('test/resources/pushd');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'test/resources/pushd'),
    rootDir,
  ]);
});

test('Two directories', t => {
  shell.pushd('test/resources/pushd');
  const trail = shell.pushd('a');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'test/resources/pushd/a'),
    path.resolve(rootDir, 'test/resources/pushd'),
    rootDir,
  ]);
});

test('Three directories', t => {
  shell.pushd('test/resources/pushd');
  shell.pushd('a');
  const trail = shell.pushd('../b');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'test/resources/pushd/b'),
    path.resolve(rootDir, 'test/resources/pushd/a'),
    path.resolve(rootDir, 'test/resources/pushd'),
    rootDir,
  ]);
});

test('Four directories', t => {
  shell.pushd('test/resources/pushd');
  shell.pushd('a');
  shell.pushd('../b');
  const trail = shell.pushd('c');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'test/resources/pushd/b/c'),
    path.resolve(rootDir, 'test/resources/pushd/b'),
    path.resolve(rootDir, 'test/resources/pushd/a'),
    path.resolve(rootDir, 'test/resources/pushd'),
    rootDir,
  ]);
});

test('Push stuff around with positive indices', t => {
  shell.pushd('test/resources/pushd');
  shell.pushd('a');
  shell.pushd('../b');
  shell.pushd('c');
  const trail = shell.pushd('+0');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'test/resources/pushd/b/c'),
    path.resolve(rootDir, 'test/resources/pushd/b'),
    path.resolve(rootDir, 'test/resources/pushd/a'),
    path.resolve(rootDir, 'test/resources/pushd'),
    rootDir,
  ]);
});

test('+1 option', t => {
  shell.pushd('test/resources/pushd');
  shell.pushd('a');
  shell.pushd('../b');
  shell.pushd('c');
  const trail = shell.pushd('+1');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'test/resources/pushd/b'),
    path.resolve(rootDir, 'test/resources/pushd/a'),
    path.resolve(rootDir, 'test/resources/pushd'),
    rootDir,
    path.resolve(rootDir, 'test/resources/pushd/b/c'),
  ]);
});

test('+2 option', t => {
  shell.pushd('test/resources/pushd');
  shell.pushd('a');
  shell.pushd('../b');
  shell.pushd('c');
  const trail = shell.pushd('+2');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'test/resources/pushd/a'),
    path.resolve(rootDir, 'test/resources/pushd'),
    rootDir,
    path.resolve(rootDir, 'test/resources/pushd/b/c'),
    path.resolve(rootDir, 'test/resources/pushd/b'),
  ]);
});

test('+3 option', t => {
  shell.pushd('test/resources/pushd');
  shell.pushd('a');
  shell.pushd('../b');
  shell.pushd('c');
  const trail = shell.pushd('+3');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'test/resources/pushd'),
    rootDir,
    path.resolve(rootDir, 'test/resources/pushd/b/c'),
    path.resolve(rootDir, 'test/resources/pushd/b'),
    path.resolve(rootDir, 'test/resources/pushd/a'),
  ]);
});

test('+4 option', t => {
  shell.pushd('test/resources/pushd');
  shell.pushd('a');
  shell.pushd('../b');
  shell.pushd('c');
  const trail = shell.pushd('+4');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    rootDir,
    path.resolve(rootDir, 'test/resources/pushd/b/c'),
    path.resolve(rootDir, 'test/resources/pushd/b'),
    path.resolve(rootDir, 'test/resources/pushd/a'),
    path.resolve(rootDir, 'test/resources/pushd'),
  ]);
});

test('Push stuff around with negative indices', t => {
  shell.pushd('test/resources/pushd');
  shell.pushd('a');
  shell.pushd('../b');
  shell.pushd('c');
  const trail = shell.pushd('-0');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    rootDir,
    path.resolve(rootDir, 'test/resources/pushd/b/c'),
    path.resolve(rootDir, 'test/resources/pushd/b'),
    path.resolve(rootDir, 'test/resources/pushd/a'),
    path.resolve(rootDir, 'test/resources/pushd'),
  ]);
});

test('-1 option', t => {
  shell.pushd('test/resources/pushd');
  shell.pushd('a');
  shell.pushd('../b');
  shell.pushd('c');
  const trail = shell.pushd('-1');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'test/resources/pushd'),
    rootDir,
    path.resolve(rootDir, 'test/resources/pushd/b/c'),
    path.resolve(rootDir, 'test/resources/pushd/b'),
    path.resolve(rootDir, 'test/resources/pushd/a'),
  ]);
});

test('-2 option', t => {
  shell.pushd('test/resources/pushd');
  shell.pushd('a');
  shell.pushd('../b');
  shell.pushd('c');
  const trail = shell.pushd('-2');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'test/resources/pushd/a'),
    path.resolve(rootDir, 'test/resources/pushd'),
    rootDir,
    path.resolve(rootDir, 'test/resources/pushd/b/c'),
    path.resolve(rootDir, 'test/resources/pushd/b'),
  ]);
});

test('-3 option', t => {
  shell.pushd('test/resources/pushd');
  shell.pushd('a');
  shell.pushd('../b');
  shell.pushd('c');
  const trail = shell.pushd('-3');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'test/resources/pushd/b'),
    path.resolve(rootDir, 'test/resources/pushd/a'),
    path.resolve(rootDir, 'test/resources/pushd'),
    rootDir,
    path.resolve(rootDir, 'test/resources/pushd/b/c'),
  ]);
});

test('-4 option', t => {
  shell.pushd('test/resources/pushd');
  shell.pushd('a');
  shell.pushd('../b');
  shell.pushd('c');
  const trail = shell.pushd('-4');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'test/resources/pushd/b/c'),
    path.resolve(rootDir, 'test/resources/pushd/b'),
    path.resolve(rootDir, 'test/resources/pushd/a'),
    path.resolve(rootDir, 'test/resources/pushd'),
    rootDir,
  ]);
});

test('Push without changing directory or resolving paths', t => {
  const trail = shell.pushd('-n', 'test/resources/pushd');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    rootDir,
    'test/resources/pushd',
  ]);
});

test('Using the -n option with a non-empty stack', t => {
  shell.pushd('-n', 'test/resources/pushd');
  const trail = shell.pushd('-n', 'test/resources/pushd/a');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    rootDir,
    'test/resources/pushd/a',
    'test/resources/pushd',
  ]);
});

test('Push invalid directory', t => {
  const oldCwd = process.cwd();
  shell.pushd('does/not/exist');
  t.is(
    shell.error(),
    `pushd: no such file or directory: ${path.resolve('.', 'does/not/exist')
      .replace(/\\/g, '/')}`
  );
  t.is(process.cwd(), oldCwd);
});

test(
  'Push without args swaps top two directories when stack length is 2',
  t => {
    let trail = shell.pushd('test/resources/pushd');
    t.falsy(shell.error());
    t.is(trail.length, 2);
    t.is(path.relative(rootDir, trail[0]), path.join('test/resources', 'pushd'));
    t.is(trail[1], rootDir);
    t.is(process.cwd(), trail[0]);
    trail = shell.pushd();
    t.falsy(shell.error());
    t.is(trail.length, 2);
    t.is(trail[0], rootDir);
    t.is(path.relative(rootDir, trail[1]), path.join('test/resources', 'pushd'));
    t.is(process.cwd(), trail[0]);
  }
);

test(
  'Push without args swaps top two directories for larger stacks',
  t => {
    shell.pushd('test/resources/pushd');
    shell.pushd();
    const trail = shell.pushd('test/resources/pushd/a');
    t.falsy(shell.error());
    t.is(trail.length, 3);
    t.is(path.relative(rootDir, trail[0]), path.join('test/resources', 'pushd', 'a'));
    t.is(trail[1], rootDir);
    t.is(path.relative(rootDir, trail[2]), path.join('test/resources', 'pushd'));
    t.is(process.cwd(), trail[0]);
  }
);

test('Pushing with no args', t => {
  shell.pushd('-n', 'test/resources/pushd');
  shell.pushd('test/resources/pushd/a');
  const trail = shell.pushd();
  t.falsy(shell.error());
  t.is(trail.length, 3);
  t.is(trail[0], rootDir);
  t.is(path.relative(rootDir, trail[1]), path.join('test/resources', 'pushd', 'a'));
  t.is(path.relative(rootDir, trail[2]), path.join('test/resources', 'pushd'));
  t.is(process.cwd(), trail[0]);
});

test('Push without arguments invalid when stack is empty', t => {
  shell.pushd();
  t.is(shell.error(), 'pushd: no other directory');
});

test('quiet mode off', t => {
  try {
    shell.config.silent = false;
    mocks.init();
    const trail = shell.pushd('test/resources/pushd');
    const stdout = mocks.stdout();
    const stderr = mocks.stderr();
    t.falsy(shell.error());
    t.is(stdout, '');
    t.is(stderr, `${path.resolve(rootDir, 'test/resources/pushd')} ${rootDir}\n`);
    t.is(process.cwd(), trail[0]);
    t.deepEqual(trail, [
      path.resolve(rootDir, 'test/resources/pushd'),
      rootDir,
    ]);
  } finally {
    shell.config.silent = true;
    mocks.restore();
  }
});

test('quiet mode on', t => {
  try {
    shell.config.silent = false;
    mocks.init();
    const trail = shell.pushd('-q', 'test/resources/pushd');
    const stdout = mocks.stdout();
    const stderr = mocks.stderr();
    t.falsy(shell.error());
    t.is(stdout, '');
    t.is(stderr, '');
    t.is(process.cwd(), trail[0]);
    t.deepEqual(trail, [
      path.resolve(rootDir, 'test/resources/pushd'),
      rootDir,
    ]);
  } finally {
    shell.config.silent = true;
    mocks.restore();
  }
});
