import test from 'ava';
import shell from '..';
import path from 'path';

const rootDir = path.resolve();

function reset() {
  shell.dirs('-c');
  shell.cd(rootDir);
}

test.beforeEach(() => {
  shell.config.silent = true;
});


//
// Valids
//

test('Push valid directories', t => {
  const trail = shell.pushd('resources/pushd');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'resources/pushd'),
    rootDir,
  ]);
});

test('No Test Title #67', t => {
  const trail = shell.pushd('a');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'resources/pushd/a'),
    path.resolve(rootDir, 'resources/pushd'),
    rootDir,
  ]);
});

test('No Test Title #68', t => {
  const trail = shell.pushd('../b');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'resources/pushd/b'),
    path.resolve(rootDir, 'resources/pushd/a'),
    path.resolve(rootDir, 'resources/pushd'),
    rootDir,
  ]);
});

test('No Test Title #69', t => {
  const trail = shell.pushd('c');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'resources/pushd/b/c'),
    path.resolve(rootDir, 'resources/pushd/b'),
    path.resolve(rootDir, 'resources/pushd/a'),
    path.resolve(rootDir, 'resources/pushd'),
    rootDir,
  ]);
});

test('Push stuff around with positive indices', t => {
  const trail = shell.pushd('+0');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'resources/pushd/b/c'),
    path.resolve(rootDir, 'resources/pushd/b'),
    path.resolve(rootDir, 'resources/pushd/a'),
    path.resolve(rootDir, 'resources/pushd'),
    rootDir,
  ]);
});

test('No Test Title #70', t => {
  const trail = shell.pushd('+1');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'resources/pushd/b'),
    path.resolve(rootDir, 'resources/pushd/a'),
    path.resolve(rootDir, 'resources/pushd'),
    rootDir,
    path.resolve(rootDir, 'resources/pushd/b/c'),
  ]);
});

test('No Test Title #71', t => {
  const trail = shell.pushd('+2');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'resources/pushd'),
    rootDir,
    path.resolve(rootDir, 'resources/pushd/b/c'),
    path.resolve(rootDir, 'resources/pushd/b'),
    path.resolve(rootDir, 'resources/pushd/a'),
  ]);
});

test('No Test Title #72', t => {
  const trail = shell.pushd('+3');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'resources/pushd/b'),
    path.resolve(rootDir, 'resources/pushd/a'),
    path.resolve(rootDir, 'resources/pushd'),
    rootDir,
    path.resolve(rootDir, 'resources/pushd/b/c'),
  ]);
});

test('No Test Title #73', t => {
  const trail = shell.pushd('+4');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'resources/pushd/b/c'),
    path.resolve(rootDir, 'resources/pushd/b'),
    path.resolve(rootDir, 'resources/pushd/a'),
    path.resolve(rootDir, 'resources/pushd'),
    rootDir,
  ]);
});

test('Push stuff around with negative indices', t => {
  const trail = shell.pushd('-0');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    rootDir,
    path.resolve(rootDir, 'resources/pushd/b/c'),
    path.resolve(rootDir, 'resources/pushd/b'),
    path.resolve(rootDir, 'resources/pushd/a'),
    path.resolve(rootDir, 'resources/pushd'),
  ]);
});

test('No Test Title #74', t => {
  const trail = shell.pushd('-1');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'resources/pushd/a'),
    path.resolve(rootDir, 'resources/pushd'),
    rootDir,
    path.resolve(rootDir, 'resources/pushd/b/c'),
    path.resolve(rootDir, 'resources/pushd/b'),
  ]);
});

test('No Test Title #75', t => {
  const trail = shell.pushd('-2');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    rootDir,
    path.resolve(rootDir, 'resources/pushd/b/c'),
    path.resolve(rootDir, 'resources/pushd/b'),
    path.resolve(rootDir, 'resources/pushd/a'),
    path.resolve(rootDir, 'resources/pushd'),
  ]);
});

test('No Test Title #76', t => {
  const trail = shell.pushd('-3');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'resources/pushd/b/c'),
    path.resolve(rootDir, 'resources/pushd/b'),
    path.resolve(rootDir, 'resources/pushd/a'),
    path.resolve(rootDir, 'resources/pushd'),
    rootDir,
  ]);
});

test('No Test Title #77', t => {
  const trail = shell.pushd('-4');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'resources/pushd/b/c'),
    path.resolve(rootDir, 'resources/pushd/b'),
    path.resolve(rootDir, 'resources/pushd/a'),
    path.resolve(rootDir, 'resources/pushd'),
    rootDir,
  ]);
});

test('Push without changing directory or resolving paths', t => {
  reset();
  const trail = shell.pushd('-n', 'resources/pushd');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    rootDir,
    'resources/pushd',
  ]);
});

test('No Test Title #78', t => {
  const trail = shell.pushd('-n', 'resources/pushd/a');
  t.is(shell.error(), null);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    rootDir,
    'resources/pushd/a',
    'resources/pushd',
  ]);
});

test('Push invalid directory', t => {
  const oldCwd = process.cwd();
  shell.pushd('does/not/exist');
  t.is(
    shell.error(),
    'pushd: no such file or directory: ' + path.resolve('.', 'does/not/exist')
  );
  t.is(process.cwd(), oldCwd);
});

test(
  'Push without arguments should swap top two directories when stack length is 2',
  t => {
    reset();
    let trail = shell.pushd('resources/pushd');
    t.is(shell.error(), null);
    t.is(trail.length, 2);
    t.is(path.relative(rootDir, trail[0]), path.join('resources', 'pushd'));
    t.is(trail[1], rootDir);
    t.is(process.cwd(), trail[0]);
    trail = shell.pushd();
    t.is(shell.error(), null);
    t.is(trail.length, 2);
    t.is(trail[0], rootDir);
    t.is(path.relative(rootDir, trail[1]), path.join('resources', 'pushd'));
    t.is(process.cwd(), trail[0]);
  }
);

test(
  'Push without arguments should swap top two directories when stack length is > 2',
  t => {
    const trail = shell.pushd('resources/pushd/a');
    t.is(shell.error(), null);
    t.is(trail.length, 3);
    t.is(path.relative(rootDir, trail[0]), path.join('resources', 'pushd', 'a'));
    t.is(trail[1], rootDir);
    t.is(path.relative(rootDir, trail[2]), path.join('resources', 'pushd'));
    t.is(process.cwd(), trail[0]);
  }
);

test('No Test Title #79', t => {
  const trail = shell.pushd();
  t.is(shell.error(), null);
  t.is(trail.length, 3);
  t.is(trail[0], rootDir);
  t.is(path.relative(rootDir, trail[1]), path.join('resources', 'pushd', 'a'));
  t.is(path.relative(rootDir, trail[2]), path.join('resources', 'pushd'));
  t.is(process.cwd(), trail[0]);
});

test('Push without arguments invalid when stack is empty', t => {
  reset(); shell.pushd();
  t.is(shell.error(), 'pushd: no other directory');
});
