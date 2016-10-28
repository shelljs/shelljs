import test from 'ava';
import shell from '..';
import common from '../src/common';

test.beforeEach(() => {
  shell.config.silent = true;
});

//
// Invalids
//

test('too few args', t => {
  t.throws(() => {
    common.expand();
  }, TypeError);
});

test('should be a list', t => {
  t.throws(() => {
    common.expand('resources');
  }, TypeError);
});

//
// Valids
//

test('single file, array syntax', t => {
  const result = common.expand(['resources/file1.txt']);
  t.is(shell.error(), null);
  t.deepEqual(result, ['resources/file1.txt']);
});

test('multiple file, glob syntax, * for file name', t => {
  const result = common.expand(['resources/file*.txt']);
  t.is(shell.error(), null);
  t.deepEqual(result.sort(), ['resources/file1.txt', 'resources/file2.txt'].sort());
});

test('multiple file, glob syntax, * for directory name', t => {
  const result = common.expand(['*/file*.txt']);
  t.is(shell.error(), null);
  t.deepEqual(result.sort(), ['resources/file1.txt', 'resources/file2.txt'].sort());
});

test('multiple file, glob syntax, ** for directory name', t => {
  const result = common.expand(['**/file*.js']);
  t.is(shell.error(), null);
  t.deepEqual(
    result.sort(),
    ['resources/file1.js', 'resources/file2.js', 'resources/ls/file1.js', 'resources/ls/file2.js'].sort()
  );
});

test('broken links still expand', t => {
  const result = common.expand(['resources/b*dlink']);
  t.is(shell.error(), null);
  t.deepEqual(result, ['resources/badlink']);
});

test('common.parseOptions (normal case)', t => {
  const result = common.parseOptions('-Rf', {
    R: 'recursive',
    f: 'force',
    r: 'reverse',
  });

  t.truthy(result.recursive === true);
  t.truthy(result.force === true);
  t.truthy(result.reverse === false);
});

test('common.parseOptions (with mutually-negating options)', t => {
  const result = common.parseOptions('-f', {
    n: 'no_force',
    f: '!no_force',
    R: 'recursive',
  });

  t.truthy(result.recursive === false);
  t.truthy(result.no_force === false);
  t.truthy(result.force === undefined); // this key shouldn't exist
});

test(
  'common.parseOptions (the last of the conflicting options should hold)',
  t => {
    const options = {
      n: 'no_force',
      f: '!no_force',
      R: 'recursive',
    };
    let result = common.parseOptions('-fn', options);
    t.truthy(result.recursive === false);
    t.truthy(result.no_force === true);
    t.truthy(result.force === undefined); // this key shouldn't exist
    result = common.parseOptions('-nf', options);
    t.truthy(result.recursive === false);
    t.truthy(result.no_force === false);
    t.truthy(result.force === undefined); // this key shouldn't exist
  }
);

test('common.parseOptions using an object to hold options', t => {
  const result = common.parseOptions({ '-v': 'some text here' }, {
    v: 'value',
    f: 'force',
    r: 'reverse',
  });

  t.truthy(result.value === 'some text here');
  t.truthy(result.force === false);
  t.truthy(result.reverse === false);
});

test('Some basic tests on the ShellString type', t => {
  const result = shell.ShellString('foo');
  t.true(result.toString() === 'foo');
  t.is(result.stdout, 'foo');
  t.truthy(typeof result.stderr === 'undefined');
  t.truthy(result.to);
  t.truthy(result.toEnd);
});

test('Commands that fail will still output error messages to stderr', t => {
  const result = shell.exec(JSON.stringify(process.execPath) + ' -e "require(\'../global\'); ls(\'noexist\'); cd(\'noexist\');"');
  t.is(result.stdout, '');
  t.is(
    result.stderr,
    'ls: no such file or directory: noexist\ncd: no such file or directory: noexist\n'
  );
});

