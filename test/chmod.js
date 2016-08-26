import test from 'ava';
import shell from '..';
import fs from 'fs';

test.beforeEach(() => {
  shell.config.silent = true;
});


//
// Invalids
//

test('invalid permissions', t => {
  let result = shell.chmod('blah');
  t.truthy(shell.error());
  t.is(result.code, 1);
  result = shell.chmod('893', 'resources/chmod');  // invalid permissions - mode must be in octal
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('Test files - the bitmasking is to ignore the upper bits.', t => {
  let result = shell.chmod('755', 'resources/chmod/file1');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/file1').mode & parseInt('777', 8),
    parseInt('755', 8)
  );
  result = shell.chmod('644', 'resources/chmod/file1');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/file1').mode & parseInt('777', 8),
    parseInt('644', 8)
  );
});

test('symbolic mode', t => {
  let result = shell.chmod('o+x', 'resources/chmod/file1');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/file1').mode & parseInt('007', 8),
    parseInt('005', 8)
  );
  result = shell.chmod('644', 'resources/chmod/file1');
  t.is(result.code, 0);
});

test('symbolic mode, without group', t => {
  let result = shell.chmod('+x', 'resources/chmod/file1');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/file1').mode & parseInt('777', 8),
    parseInt('755', 8)
  );
  result = shell.chmod('644', 'resources/chmod/file1');
  t.is(result.code, 0);
});

test('Test setuid', t => {
  let result = shell.chmod('u+s', 'resources/chmod/file1');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/file1').mode & parseInt('4000', 8),
    parseInt('4000', 8)
  );
  result = shell.chmod('u-s', 'resources/chmod/file1');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/file1').mode & parseInt('777', 8),
    parseInt('644', 8)
  );

  // according to POSIX standards at http://linux.die.net/man/1/chmod,
  // setuid is never cleared from a directory unless explicitly asked for.
  result = shell.chmod('u+s', 'resources/chmod/c');

  t.is(result.code, 0);
  result = shell.chmod('755', 'resources/chmod/c');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/c').mode & parseInt('4000', 8),
    parseInt('4000', 8)
  );
  result = shell.chmod('u-s', 'resources/chmod/c');
  t.is(result.code, 0);
});

test('Test setgid', t => {
  let result = shell.chmod('g+s', 'resources/chmod/file1');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/file1').mode & parseInt('2000', 8),
    parseInt('2000', 8)
  );
  result = shell.chmod('g-s', 'resources/chmod/file1');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/file1').mode & parseInt('777', 8),
    parseInt('644', 8)
  );
});

test('Test sticky bit', t => {
  let result = shell.chmod('+t', 'resources/chmod/file1');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/file1').mode & parseInt('1000', 8),
    parseInt('1000', 8)
  );
  result = shell.chmod('-t', 'resources/chmod/file1');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/file1').mode & parseInt('777', 8),
    parseInt('644', 8)
  );
  t.is(fs.statSync('resources/chmod/file1').mode & parseInt('1000', 8), 0);
});

test('Test directories', t => {
  let result = shell.chmod('a-w', 'resources/chmod/b/a/b');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/b/a/b').mode & parseInt('777', 8),
    parseInt('555', 8)
  );
  result = shell.chmod('755', 'resources/chmod/b/a/b');
  t.is(result.code, 0);
});

test('Test recursion', t => {
  let result = shell.chmod('-R', 'a+w', 'resources/chmod/b');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/b/a/b').mode & parseInt('777', 8),
    parseInt('777', 8)
  );
  result = shell.chmod('-R', '755', 'resources/chmod/b');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/b/a/b').mode & parseInt('777', 8),
    parseInt('755', 8)
  );
});

test('Test symbolic links w/ recursion  - WARNING: *nix only', t => {
  fs.symlinkSync('resources/chmod/b/a', 'resources/chmod/a/b/c/link', 'dir');
  let result = shell.chmod('-R', 'u-w', 'resources/chmod/a/b');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/a/b/c').mode & parseInt('700', 8),
    parseInt('500', 8)
  );
  t.is(
    fs.statSync('resources/chmod/b/a').mode & parseInt('700', 8),
    parseInt('700', 8)
  );
  result = shell.chmod('-R', 'u+w', 'resources/chmod/a/b');
  t.is(result.code, 0);
  fs.unlinkSync('resources/chmod/a/b/c/link');
});

test('Test combinations', t => {
  let result = shell.chmod('a-rwx', 'resources/chmod/file1');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/file1').mode & parseInt('000', 8),
    parseInt('000', 8)
  );
  result = shell.chmod('644', 'resources/chmod/file1');
  t.is(result.code, 0);
});

