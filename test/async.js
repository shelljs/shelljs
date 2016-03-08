var shell = require('..');

var assert = require('assert');
var fs = require('fs');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Valids
//

// no callback, but {async: true} makes it async
var c = shell.pwd({async: true});
assert.equal(shell.error(), null);
assert.equal(c, null);

// Callback implies async for cat()
shell.cat('resources/cat/file1', function(code, stdout, stderr) {
  assert.equal(code || 0, 0);
  assert.ok(!shell.error());
  assert.ok(!stderr);
  assert.equal(stdout, 'test1\n');
  shell.exit(123);

  // Callback implies async for cp()
  shell.cp('resources/file1', 'tmp', function(code, stdout) {
    assert.equal(code || 0, 0);
    assert.ok(!shell.error());
    assert.ok(fs.existsSync('tmp/file1'));
    assert.equal(stdout, '');
    shell.rm('-rf', 'tmp/*');

    // {async: true} + Callback implies async for ls()
    shell.ls('resources/ls', {async: true}, function(code, stdout) {
      assert.equal(code || 0, 0);
      assert.ok(!shell.error());
      assert.equal(stdout.indexOf('file1') > -1, true);
      assert.equal(stdout.indexOf('file2') > -1, true);
      assert.equal(stdout.indexOf('file1.js') > -1, true);
      assert.equal(stdout.indexOf('file2.js') > -1, true);
      assert.equal(stdout.indexOf('filename(with)[chars$]^that.must+be-escaped') > -1, true);
      assert.equal(stdout.indexOf('a_dir') > -1, true);
      assert.equal(stdout.length, 6);

      // Command with error also works for async
      // also, null is converted to something that makese sense
      shell.rm('tmp/filedoesntexist', function(code, stdout, stderr) {
        assert.ok(code > 0);
        assert.ok(shell.error());
        assert.ok(stderr);
        assert.equal(stdout, '');

        // boolean is converted to something that makes sense
        shell.test('-f', 'resources/file1.txt', function(code) {
          assert.equal(code, 0);
          assert.ok(!shell.error());

          shell.exit(123);
        });
      });
    });
  });
});
