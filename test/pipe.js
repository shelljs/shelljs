var shell = require('..');

var assert = require('assert');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Invalids
//

// commands like `rm` can't be on the right side of pipes
assert.equal(typeof shell.ls('.').rm, 'undefined');
assert.equal(typeof shell.cat('resources/file1.txt').rm, 'undefined');

//
// Valids
//

// piping to cat() should return roughly the same thing
assert.strictEqual(shell.cat('resources/file1.txt').cat().toString(),
    shell.cat('resources/file1.txt').toString());

// piping ls() into cat() converts to a string
assert.strictEqual(shell.ls('resources/').cat().toString(),
    shell.ls('resources/').stdout);

var result;
result = shell.ls('resources/').grep('file1');
assert.equal(result + '', 'file1\nfile1.js\nfile1.txt\n');

result = shell.ls('resources/').cat().grep('file1');
assert.equal(result + '', 'file1\nfile1.js\nfile1.txt\n');

// Equivalent to a simple grep() test case
result = shell.cat('resources/grep/file').grep(/alpha*beta/);
assert.equal(shell.error(), null);
assert.equal(result.toString(), 'alphaaaaaaabeta\nalphbeta\n');

// Equivalent to a simple sed() test case
result = shell.cat('resources/grep/file').sed(/l*\.js/, '');
assert.ok(!shell.error());
assert.equal(result.toString(), 'alphaaaaaaabeta\nhowareyou\nalphbeta\nthis line ends in\n\n');

// Sort a file by frequency of each line
result = shell.sort('resources/uniq/pipe').uniq('-c').sort('-n');
assert.equal(shell.error(), null);
assert.equal(result.toString(), shell.cat('resources/uniq/pipeSorted').toString());

// Synchronous exec
var findCommand;
if (process.platform === 'win32') {
  // On Windows, we use the FIND command. FIND is semantically similar
  // to POSIX’s grep(1) except it only matches string literals. Also,
  // FIND requires the first argument, the search string, to be
  // wrapped in double quotes when accessed via GetCommandLine().
  // https://technet.microsoft.com/en-us/library/bb490906.aspx

  // Get the full path to FIND. If we just exec('find'), Windows will
  // try to run ./find.js with Windows Script Host.
  findCommand = '"' + shell.which('FIND') + '"';

  // Ensure the user does not have the wrong version of FIND. I.e.,
  // require the following to return error.
  result = shell.exec(findCommand + ' . -name no');
  if (!shell.error()) {
    console.error('Warning: Cannot verify piped exec: Found POSIX-like find(1) in PATH. This test assumes a Windows environment with its FIND command (fix your PATH, exit cygwin/mingw32/MSYS2).');
  } else {
    result = shell.cat('resources/grep/file').exec(findCommand + ' "alph"');
    assert.ok(!shell.error());
    assert.equal(result, 'alphaaaaaaabeta\r\nalphbeta\r\n');
  }
} else {
  if (shell.which('grep').stdout) {
    result = shell.cat('resources/grep/file').exec("grep 'alpha*beta'");
    assert.ok(!shell.error());
    assert.equal(result, 'alphaaaaaaabeta\nalphbeta\n');
  } else {
    console.error('Warning: Cannot verify piped exec');
  }
}

// Async exec
if (process.platform === 'win32') {
  // Ensure the user does not have the wrong version of FIND. I.e.,
  // require the following to return error.
  result = shell.exec(findCommand + ' . -name no');
  if (!shell.error()) {
    console.error('Warning: Cannot verify piped exec: Found POSIX-like find(1) in PATH. This test assumes a Windows environment with its FIND command (fix your PATH, exit cygwin/mingw32/MSYS2).');
    shell.exit(123);
  } else {
    shell.cat('resources/grep/file').exec(findCommand + ' "alph"', function (code, stdout) {
      assert.equal(code, 0);
      assert.equal(stdout, 'alphaaaaaaabeta\r\nalphbeta\r\n');
      shell.exit(123);
    });
  }
} else {
  if (shell.which('grep').stdout) {
    shell.cat('resources/grep/file').exec("grep 'alpha*beta'", function (code, stdout) {
      assert.equal(code, 0);
      assert.equal(stdout, 'alphaaaaaaabeta\nalphbeta\n');
      shell.exit(123);
    });
  } else {
    console.error('Warning: Cannot verify piped exec');
    shell.exit(123);
  }
}
