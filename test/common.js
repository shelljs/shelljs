import test from 'ava';
import shell from '..';
import common from '../src/common';
import utils from './utils/utils';

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
  t.falsy(shell.error());
  t.deepEqual(result, ['resources/file1.txt']);
});

test('multiple file, glob syntax, * for file name', t => {
  const result = common.expand(['resources/file*.txt']);
  t.falsy(shell.error());
  t.deepEqual(result.sort(), ['resources/file1.txt', 'resources/file2.txt'].sort());
});

test('multiple file, glob syntax, * for directory name', t => {
  const result = common.expand(['r*/file*.txt']);
  t.falsy(shell.error());
  t.deepEqual(result.sort(), ['resources/file1.txt', 'resources/file2.txt'].sort());
});

test('multiple file, glob syntax, ** for directory name', t => {
  const result = common.expand(['resources/**/file*.js']);
  t.falsy(shell.error());
  t.deepEqual(
    result.sort(),
    ['resources/file1.js', 'resources/file2.js', 'resources/ls/file1.js', 'resources/ls/file2.js'].sort()
  );
});

test('broken links still expand', t => {
  const result = common.expand(['resources/b*dlink']);
  t.falsy(shell.error());
  t.deepEqual(result, ['resources/badlink']);
});

test('common.parseOptions (normal case)', t => {
  const result = common.parseOptions('-Rf', {
    R: 'recursive',
    f: 'force',
    r: 'reverse',
  });

  t.is(result.recursive, true);
  t.is(result.force, true);
  t.is(result.reverse, false);
});

test('common.parseOptions (with mutually-negating options)', t => {
  const result = common.parseOptions('-f', {
    n: 'no_force',
    f: '!no_force',
    R: 'recursive',
  });

  t.is(result.recursive, false);
  t.is(result.no_force, false);
  t.is(result.force, undefined); // this key shouldn't exist
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
    t.false(result.recursive);
    t.truthy(result.no_force);
    t.is(result.force, undefined); // this key shouldn't exist
    result = common.parseOptions('-nf', options);
    t.false(result.recursive);
    t.false(result.no_force);
    t.is(result.force, undefined); // this key shouldn't exist
  }
);

test('common.parseOptions using an object to hold options', t => {
  const result = common.parseOptions({ '-v': 'some text here' }, {
    v: 'value',
    f: 'force',
    r: 'reverse',
  });

  t.is(result.value, 'some text here');
  t.false(result.force);
  t.false(result.reverse);
});

test('Some basic tests on the ShellString type', t => {
  const result = shell.ShellString('foo');
  t.is(result.toString(), 'foo');
  t.is(result.stdout, 'foo');
  t.is(typeof result.stderr, 'undefined');
  t.truthy(result.to);
  t.truthy(result.toEnd);
});

test.cb('Commands that fail will still output error messages to stderr', t => {
  const script = 'require(\'../global\'); ls(\'noexist\'); cd(\'noexist\');';
  utils.runScript(script, (err, stdout, stderr) => {
    t.is(stdout, '');
    t.is(
      stderr,
      'ls: no such file or directory: noexist\ncd: no such file or directory: noexist\n'
    );
    t.end();
  });
});