test('multiple symbolic modes', t => {
  let result = shell.chmod('a-rwx,u+r', 'resources/chmod/file1');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/file1').mode & parseInt('400', 8),
    parseInt('400', 8)
  );
  result = shell.chmod('644', 'resources/chmod/file1');
  t.is(result.code, 0);
});

test('multiple symbolic modes #2', t => {
  let result = shell.chmod('a-rwx,u+rw', 'resources/chmod/file1');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/file1').mode & parseInt('600', 8),
    parseInt('600', 8)
  );
  result = shell.chmod('644', 'resources/chmod/file1');
  t.is(result.code, 0);
});

test('multiple symbolic modes #3', t => {
  let result = shell.chmod('a-rwx,u+rwx', 'resources/chmod/file1');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/file1').mode & parseInt('700', 8),
    parseInt('700', 8)
  );
  result = shell.chmod('644', 'resources/chmod/file1');
  t.is(result.code, 0);
});

test('No Test Title #20', t => {
  let result = shell.chmod('000', 'resources/chmod/file1');
  t.is(result.code, 0);
  result = shell.chmod('u+rw', 'resources/chmod/file1');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/file1').mode & parseInt('600', 8),
    parseInt('600', 8)
  );
  result = shell.chmod('644', 'resources/chmod/file1');
  t.is(result.code, 0);
});

test('No Test Title #21', t => {
  let result = shell.chmod('000', 'resources/chmod/file1');
  t.is(result.code, 0);
  result = shell.chmod('u+wx', 'resources/chmod/file1');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/file1').mode & parseInt('300', 8),
    parseInt('300', 8)
  );
  result = shell.chmod('644', 'resources/chmod/file1');
  t.is(result.code, 0);
});

test('No Test Title #22', t => {
  let result = shell.chmod('000', 'resources/chmod/file1');
  t.is(result.code, 0);
  result = shell.chmod('u+r,g+w,o+x', 'resources/chmod/file1');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/file1').mode & parseInt('421', 8),
    parseInt('421', 8)
  );
  result = shell.chmod('644', 'resources/chmod/file1');
  t.is(result.code, 0);
});

test('No Test Title #23', t => {
  let result = shell.chmod('000', 'resources/chmod/file1');
  t.is(result.code, 0);
  result = shell.chmod('u+rw,g+wx', 'resources/chmod/file1');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/file1').mode & parseInt('630', 8),
    parseInt('630', 8)
  );
  result = shell.chmod('644', 'resources/chmod/file1');
  t.is(result.code, 0);
});

test('No Test Title #24', t => {
  let result = shell.chmod('700', 'resources/chmod/file1');
  t.is(result.code, 0);
  result = shell.chmod('u-x,g+rw', 'resources/chmod/file1');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/file1').mode & parseInt('660', 8),
    parseInt('660', 8)
  );
  result = shell.chmod('644', 'resources/chmod/file1');
  t.is(result.code, 0);
});

test('No Test Title #25', t => {
  let result = shell.chmod('a-rwx,u+rw', 'resources/chmod/file1');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/file1').mode & parseInt('600', 8),
    parseInt('600', 8)
  );
  result = shell.chmod('a-rwx,u+rw', 'resources/chmod/file1');
  t.is(result.code, 0);
  t.is(
    fs.statSync('resources/chmod/file1').mode & parseInt('600', 8),
    parseInt('600', 8)
  );
  result = shell.chmod('644', 'resources/chmod/file1');
  t.is(result.code, 0);
});

test('No Test Title #26', t => {
  let result = shell.chmod('744', 'resources/chmod/xdir');
  t.is(result.code, 0);
  result = shell.chmod('644', 'resources/chmod/xdir/file');
  t.is(result.code, 0);
  result = shell.chmod('744', 'resources/chmod/xdir/deep');
  t.is(result.code, 0);
  result = shell.chmod('644', 'resources/chmod/xdir/deep/file');
  t.is(result.code, 0);
  result = shell.chmod('-R', 'a+X', 'resources/chmod/xdir');
  t.is(result.code, 0);
});

test('No Test Title #27', t => {
  t.is(
    fs.statSync('resources/chmod/xdir').mode & parseInt('755', 8),
    parseInt('755', 8)
  );
  t.is(
    fs.statSync('resources/chmod/xdir/file').mode & parseInt('644', 8),
    parseInt('644', 8)
  );
  t.is(
    fs.statSync('resources/chmod/xdir/deep').mode & parseInt('755', 8),
    parseInt('755', 8)
  );
  t.is(
    fs.statSync('resources/chmod/xdir/deep/file').mode & parseInt('644', 8),
    parseInt('644', 8)
  );
});
