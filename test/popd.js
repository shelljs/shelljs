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


test.after(() => {
  shell.cd(rootDir);
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

test('No Test Title #55', t => {
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

test('No Test Title #56', t => {
  shell.pushd('b');
  const trail = shell.popd();
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'resources/pushd'),
    rootDir,
  ]);
});

test('No Test Title #57', t => {
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

test('No Test Title #58', t => {
  const trail = shell.popd();
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [
    path.resolve(rootDir, 'resources/pushd'),
    rootDir,
  ]);
});

test('No Test Title #59', t => {
  const trail = shell.popd();
  t.falsy(shell.error());
  t.is(trail.length, 1);
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [rootDir]);
});

test('Valid by index', t => {
  shell.pushd('resources/pushd');
  const trail = shell.popd('+0');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [rootDir]);
});

test('No Test Title #60', t => {
  shell.pushd('resources/pushd');
  const trail = shell.popd('+1');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [path.resolve(rootDir, 'resources/pushd')]);
});

test('No Test Title #61', t => {
  reset(); shell.pushd('resources/pushd');
  const trail = shell.popd('-0');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [path.resolve(rootDir, 'resources/pushd')]);
});

test('No Test Title #62', t => {
  reset(); shell.pushd('resources/pushd');
  const trail = shell.popd('-1');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [rootDir]);
});

test('No Test Title #63', t => {
  reset(); shell.pushd('resources/pushd');
  const trail = shell.popd('-n');
  t.falsy(shell.error());
  t.is(process.cwd(), trail[0]);
  t.deepEqual(trail, [path.resolve(rootDir, 'resources/pushd')]);
});

test('Invalid', t => {
  shell.popd();
  t.truthy(shell.error('popd: directory stack empty\n'));
});

test('Test that rootDirDir is not stored', t => {
  shell.cd('resources/pushd');
  shell.pushd('b');
  const trail = shell.popd();
  t.falsy(shell.error());
  t.is(trail[0], path.resolve(rootDir, 'resources/pushd'));
  t.is(process.cwd(), trail[0]);
  shell.popd(); // no more in the stack
  t.truthy(shell.error());
});
