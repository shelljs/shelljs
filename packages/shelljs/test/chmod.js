var shell = require('..');
var common = require('../src/common');

var assert = require('assert'),
    fs = require('fs');

shell.config.silent = true;

//
// Invalids
//

var result = shell.chmod('blah');  // missing args
assert.ok(shell.error());
assert.equal(result.code, 1);
result = shell.chmod('893', 'resources/chmod');  // invalid permissions - mode must be in octal
assert.ok(shell.error());
assert.equal(result.code, 1);

//
// Valids
//

// On Windows, chmod acts VERY differently so skip those tests for now
if (common.platform === 'win')
    shell.exit(123);

// Test files - the bitmasking is to ignore the upper bits.
result = shell.chmod('755', 'resources/chmod/file1');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('777', 8), parseInt('755', 8));
result = shell.chmod('644', 'resources/chmod/file1');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('777', 8), parseInt('644', 8));

result = shell.chmod('o+x', 'resources/chmod/file1');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('007', 8), parseInt('005', 8));
result = shell.chmod('644', 'resources/chmod/file1');
assert.equal(result.code, 0);

result = shell.chmod('+x', 'resources/chmod/file1');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('777', 8), parseInt('755', 8));
result = shell.chmod('644', 'resources/chmod/file1');
assert.equal(result.code, 0);

// Test setuid
result = shell.chmod('u+s', 'resources/chmod/file1');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('4000', 8), parseInt('4000', 8));
result = shell.chmod('u-s', 'resources/chmod/file1');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('777', 8), parseInt('644', 8));

// according to POSIX standards at http://linux.die.net/man/1/chmod,
// setuid is never cleared from a directory unless explicitly asked for.
result = shell.chmod('u+s', 'resources/chmod/c');
assert.equal(result.code, 0);
result = shell.chmod('755', 'resources/chmod/c');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/c').mode & parseInt('4000', 8), parseInt('4000', 8));
result = shell.chmod('u-s', 'resources/chmod/c');
assert.equal(result.code, 0);

// Test setgid
result = shell.chmod('g+s', 'resources/chmod/file1');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('2000', 8), parseInt('2000', 8));
result = shell.chmod('g-s', 'resources/chmod/file1');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('777', 8), parseInt('644', 8));

// Test sticky bit
result = shell.chmod('+t', 'resources/chmod/file1');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('1000', 8), parseInt('1000', 8));
result = shell.chmod('-t', 'resources/chmod/file1');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('777', 8), parseInt('644', 8));
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('1000', 8), 0);

// Test directories
result = shell.chmod('a-w', 'resources/chmod/b/a/b');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/b/a/b').mode & parseInt('777', 8), parseInt('555', 8));
result = shell.chmod('755', 'resources/chmod/b/a/b');
assert.equal(result.code, 0);

// Test recursion
result = shell.chmod('-R', 'a+w', 'resources/chmod/b');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/b/a/b').mode & parseInt('777', 8), parseInt('777', 8));
result = shell.chmod('-R', '755', 'resources/chmod/b');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/b/a/b').mode & parseInt('777', 8), parseInt('755', 8));

// Test symbolic links w/ recursion  - WARNING: *nix only
fs.symlinkSync('resources/chmod/b/a', 'resources/chmod/a/b/c/link', 'dir');
result = shell.chmod('-R', 'u-w', 'resources/chmod/a/b');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/a/b/c').mode & parseInt('700', 8), parseInt('500', 8));
assert.equal(fs.statSync('resources/chmod/b/a').mode & parseInt('700', 8), parseInt('700', 8));
result = shell.chmod('-R', 'u+w', 'resources/chmod/a/b');
assert.equal(result.code, 0);
fs.unlinkSync('resources/chmod/a/b/c/link');

// Test combinations
result = shell.chmod('a-rwx', 'resources/chmod/file1');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('000', 8), parseInt('000', 8));
result = shell.chmod('644', 'resources/chmod/file1');
assert.equal(result.code, 0);

result = shell.chmod('a-rwx,u+r', 'resources/chmod/file1');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('400', 8), parseInt('400', 8));
result = shell.chmod('644', 'resources/chmod/file1');
assert.equal(result.code, 0);

result = shell.chmod('a-rwx,u+rw', 'resources/chmod/file1');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('600', 8), parseInt('600', 8));
result = shell.chmod('644', 'resources/chmod/file1');
assert.equal(result.code, 0);

result = shell.chmod('a-rwx,u+rwx', 'resources/chmod/file1');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('700', 8), parseInt('700', 8));
result = shell.chmod('644', 'resources/chmod/file1');
assert.equal(result.code, 0);

result = shell.chmod('000', 'resources/chmod/file1');
assert.equal(result.code, 0);
result = shell.chmod('u+rw', 'resources/chmod/file1');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('600', 8), parseInt('600', 8));
result = shell.chmod('644', 'resources/chmod/file1');
assert.equal(result.code, 0);

result = shell.chmod('000', 'resources/chmod/file1');
assert.equal(result.code, 0);
result = shell.chmod('u+wx', 'resources/chmod/file1');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('300', 8), parseInt('300', 8));
result = shell.chmod('644', 'resources/chmod/file1');
assert.equal(result.code, 0);

result = shell.chmod('000', 'resources/chmod/file1');
assert.equal(result.code, 0);
result = shell.chmod('u+r,g+w,o+x', 'resources/chmod/file1');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('421', 8), parseInt('421', 8));
result = shell.chmod('644', 'resources/chmod/file1');
assert.equal(result.code, 0);

result = shell.chmod('000', 'resources/chmod/file1');
assert.equal(result.code, 0);
result = shell.chmod('u+rw,g+wx', 'resources/chmod/file1');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('630', 8), parseInt('630', 8));
result = shell.chmod('644', 'resources/chmod/file1');
assert.equal(result.code, 0);

result = shell.chmod('700', 'resources/chmod/file1');
assert.equal(result.code, 0);
result = shell.chmod('u-x,g+rw', 'resources/chmod/file1');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('660', 8), parseInt('660', 8));
result = shell.chmod('644', 'resources/chmod/file1');
assert.equal(result.code, 0);

result = shell.chmod('a-rwx,u+rw', 'resources/chmod/file1');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('600', 8), parseInt('600', 8));
result = shell.chmod('a-rwx,u+rw', 'resources/chmod/file1');
assert.equal(result.code, 0);
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('600', 8), parseInt('600', 8));
result = shell.chmod('644', 'resources/chmod/file1');
assert.equal(result.code, 0);

// Support capital X ("entry" permission aka directory-only execute)

result = shell.chmod('744', 'resources/chmod/xdir');
assert.equal(result.code, 0);
result = shell.chmod('644', 'resources/chmod/xdir/file');
assert.equal(result.code, 0);
result = shell.chmod('744', 'resources/chmod/xdir/deep');
assert.equal(result.code, 0);
result = shell.chmod('644', 'resources/chmod/xdir/deep/file');
assert.equal(result.code, 0);
result = shell.chmod('-R', 'a+X', 'resources/chmod/xdir');
assert.equal(result.code, 0);

assert.equal(fs.statSync('resources/chmod/xdir').mode & parseInt('755', 8), parseInt('755', 8));
assert.equal(fs.statSync('resources/chmod/xdir/file').mode & parseInt('644', 8), parseInt('644', 8));
assert.equal(fs.statSync('resources/chmod/xdir/deep').mode & parseInt('755', 8), parseInt('755', 8));
assert.equal(fs.statSync('resources/chmod/xdir/deep/file').mode & parseInt('644', 8), parseInt('644', 8));

shell.exit(123);
