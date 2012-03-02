# Shell.js - Unix shell commands for Node.js [![Build Status](https://secure.travis-ci.org/arturadib/shell.js.png)](http://travis-ci.org/arturadib/shell.js)

**Why?** Because you want a portable (Windows included) solution to your shell scripts, and you're already familiar with Unix shell commands. No dependencies other than Node.js. No asynchronous callback hell. Just good old shell scripting.

Shell.js is [unit-tested](http://travis-ci.org/arturadib/shell.js) and battle-tested at Mozilla's [pdf.js](http://github.com/mozilla/pdf.js).


### Example

```javascript
require('shell/global');

// Copy files to release dir

mkdir('-p', 'out/Release');
cp('-R', 'lib/*.js', 'out/Release');

// Replace macros in each .js file

cd('lib');
for (file in ls('*.js')) {
  sed('-i', 'BUILD_VERSION', 'v0.1.2', file);
  sed('-i', /.*REMOVE_THIS_LINE.*\n/, '', file);
  sed('-i', /.*REPLACE_LINE_WITH_MACRO.*\n/, cat('macro.js'), file);
}
cd('..');

// Run external tool synchronously

if (exec('git commit -am "Auto-commit"').code !== 0) {
  echo('Error: Git commit failed');
  exit(1);
}
```

See also `scripts/` for real-life examples.


<!-- 

  DO NOT MODIFY BEYOND THIS POINT - IT'S AUTOMATICALLY GENERATED

-->


# API reference


#### cd('dir')
Changes to directory `dir` for the duration of the script

#### shell.pwd()
Returns the current directory.

#### ls([options] [,path] [,path ...])
Available options:

+ `-R`: recursive
+ `-a`: all files (include files beginning with `.`)

Examples:

```javascript
ls('projs/*.js');
ls('-R', '/users/me', '/tmp');
```

Returns list of files in the given path, or in current directory if no path provided.
For convenient iteration via `for (file in ls())`, the format returned is a hash object:
`{ 'file1':null, 'dir1/file2':null, ...}`.

#### cp('[options ,] source [,source ...] , dest')
Available options:

+ `-f`: force
+ `-r, -R`: recursive

Examples:

```javascript
cp('file1', 'dir1');
cp('-Rf', '/tmp/*', '/usr/local/*', '/home/tmp');
```

Copies files. The wildcard `*` is accepted.

#### rm([options ,] file [, file ...])
Available options:

+ `-f`: force
+ `-r, -R`: recursive

Examples:

```javascript
rm('some_file.txt', 'another_file.txt');
rm('-rf', '/tmp/*');
```

Removes files. The wildcard `*` is accepted. 

#### mv(source [, source ...], dest')
Available options:

+ `f`: force

Moves files. The wildcard `*` is accepted.

#### mkdir([options ,] dir [, dir ...]')
Available options:

+ `p`: full path (will create intermediate dirs if necessary)

Examples:

```javascript
mkdir('-p', '/tmp/a/b/c/d');
```

Creates directories.

#### cat(file [, file ...]')

Examples:

```javascript
var str = cat('file*.txt');
```

Returns a string containing the given file, or a concatenated string
containing the files if more than one file is given (a new line character is
introduced between each file). Wildcard `*` accepted.

#### 'string'.to(file)

Examples:

```javascript
cat('input.txt').to('output.txt');
```

Analogous to the redirection operator `>` in Unix, but works with JavaScript strings (such as
those returned by `cat`, `grep`, etc). _Like Unix redirections, `to()` will overwrite any existing file!_

#### sed([options ,] search_regex, replace_str, file)
Available options:

+ `-i`: Replace contents of 'file' in-place. _Note that no backups will be created!_

Examples:

```javascript
sed('-i', 'PROGRAM_VERSION', 'v0.1.3', 'source.js');
sed(/.*DELETE_THIS_LINE.*\n/, '', 'source.js');
```

Reads an input string from `file` and performs a JavaScript `replace()` on the input
using the given search regex and replacement string. Returns the new string after replacement.

#### grep(regex_filter, file [, file ...]')

Examples:

```javascript
grep('GLOBAL_VARIABLE', '*.js');
```

Reads input string from given files and returns a string containing all lines of the 
file that match the given `regex_filter`. Wildcard `*` accepted.

#### which(command)

Examples:

```javascript
var nodeExec = which('node');
```

Searches for `command` in the system's PATH. On Windows looks for `.exe`, `.cmd`, and `.bat` extensions.
Returns string containing the absolute path to the command.

#### echo(string [,string ...])

Examples:

```javascript
echo('hello world');
var str = echo('hello world');
```

Prints string to stdout, and returns string with additional utility methods
like `.to()`.

#### exit(code)
Exits the current process with the given exit code.

#### env['VAR_NAME']
Object containing environment variables (both getter and setter). Shortcut to process.env.

#### exec(command [, options] [, callback])
Available options (all `false` by default):

+ `async`: Asynchronous execution. Needs callback.
+ `silent`: Do not echo program output to console.

Examples:

```javascript
var version = exec('node --version', {silent:true}).output;
```

Executes the given `command` _synchronously_, unless otherwise specified. 
When in synchronous mode returns the object `{ code:..., output:... }`, containing the program's 
`output` (stdout + stderr)  and its exit `code`. Otherwise the `callback` gets the 
arguments `(code, output)`.

## Non-Unix commands


#### tempdir()
Searches and returns string containing a writeable, platform-dependent temporary directory.
Follows Python's [tempfile algorithm](http://docs.python.org/library/tempfile.html#tempfile.tempdir).

#### exists(path [, path ...])
Returns true if all the given paths exist.

#### error()
Tests if error occurred in the last command. Returns `null` if no error occurred,
otherwise returns string explaining the error

#### verbose()
Enables all output (default)

#### silent()
Suppresses all output, except for explict `echo()` calls
