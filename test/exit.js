const test = require('ava');

const shell = require('..');

const mocks = require('./utils/mocks');

//
// Valids
//

function runExitInSubprocess(code) {
  const script = code !== undefined
    ? `var shell = require("."); shell.exit(${code});`
    : 'var shell = require("."); shell.exit();';
  const result = shell.exec(
      `${JSON.stringify(shell.config.execPath)} -e ${JSON.stringify(script)}`
  );
  const actualReturnCode = result.code;
  return actualReturnCode;
}

test('exit with success status code', t => {
  t.is(runExitInSubprocess(0), 0);
});

test('exit without explicit code should be success', t => {
  t.is(runExitInSubprocess(), 0);
});

test('exit with failure status code', t => {
  t.is(runExitInSubprocess(5), 5);
  t.is(runExitInSubprocess(2), 2);
  t.is(runExitInSubprocess(25), 25);
});

test('exit correctly sets the shell.errorCode()', t => {
  try {
    mocks.exit.init();
    shell.exit(5); // Safe to call shell.exit() because it's mocked.
    t.is(shell.errorCode(), 5);
    t.is(mocks.exit.getValue(), 5);
    t.truthy(shell.error());

    shell.exit(0); // Safe to call shell.exit() because it's mocked.
    t.is(shell.errorCode(), 0);
    t.falsy(mocks.exit.getValue());
    t.falsy(shell.error());

    // Also try it without an explicit argument.
    shell.exit(); // Safe to call shell.exit() because it's mocked.
    t.is(shell.errorCode(), 0);
    t.falsy(mocks.exit.getValue());
    t.falsy(shell.error());
  } finally {
    mocks.exit.restore();
  }
});
