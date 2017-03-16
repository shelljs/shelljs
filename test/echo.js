import test from 'ava';

import shell from '..';
import utils from './utils/utils';

shell.config.silent = true;

test.beforeEach(t => {
  t.context.tmp = utils.getTempDir();
});

test.afterEach.always(t => {
  shell.rm('-rf', t.context.tmp);
});

//
// Valids
//

test.cb('simple test with defaults', t => {
  const script = 'require(\'../global.js\'); echo("hello", "world");';
  utils.runScript(script, (err, stdout, stderr) => {
    t.falsy(err);
    t.is(stdout, 'hello world\n');
    t.is(stderr, '');
    t.end();
  });
});

test.cb('allow arguments to begin with a hyphen', t => {
  // see issue #20
  const script = 'require(\'../global.js\'); echo("-asdf", "111");';
  utils.runScript(script, (err, stdout, stderr) => {
    t.falsy(err);
    t.is(stdout, '-asdf 111\n');
    t.is(stderr, '');
    t.end();
  });
});

test.cb("using null as an explicit argument doesn't crash the function", t => {
  const script = 'require(\'../global.js\'); echo(null);';
  utils.runScript(script, (err, stdout, stderr) => {
    t.falsy(err);
    t.is(stdout, 'null\n');
    t.is(stderr, '');
    t.end();
  });
});

test.cb('simple test with silent(true)', t => {
  const script = 'require(\'../global.js\'); config.silent=true; echo(555);';
  utils.runScript(script, (err, stdout) => {
    t.falsy(err);
    t.is(stdout, '555\n');
    t.end();
  });
});

test.cb('-e option', t => {
  const script = "require('../global.js'); echo('-e', '\\tmessage');";
  utils.runScript(script, (err, stdout) => {
    t.falsy(err);
    t.is(stdout, '\tmessage\n');
    t.end();
  });
});

test.cb('piping to a file', t => {
  // see issue #476
  shell.mkdir(t.context.tmp);
  const tmp = `${t.context.tmp}/echo.txt`;
  const script = `require('../global.js'); echo('A').toEnd('${tmp}'); echo('B').toEnd('${tmp}');`;
  utils.runScript(script, (err, stdout) => {
    const result = shell.cat(tmp);
    t.falsy(err);
    t.is(stdout, 'A\nB\n');
    t.is(result.toString(), 'A\nB\n');
    t.end();
  });
});

test.cb('-n option', t => {
  const script = "require('../global.js'); echo('-n', 'message');";
  utils.runScript(script, (err, stdout) => {
    t.falsy(err);
    t.is(stdout, 'message');
    t.end();
  });
});

test.cb('-ne option', t => {
  const script = "require('../global.js'); echo('-ne', 'message');";
  utils.runScript(script, (err, stdout) => {
    t.falsy(err);
    t.is(stdout, 'message');
    t.end();
  });
});

test.cb('-en option', t => {
  const script = "require('../global.js'); echo('-en', 'message');";
  utils.runScript(script, (err, stdout) => {
    t.falsy(err);
    t.is(stdout, 'message');
    t.end();
  });
});

test.cb('-en option with escaped characters', t => {
  const script = "require('../global.js'); echo('-en', '\\tmessage\\n');";
  utils.runScript(script, (err, stdout) => {
    t.falsy(err);
    t.is(stdout, '\tmessage\n');
    t.end();
  });
});

test.cb('piping to a file with -n', t => {
  // see issue #476
  shell.mkdir(t.context.tmp);
  const tmp = `${t.context.tmp}/echo.txt`;
  const script = `require('../global.js'); echo('-n', 'A').toEnd('${tmp}'); echo('-n', 'B').toEnd('${tmp}');`;
  utils.runScript(script, (err, stdout) => {
    const result = shell.cat(tmp);
    t.falsy(err);
    t.is(stdout, 'AB');
    t.is(result.toString(), 'AB');
    t.end();
  });
});

test('stderr with unrecognized options is empty', t => {
  // TODO: console output here needs to be muted
  const result = shell.echo('-asdf');
  t.falsy(result.stderr);
  t.is(result.stdout, '-asdf\n');
});
