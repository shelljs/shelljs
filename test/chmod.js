import fs from 'fs';

import test from 'ava';

import shell from '..';
import common from '../src/common';
import utils from './utils/utils';

let TMP;
const BITMASK = parseInt('777', 8);

test.before(() => {
  TMP = utils.getTempDir();
  shell.cp('-r', 'test/resources', TMP);
  shell.config.silent = true;
});

test.after(() => {
  shell.rm('-rf', TMP);
});

//
// Invalids
//

test('invalid permissions', t => {
  let result = shell.chmod('blah');
  t.truthy(shell.error());
  t.is(result.code, 1);
  result = shell.chmod('893', `${TMP}/chmod`); // invalid permissions - mode must be in octal
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('Basic usage with octal codes', t => {
  utils.skipOnWin(t, () => {
    let result = shell.chmod('755', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
    t.is(
      common.statFollowLinks(`${TMP}/chmod/file1`).mode & BITMASK,
      parseInt('755', 8)
    );
    result = shell.chmod('644', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
    t.is(
      common.statFollowLinks(`${TMP}/chmod/file1`).mode & BITMASK,
      parseInt('644', 8)
    );
  });
});

test('symbolic mode', t => {
  utils.skipOnWin(t, () => {
    let result = shell.chmod('o+x', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
    t.is(
      common.statFollowLinks(`${TMP}/chmod/file1`).mode & parseInt('007', 8),
      parseInt('005', 8)
    );
    result = shell.chmod('644', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
  });
});

test('symbolic mode, without group', t => {
  utils.skipOnWin(t, () => {
    let result = shell.chmod('+x', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
    t.is(
      common.statFollowLinks(`${TMP}/chmod/file1`).mode & BITMASK,
      parseInt('755', 8)
    );
    result = shell.chmod('644', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
  });
});

test('Test setuid', t => {
  utils.skipOnWin(t, () => {
    let result = shell.chmod('u+s', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
    t.is(
      common.statFollowLinks(`${TMP}/chmod/file1`).mode & parseInt('4000', 8),
      parseInt('4000', 8)
    );
    result = shell.chmod('u-s', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
    t.is(
      common.statFollowLinks(`${TMP}/chmod/file1`).mode & BITMASK,
      parseInt('644', 8)
    );

    // according to POSIX standards at http://linux.die.net/man/1/chmod,
    // setuid is never cleared from a directory unless explicitly asked for.
    result = shell.chmod('u+s', `${TMP}/chmod/c`);

    t.is(result.code, 0);
    result = shell.chmod('755', `${TMP}/chmod/c`);
    t.is(result.code, 0);
    t.is(
      common.statFollowLinks(`${TMP}/chmod/c`).mode & parseInt('4000', 8),
      parseInt('4000', 8)
    );
    result = shell.chmod('u-s', `${TMP}/chmod/c`);
    t.is(result.code, 0);
  });
});

test('Test setgid', t => {
  utils.skipOnWin(t, () => {
    let result = shell.chmod('g+s', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
    t.is(
      common.statFollowLinks(`${TMP}/chmod/file1`).mode & parseInt('2000', 8),
      parseInt('2000', 8)
    );
    result = shell.chmod('g-s', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
    t.is(
      common.statFollowLinks(`${TMP}/chmod/file1`).mode & BITMASK,
      parseInt('644', 8)
    );
  });
});

test('Test sticky bit', t => {
  utils.skipOnWin(t, () => {
    let result = shell.chmod('+t', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
    t.is(
      common.statFollowLinks(`${TMP}/chmod/file1`).mode & parseInt('1000', 8),
      parseInt('1000', 8)
    );
    result = shell.chmod('-t', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
    t.is(
      common.statFollowLinks(`${TMP}/chmod/file1`).mode & BITMASK,
      parseInt('644', 8)
    );
    t.is(common.statFollowLinks(`${TMP}/chmod/file1`).mode & parseInt('1000', 8), 0);
  });
});

test('Test directories', t => {
  utils.skipOnWin(t, () => {
    let result = shell.chmod('a-w', `${TMP}/chmod/b/a/b`);
    t.is(result.code, 0);
    t.is(
      common.statFollowLinks(`${TMP}/chmod/b/a/b`).mode & BITMASK,
      parseInt('555', 8)
    );
    result = shell.chmod('755', `${TMP}/chmod/b/a/b`);
    t.is(result.code, 0);
  });
});

test('Test recursion', t => {
  utils.skipOnWin(t, () => {
    let result = shell.chmod('-R', 'a+w', `${TMP}/chmod/b`);
    t.is(result.code, 0);
    t.is(
      common.statFollowLinks(`${TMP}/chmod/b/a/b`).mode & BITMASK,
      BITMASK
    );
    result = shell.chmod('-R', '755', `${TMP}/chmod/b`);
    t.is(result.code, 0);
    t.is(
      common.statFollowLinks(`${TMP}/chmod/b/a/b`).mode & BITMASK,
      parseInt('755', 8)
    );
  });
});

test('Test symbolic links w/ recursion  - WARNING: *nix only', t => {
  utils.skipOnWin(t, () => {
    fs.symlinkSync(`${TMP}/chmod/b/a`, `${TMP}/chmod/a/b/c/link`, 'dir');
    let result = shell.chmod('-R', 'u-w', `${TMP}/chmod/a/b`);
    t.is(result.code, 0);
    t.is(
      common.statFollowLinks(`${TMP}/chmod/a/b/c`).mode & parseInt('700', 8),
      parseInt('500', 8)
    );
    t.is(
      common.statFollowLinks(`${TMP}/chmod/b/a`).mode & parseInt('700', 8),
      parseInt('700', 8)
    );
    result = shell.chmod('-R', 'u+w', `${TMP}/chmod/a/b`);
    t.is(result.code, 0);
    fs.unlinkSync(`${TMP}/chmod/a/b/c/link`);
  });
});

test('Test combinations', t => {
  let result = shell.chmod('a-rwx', `${TMP}/chmod/file1`);
  t.is(result.code, 0);
  t.is(
    common.statFollowLinks(`${TMP}/chmod/file1`).mode & parseInt('000', 8),
    parseInt('000', 8)
  );
  result = shell.chmod('644', `${TMP}/chmod/file1`);
  t.is(result.code, 0);
});

test('multiple symbolic modes', t => {
  let result = shell.chmod('a-rwx,u+r', `${TMP}/chmod/file1`);
  t.is(result.code, 0);
  t.is(
    common.statFollowLinks(`${TMP}/chmod/file1`).mode & parseInt('400', 8),
    parseInt('400', 8)
  );
  result = shell.chmod('644', `${TMP}/chmod/file1`);
  t.is(result.code, 0);
});

test('multiple symbolic modes #2', t => {
  let result = shell.chmod('a-rwx,u+rw', `${TMP}/chmod/file1`);
  t.is(result.code, 0);
  t.is(
    common.statFollowLinks(`${TMP}/chmod/file1`).mode & parseInt('600', 8),
    parseInt('600', 8)
  );
  result = shell.chmod('644', `${TMP}/chmod/file1`);
  t.is(result.code, 0);
});

test('multiple symbolic modes #3', t => {
  utils.skipOnWin(t, () => {
    let result = shell.chmod('a-rwx,u+rwx', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
    t.is(
      common.statFollowLinks(`${TMP}/chmod/file1`).mode & parseInt('700', 8),
      parseInt('700', 8)
    );
    result = shell.chmod('644', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
  });
});

test('u+rw', t => {
  let result = shell.chmod('000', `${TMP}/chmod/file1`);
  t.is(result.code, 0);
  result = shell.chmod('u+rw', `${TMP}/chmod/file1`);
  t.is(result.code, 0);
  t.is(
    common.statFollowLinks(`${TMP}/chmod/file1`).mode & parseInt('600', 8),
    parseInt('600', 8)
  );
  result = shell.chmod('644', `${TMP}/chmod/file1`);
  t.is(result.code, 0);
});

test('u+wx', t => {
  utils.skipOnWin(t, () => {
    let result = shell.chmod('000', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
    result = shell.chmod('u+wx', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
    t.is(
      common.statFollowLinks(`${TMP}/chmod/file1`).mode & parseInt('300', 8),
      parseInt('300', 8)
    );
    result = shell.chmod('644', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
  });
});

test('Multiple symbolic modes at once', t => {
  utils.skipOnWin(t, () => {
    let result = shell.chmod('000', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
    result = shell.chmod('u+r,g+w,o+x', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
    t.is(
      common.statFollowLinks(`${TMP}/chmod/file1`).mode & parseInt('421', 8),
      parseInt('421', 8)
    );
    result = shell.chmod('644', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
  });
});

test('u+rw,g+wx', t => {
  utils.skipOnWin(t, () => {
    let result = shell.chmod('000', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
    result = shell.chmod('u+rw,g+wx', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
    t.is(
      common.statFollowLinks(`${TMP}/chmod/file1`).mode & parseInt('630', 8),
      parseInt('630', 8)
    );
    result = shell.chmod('644', `${TMP}/chmod/file1`);
    t.is(result.code, 0);
  });
});

test('u-x,g+rw', t => {
  let result = shell.chmod('700', `${TMP}/chmod/file1`);
  t.is(result.code, 0);
  result = shell.chmod('u-x,g+rw', `${TMP}/chmod/file1`);
  t.is(result.code, 0);
  t.is(
    common.statFollowLinks(`${TMP}/chmod/file1`).mode & parseInt('660', 8),
    parseInt('660', 8)
  );
  result = shell.chmod('644', `${TMP}/chmod/file1`);
  t.is(result.code, 0);
});

test('a-rwx,u+rw', t => {
  let result = shell.chmod('a-rwx,u+rw', `${TMP}/chmod/file1`);
  t.is(result.code, 0);
  t.is(
    common.statFollowLinks(`${TMP}/chmod/file1`).mode & parseInt('600', 8),
    parseInt('600', 8)
  );
  result = shell.chmod('a-rwx,u+rw', `${TMP}/chmod/file1`);
  t.is(result.code, 0);
  t.is(
    common.statFollowLinks(`${TMP}/chmod/file1`).mode & parseInt('600', 8),
    parseInt('600', 8)
  );
  result = shell.chmod('644', `${TMP}/chmod/file1`);
  t.is(result.code, 0);
});

test('Numeric modes', t => {
  let result = shell.chmod('744', `${TMP}/chmod/xdir`);
  t.is(result.code, 0);
  result = shell.chmod('644', `${TMP}/chmod/xdir/file`);
  t.is(result.code, 0);
  result = shell.chmod('744', `${TMP}/chmod/xdir/deep`);
  t.is(result.code, 0);
  result = shell.chmod('644', `${TMP}/chmod/xdir/deep/file`);
  t.is(result.code, 0);
  result = shell.chmod('-R', 'a+X', `${TMP}/chmod/xdir`);
  t.is(result.code, 0);
});

test('Make sure chmod succeeds for a variety of octal codes', t => {
  utils.skipOnWin(t, () => {
    t.is(
      common.statFollowLinks(`${TMP}/chmod/xdir`).mode & parseInt('755', 8),
      parseInt('755', 8)
    );
    t.is(
      common.statFollowLinks(`${TMP}/chmod/xdir/file`).mode & parseInt('644', 8),
      parseInt('644', 8)
    );
    t.is(
      common.statFollowLinks(`${TMP}/chmod/xdir/deep`).mode & parseInt('755', 8),
      parseInt('755', 8)
    );
    t.is(
      common.statFollowLinks(`${TMP}/chmod/xdir/deep/file`).mode & parseInt('644', 8),
      parseInt('644', 8)
    );
  });
});
