const fs = require('fs');
const os = require('os');
const path = require('path');

const test = require('ava');

const shell = require('..');
const common = require('../src/common');

shell.config.silent = true;

//
// Invalids
//

test('no args', t => {
  const result = shell.head();
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('file does not exist', t => {
  t.falsy(fs.existsSync('/asdfasdf')); // sanity check
  const result = shell.head('/asdfasdf'); // file does not exist
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, 'head: no such file or directory: /asdfasdf');
});

test('directory', t => {
  t.truthy(common.statFollowLinks('test/resources/').isDirectory()); // sanity check
  const result = shell.head('test/resources/');
  t.truthy(shell.error());
  t.is(result.code, 1);
  t.is(result.stderr, "head: error reading 'test/resources/': Is a directory");
});

//
// Valids
//

const topOfFile1 = ['file1 1', 'file1 2', 'file1 3', 'file1 4', 'file1 5',
                    'file1 6', 'file1 7', 'file1 8', 'file1 9', 'file1 10',
                    'file1 11', 'file1 12', 'file1 13', 'file1 14', 'file1 15',
                    'file1 16', 'file1 17', 'file1 18', 'file1 19', 'file1 20'];
const topOfFile2 = ['file2 1', 'file2 2', 'file2 3', 'file2 4', 'file2 5',
                    'file2 6', 'file2 7', 'file2 8', 'file2 9', 'file2 10',
                    'file2 11', 'file2 12', 'file2 13', 'file2 14', 'file2 15',
                    'file2 16', 'file2 17', 'file2 18', 'file2 19', 'file2 20'];

test('simple', t => {
  const result = shell.head('test/resources/head/file1.txt');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), topOfFile1.slice(0, 10).join('\n') + '\n');
});

function writeInput(t, contents) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'shelljs-head-'));
  t.teardown(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, 'input');
  fs.writeFileSync(file, contents);
  return file;
}

['é', '€', '😀'].forEach(character => {
  for (let split = 1; split < Buffer.byteLength(character); split++) {
    [false, true].forEach(trailingNewline => {
      test(`UTF-8 ${character} split after byte ${split}, trailing newline ${trailingNewline}`, t => {
        const oldBufLength = shell.config.bufLength;
        shell.config.bufLength = 8;
        t.teardown(() => { shell.config.bufLength = oldBufLength; });
        const firstLine = 'a'.repeat(8 - split) + character;
        const contents = firstLine + (trailingNewline ? '\nsecond\n' : '');
        const result = shell.head({ '-n': 1 }, writeInput(t, contents));
        t.is(result.code, 0);
        t.is(result.stdout, firstLine + (trailingNewline ? '\n' : ''));
      });
    });
  }
});

test('UTF-8 crossing the default buffer boundary', t => {
  const firstLine = 'a'.repeat(shell.config.bufLength - 1) + 'é';
  const result = shell.head({ '-n': 1 }, writeInput(t, firstLine + '\nsecond\n'));
  t.is(result.code, 0);
  t.is(result.stdout, firstLine + '\n');
});

test('UTF-8 with one-byte read buffers', t => {
  const oldBufLength = shell.config.bufLength;
  shell.config.bufLength = 1;
  t.teardown(() => { shell.config.bufLength = oldBufLength; });
  const result = shell.head({ '-n': 1 }, writeInput(t, 'é€😀\nsecond\n'));
  t.is(result.code, 0);
  t.is(result.stdout, 'é€😀\n');
});

test('incomplete UTF-8 at end of file is replaced', t => {
  const contents = Buffer.from([0x61, 0xe2, 0x82]);
  const result = shell.head({ '-n': 1 }, writeInput(t, contents));
  t.is(result.code, 0);
  t.is(result.stdout, contents.toString('utf8'));
});

test('UTF-8 decoder state is not shared across files', t => {
  const first = writeInput(t, Buffer.from([0xe2]));
  const second = writeInput(t, 'second\n');
  const result = shell.head({ '-n': 1 }, first, second);
  t.is(result.code, 0);
  t.is(result.stdout, '\ufffd\nsecond\n');
});

test('multiple files', t => {
  const result = shell.head('test/resources/head/file2.txt',
    'test/resources/head/file1.txt');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), topOfFile2
    .slice(0, 10)
    .concat(topOfFile1.slice(0, 10))
    .join('\n') + '\n');
});

test('multiple files, array syntax', t => {
  const result = shell.head(['test/resources/head/file2.txt',
    'test/resources/head/file1.txt']);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), topOfFile2
    .slice(0, 10)
    .concat(topOfFile1.slice(0, 10))
    .join('\n') + '\n');
});

test('reading more lines than are in the file (no trailing newline)', t => {
  const result = shell.head('test/resources/file2', 'test/resources/file1');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), 'test2\ntest1'); // these files only have one line (no \n)
});

test('reading more lines than are in the file (with trailing newline)', t => {
  const result = shell.head('test/resources/head/shortfile2',
    'test/resources/head/shortfile1');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), 'short2\nshort1\n'); // these files only have one line (with \n)
});

test('Globbed file', t => {
  const result = shell.head('test/resources/head/file?.txt');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), topOfFile1
    .slice(0, 10)
    .concat(topOfFile2.slice(0, 10))
    .join('\n') + '\n');
});

test("With '-n <num>' option", t => {
  const result = shell.head('-n', 4, 'test/resources/head/file2.txt',
    'test/resources/head/file1.txt');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), topOfFile2
    .slice(0, 4)
    .concat(topOfFile1.slice(0, 4))
    .join('\n') + '\n');
});

test("With '{-n: <num>}' option", t => {
  const result = shell.head({ '-n': 4 }, 'test/resources/head/file2.txt',
    'test/resources/head/file1.txt');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), topOfFile2
    .slice(0, 4)
    .concat(topOfFile1.slice(0, 4))
    .join('\n') + '\n');
});

test('negative values (-num) are the same as (numLines - num)', t => {
  const result = shell.head('-n', -46, 'test/resources/head/file1.txt');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), 'file1 1\nfile1 2\nfile1 3\nfile1 4\n');
});

test('right-hand side of a pipe', t => {
  const result = shell.cat('test/resources/head/file1.txt').head();
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.toString(), topOfFile1.slice(0, 10).join('\n') + '\n');
});
