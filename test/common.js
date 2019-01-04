import test from 'ava';

import shell from '..';
import common from '../src/common';
import utils from './utils/utils';

test.beforeEach(() => {
  shell.config.silent = true;
  common.state.error = null;
  common.state.errorCode = 0;
});

test.afterEach(() => {
  common.config.resetForTesting();
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
    common.expand('test/resources');
  }, TypeError);
});

test('parseOptions (invalid option in options object)', t => {
  t.throws(() => {
    common.parseOptions({ q: 'some string value' }, {
      R: 'recursive',
      f: 'force',
      r: 'reverse',
    });
  }, common.CommandError);
});

test('parseOptions (without a hyphen in the string)', t => {
  t.throws(() => {
    common.parseOptions('f', {
      f: 'force',
    });
  }, Error);
});

test('parseOptions (opt is not a string/object)', t => {
  t.throws(() => {
    common.parseOptions(1, {
      f: 'force',
    });
  }, TypeError);
});

test('parseOptions (map is not an object)', t => {
  t.throws(() => {
    common.parseOptions('-f', 27);
  }, TypeError);
});

test('parseOptions (errorOptions is not an object)', t => {
  t.throws(() => {
    common.parseOptions('-f', {
      f: 'force',
    }, 'not a valid errorOptions');
  }, TypeError);
});

test('parseOptions (unrecognized string option)', t => {
  t.throws(() => {
    common.parseOptions('-z', {
      f: 'force',
    });
  }, common.CommandError);
});

test('parseOptions (unrecognized option in Object)', t => {
  t.throws(() => {
    common.parseOptions({ '-c': 7 }, {
      f: 'force',
    });
  });
});

test('parseOptions (invalid type)', t => {
  t.throws(() => {
    common.parseOptions(12, {
      R: 'recursive',
      f: 'force',
      r: 'reverse',
    });
  });
});

test('convertErrorOutput: no args', t => {
  t.throws(() => {
    common.convertErrorOutput();
  }, TypeError);
});

test('convertErrorOutput: input must be a vanilla string', t => {
  t.throws(() => {
    common.convertErrorOutput(3);
  }, TypeError);

  t.throws(() => {
    common.convertErrorOutput({});
  }, TypeError);
});

//
// Valids
//

//
// common.convertErrorOutput()
//
test('convertErrorOutput: nothing to convert', t => {
  const input = 'hello world';
  const result = common.convertErrorOutput(input);
  t.is(result, input);
});

test('convertErrorOutput: does not change forward slash', t => {
  const input = 'dir/sub/file.txt';
  const result = common.convertErrorOutput(input);
  t.is(result, input);
});

test('convertErrorOutput: changes backslashes to forward slashes', t => {
  const input = 'dir\\sub\\file.txt';
  const result = common.convertErrorOutput(input);
  t.is(result, 'dir/sub/file.txt');
});

//
// common.expand()
//
test('single file, array syntax', t => {
  const result = common.expand(['test/resources/file1.txt']);
  t.deepEqual(result, ['test/resources/file1.txt']);
});

test('multiple file, glob syntax, * for file name', t => {
  const result = common.expand(['test/resources/file*.txt']);
  t.deepEqual(result.sort(), ['test/resources/file1.txt', 'test/resources/file2.txt'].sort());
});

test('multiple file, glob syntax, * for directory name', t => {
  const result = common.expand(['test/r*/file*.txt']);
  t.deepEqual(result.sort(), ['test/resources/file1.txt', 'test/resources/file2.txt'].sort());
});

test('multiple file, glob syntax, ** for directory name', t => {
  const result = common.expand(['test/resources/**/file*.js']);
  t.deepEqual(
    result.sort(),
    ['test/resources/file1.js', 'test/resources/file2.js', 'test/resources/ls/file1.js', 'test/resources/ls/file2.js'].sort()
  );
});

