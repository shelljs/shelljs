var assert = require('assert');
var child = require('child_process');
var shell = require('..');

function exec(str, cb) {
  return child.exec('node bin/' + str, { stdio: 'inherit' }, cb);
}

// Missing command
exec('shx', function(err, stdout, stderr) {
  assert.equal(err.code, 1);
  assert.equal(stdout, 'Usage: shx <command> [options]\n\n');
  assert.equal(stderr, 'ShellJS: missing command\n');
});

// Command not found
exec('shx not-a-command', function(err, stdout, stderr) {
  assert.equal(err.code, 1);
  assert.equal(stdout, 'Usage: shx <command> [options]\n\n');
  assert.equal(stderr, 'ShellJS: command not found (not-a-command)\n');
});

// Valid Command
exec('shx ls test/tmp', function(err, stdout, stderr) {
  assert.equal(err, null);
  assert.ok(stdout);
  assert.equal(stderr, '');
});

// Does not double print 'echo' output
exec('shx echo "measure twice"', function(err, stdout, stderr) {
  assert.equal(err, null);
  assert.equal(stdout, 'measure twice\n');
  assert.equal(stderr, '');
});

// Exit codes pass through
exec('shx exit 0', function(err) {
  assert.equal(err, null);
}).on('close', function(code) {
  assert.equal(code, '0');
});

exec('shx exit 1', function(err) {
  assert.equal(err.code, 1);
}).on('close', function(code) {
  assert.equal(code, '1');
});

exec('shx exit 99', function(err) {
  assert.equal(err.code, 99);
}).on('close', function(code) {
  assert.equal(code, '99');
});

shell.exit(123);
