var shell = require('..');

var assert = require('assert'),
    fs = require('fs');

shell.config.silent = true;

//
// Invalids
//

shell.chmod('blah');  // missing args
assert.ok(shell.error());
shell.chmod('893', 'resources/chmod');  // invalid permissions - mode must be in octal
assert.ok(shell.error());

//
// Valids
//

// Chmod not applied on windows, could test writable vs. readable (0444 and 0666)
// Also fails if test on a windows shared network path...
if( shell.platform === 'win' )
    shell.exit(123);

// Test files - the bitmasking is to ignore the upper bits.
shell.chmod('755', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & 0777, 0755);
shell.chmod('644', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & 0777, 0644);

shell.chmod('o+x', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & 07, 05);
shell.chmod('644', 'resources/chmod/file1');

shell.chmod('+x', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & 0777, 0755);
shell.chmod('644', 'resources/chmod/file1');

// Test setuid
shell.chmod('u+s', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & 04000, 04000);
shell.chmod('u-s', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & 0777, 0644);

// according to POSIX standards at http://linux.die.net/man/1/chmod,
// setuid is never cleared from a directory unless explicitly asked for.
shell.chmod('u+s', 'resources/chmod/c');
shell.chmod('755', 'resources/chmod/c');
assert.equal(fs.statSync('resources/chmod/c').mode & 04000, 04000);
shell.chmod('u-s', 'resources/chmod/c');

// Test setgid
shell.chmod('g+s', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & 02000, 02000);
shell.chmod('g-s', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & 0777, 0644);

// Test sticky bit
shell.chmod('+t', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & 01000, 01000);
shell.chmod('-t', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & 0777, 0644);
assert.equal(fs.statSync('resources/chmod/file1').mode & 01000, 0);

// Test directories
shell.chmod('a-w', 'resources/chmod/b/a/b');
assert.equal(fs.statSync('resources/chmod/b/a/b').mode & 0777, 0555);
shell.chmod('755', 'resources/chmod/b/a/b');

// Test recursion
shell.chmod('-R', 'a+w', 'resources/chmod/b');
assert.equal(fs.statSync('resources/chmod/b/a/b').mode & 0777, 0777);
shell.chmod('-R', '755', 'resources/chmod/b');
assert.equal(fs.statSync('resources/chmod/b/a/b').mode & 0777, 0755);

// Test symbolic links w/ recursion  - WARNING: *nix only
fs.symlinkSync('resources/chmod/b/a', 'resources/chmod/a/b/c/link', 'dir');
shell.chmod('-R', 'u-w', 'resources/chmod/a/b');
assert.equal(fs.statSync('resources/chmod/a/b/c').mode & 0700, 0500);
assert.equal(fs.statSync('resources/chmod/b/a').mode & 0700, 0700);
shell.chmod('-R', 'u+w', 'resources/chmod/a/b');
fs.unlinkSync('resources/chmod/a/b/c/link');

shell.exit(123);