test('broken links still expand', t => {
  const result = common.expand(['test/resources/b*dlink']);
  t.deepEqual(result, ['test/resources/badlink']);
});

test('empty array', t => {
  const result = common.expand([]);
  t.deepEqual(result, []);
});

test('empty string', t => {
  const result = common.expand(['']);
  t.deepEqual(result, ['']);
});

test('non-string', t => {
  const result = common.expand([5]);
  t.deepEqual(result, [5]);
});

//
// common.buffer()
//
test('common.buffer returns buffer', t => {
  const buf = common.buffer();
  t.truthy(buf instanceof Buffer);
  t.is(buf.length, 64 * 1024);
});

test('common.buffer with explicit length', t => {
  const buf = common.buffer(20);
  t.truthy(buf instanceof Buffer);
  t.is(buf.length, 20);
});

test('common.buffer with different config.bufLength', t => {
  common.config.bufLength = 20;
  const buf = common.buffer();
  t.truthy(buf instanceof Buffer);
  t.is(buf.length, 20);
});

test('common.parseOptions (normal case)', t => {
  const result = common.parseOptions('-Rf', {
    R: 'recursive',
    f: 'force',
    r: 'reverse',
  });

  t.truthy(result.recursive);
  t.truthy(result.force);
  t.falsy(result.reverse);
});

test('common.parseOptions (with mutually-negating options)', t => {
  const result = common.parseOptions('-f', {
    n: 'no_force',
    f: '!no_force',
    R: 'recursive',
  });

  t.falsy(result.recursive);
  t.falsy(result.no_force);
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

test('common.parseOptions throws when passed a string not starting with "-"', t => {
  t.throws(() => {
    common.parseOptions('a', { '-a': 'throws' });
  }, Error, "Options string must start with a '-'");
});

test('common.parseOptions allows long options', t => {
  const result = common.parseOptions({ value: true }, {
    v: 'value',
  });
  t.truthy(result.value);
});

test('common.parseOptions allows long options with values', t => {
  const someObject = {};
  const result = common.parseOptions({ value: someObject }, {
    v: 'value',
  });
  t.is(result.value, someObject);
});

test('common.parseOptions throws for unknown long option', t => {
  t.throws(() => {
    common.parseOptions({ throws: true }, {
      v: 'value',
    });
  }, common.CommandError);
});

test('common.parseOptions with -- argument', t => {
  const result = common.parseOptions('--', {
    R: 'recursive',
    f: 'force',
    r: 'reverse',
  });

  t.falsy(result.recursive);
  t.falsy(result.force);
  t.falsy(result.reverse);
});

test('Some basic tests on the ShellString type', t => {
  const result = shell.ShellString('foo');
  t.is(result.toString(), 'foo');
  t.is(result.stdout, 'foo');
  t.is(result.stderr, undefined);
  t.truthy(result.to);
  t.truthy(result.toEnd);
});

test.cb('Commands that fail will still output error messages to stderr', t => {
  const script = 'require(\'./global\'); ls(\'noexist\'); cd(\'noexist\');';
  utils.runScript(script, (err, stdout, stderr) => {
    t.is(stdout, '');
    t.is(
      stderr,
      'ls: no such file or directory: noexist\ncd: no such file or directory: noexist\n'
    );
    t.end();
  });
});

test('execPath value makes sense', t => {
  // TODO(nate): change this test if we add electron support in the unit tests
  t.is(shell.config.execPath, process.execPath);
  t.is(typeof shell.config.execPath, 'string');
});

test('Changing shell.config.execPath does not modify process', t => {
  shell.config.execPath = 'foo';
  t.not(shell.config.execPath, process.execPath);
});

test('CommandError is a subclass of Error', t => {
  const e = new common.CommandError(new common.ShellString('some value'));
  t.truthy(e instanceof common.CommandError);
  t.truthy(e instanceof Error);
  t.is(e.constructor, common.CommandError);
});
