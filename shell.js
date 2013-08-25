//
// ShellJS
// Unix shell commands on top of Node's API
//
// Copyright (c) 2012 Artur Adib
// http://github.com/arturadib/shelljs
//

var fs = require('fs');
var path = require('path');
fs.existsSync = fs.existsSync || path.existsSync; // shim for < v0.7

var common = require('./src/common');


//@
//@ All commands run synchronously, unless otherwise stated.
//@


//@
//@ ### cd('dir')
//@ Changes to directory `dir` for the duration of the script
var _cd = require('./src/cd');
exports.cd = common.wrap('cd', _cd);

//@
//@ ### pwd()
//@ Returns the current directory.
var _pwd = require('./src/pwd');
exports.pwd = common.wrap('pwd', _pwd);


//@
//@ ### ls([options ,] path [,path ...])
//@ ### ls([options ,] path_array)
//@ Available options:
//@
//@ + `-R`: recursive
//@ + `-A`: all files (include files beginning with `.`, except for `.` and `..`)
//@
//@ Examples:
//@
//@ ```javascript
//@ ls('projs/*.js');
//@ ls('-R', '/users/me', '/tmp');
//@ ls('-R', ['/users/me', '/tmp']); // same as above
//@ ```
//@
//@ Returns array of files in the given path, or in current directory if no path provided.
var _ls = require('./src/ls');
exports.ls = common.wrap('ls', _ls);


//@
//@ ### find(path [,path ...])
//@ ### find(path_array)
//@ Examples:
//@
//@ ```javascript
//@ find('src', 'lib');
//@ find(['src', 'lib']); // same as above
//@ find('.').filter(function(file) { return file.match(/\.js$/); });
//@ ```
//@
//@ Returns array of all files (however deep) in the given paths.
//@
//@ The main difference from `ls('-R', path)` is that the resulting file names
//@ include the base directories, e.g. `lib/resources/file1` instead of just `file1`.
var _find = require('./src/find');
exports.find = common.wrap('find', _find);


//@
//@ ### cp([options ,] source [,source ...], dest)
//@ ### cp([options ,] source_array, dest)
//@ Available options:
//@
//@ + `-f`: force
//@ + `-r, -R`: recursive
//@
//@ Examples:
//@
//@ ```javascript
//@ cp('file1', 'dir1');
//@ cp('-Rf', '/tmp/*', '/usr/local/*', '/home/tmp');
//@ cp('-Rf', ['/tmp/*', '/usr/local/*'], '/home/tmp'); // same as above
//@ ```
//@
//@ Copies files. The wildcard `*` is accepted.
var _cp = require('./src/cp');
exports.cp = common.wrap('cp', _cp);

//@
//@ ### rm([options ,] file [, file ...])
//@ ### rm([options ,] file_array)
//@ Available options:
//@
//@ + `-f`: force
//@ + `-r, -R`: recursive
//@
//@ Examples:
//@
//@ ```javascript
//@ rm('-rf', '/tmp/*');
//@ rm('some_file.txt', 'another_file.txt');
//@ rm(['some_file.txt', 'another_file.txt']); // same as above
//@ ```
//@
//@ Removes files. The wildcard `*` is accepted.
var _rm = require('./src/rm');
exports.rm = common.wrap('rm', _rm);

//@
//@ ### mv(source [, source ...], dest')
//@ ### mv(source_array, dest')
//@ Available options:
//@
//@ + `f`: force
//@
//@ Examples:
//@
//@ ```javascript
//@ mv('-f', 'file', 'dir/');
//@ mv('file1', 'file2', 'dir/');
//@ mv(['file1', 'file2'], 'dir/'); // same as above
//@ ```
//@
//@ Moves files. The wildcard `*` is accepted.
var _mv = require('./src/mv');
exports.mv = common.wrap('mv', _mv);

//@
//@ ### mkdir([options ,] dir [, dir ...])
//@ ### mkdir([options ,] dir_array)
//@ Available options:
//@
//@ + `p`: full path (will create intermediate dirs if necessary)
//@
//@ Examples:
//@
//@ ```javascript
//@ mkdir('-p', '/tmp/a/b/c/d', '/tmp/e/f/g');
//@ mkdir('-p', ['/tmp/a/b/c/d', '/tmp/e/f/g']); // same as above
//@ ```
//@
//@ Creates directories.
var _mkdir = require('./src/mkdir');
exports.mkdir = common.wrap('mkdir', _mkdir);

//@
//@ ### test(expression)
//@ Available expression primaries:
//@
//@ + `'-b', 'path'`: true if path is a block device
//@ + `'-c', 'path'`: true if path is a character device
//@ + `'-d', 'path'`: true if path is a directory
//@ + `'-e', 'path'`: true if path exists
//@ + `'-f', 'path'`: true if path is a regular file
//@ + `'-L', 'path'`: true if path is a symboilc link
//@ + `'-p', 'path'`: true if path is a pipe (FIFO)
//@ + `'-S', 'path'`: true if path is a socket
//@
//@ Examples:
//@
//@ ```javascript
//@ if (test('-d', path)) { /* do something with dir */ };
//@ if (!test('-f', path)) continue; // skip if it's a regular file
//@ ```
//@
//@ Evaluates expression using the available primaries and returns corresponding value.
var _test = require('./src/test');
exports.test = common.wrap('test', _test);


//@
//@ ### cat(file [, file ...])
//@ ### cat(file_array)
//@
//@ Examples:
//@
//@ ```javascript
//@ var str = cat('file*.txt');
//@ var str = cat('file1', 'file2');
//@ var str = cat(['file1', 'file2']); // same as above
//@ ```
//@
//@ Returns a string containing the given file, or a concatenated string
//@ containing the files if more than one file is given (a new line character is
//@ introduced between each file). Wildcard `*` accepted.
var _cat = require('./src/cat');
exports.cat = common.wrap('cat', _cat);

//@
//@ ### 'string'.to(file)
//@
//@ Examples:
//@
//@ ```javascript
//@ cat('input.txt').to('output.txt');
//@ ```
//@
//@ Analogous to the redirection operator `>` in Unix, but works with JavaScript strings (such as
//@ those returned by `cat`, `grep`, etc). _Like Unix redirections, `to()` will overwrite any existing file!_
var _to = require('./src/to');
String.prototype.to = common.wrap('to', _to);

//@
//@ ### sed([options ,] search_regex, replace_str, file)
//@ Available options:
//@
//@ + `-i`: Replace contents of 'file' in-place. _Note that no backups will be created!_
//@
//@ Examples:
//@
//@ ```javascript
//@ sed('-i', 'PROGRAM_VERSION', 'v0.1.3', 'source.js');
//@ sed(/.*DELETE_THIS_LINE.*\n/, '', 'source.js');
//@ ```
//@
//@ Reads an input string from `file` and performs a JavaScript `replace()` on the input
//@ using the given search regex and replacement string. Returns the new string after replacement.
var _sed = require('./src/sed');
exports.sed = common.wrap('sed', _sed);

//@
//@ ### grep([options ,] regex_filter, file [, file ...])
//@ ### grep([options ,] regex_filter, file_array)
//@ Available options:
//@
//@ + `-v`: Inverse the sense of the regex and print the lines not matching the criteria.
//@
//@ Examples:
//@
//@ ```javascript
//@ grep('-v', 'GLOBAL_VARIABLE', '*.js');
//@ grep('GLOBAL_VARIABLE', '*.js');
//@ ```
//@
//@ Reads input string from given files and returns a string containing all lines of the
//@ file that match the given `regex_filter`. Wildcard `*` accepted.
var _grep = require('./src/grep');
exports.grep = common.wrap('grep', _grep);


//@
//@ ### which(command)
//@
//@ Examples:
//@
//@ ```javascript
//@ var nodeExec = which('node');
//@ ```
//@
//@ Searches for `command` in the system's PATH. On Windows looks for `.exe`, `.cmd`, and `.bat` extensions.
//@ Returns string containing the absolute path to the command.
var _which = require('./src/which');
exports.which = common.wrap('which', _which);

//@
//@ ### echo(string [,string ...])
//@
//@ Examples:
//@
//@ ```javascript
//@ echo('hello world');
//@ var str = echo('hello world');
//@ ```
//@
//@ Prints string to stdout, and returns string with additional utility methods
//@ like `.to()`.
var _echo = require('./src/echo');
exports.echo = _echo; // don't common.wrap() as it could parse '-options'

//@
//@ ### dirs([options | '+N' | '-N'])
//@
//@ Available options:
//@
//@ + `-c`: Clears the directory stack by deleting all of the elements.
//@
//@ Arguments:
//@
//@ + `+N`: Displays the Nth directory (counting from the left of the list printed by dirs when invoked without options), starting with zero.
//@ + `-N`: Displays the Nth directory (counting from the right of the list printed by dirs when invoked without options), starting with zero.
//@
//@ Display the list of currently remembered directories. Returns an array of paths in the stack, or a single path if +N or -N was specified.
//@
//@ See also: pushd, popd
var _dirs = require('./src/dirs').dirs;
exports.dirs = common.wrap("dirs", _dirs);

//@
//@ ### pushd([options,] [dir | '-N' | '+N'])
//@
//@ Available options:
//@
//@ + `-n`: Suppresses the normal change of directory when adding directories to the stack, so that only the stack is manipulated.
//@
//@ Arguments:
//@
//@ + `dir`: Makes the current working directory be the top of the stack, and then executes the equivalent of `cd dir`.
//@ + `+N`: Brings the Nth directory (counting from the left of the list printed by dirs, starting with zero) to the top of the list by rotating the stack.
//@ + `-N`: Brings the Nth directory (counting from the right of the list printed by dirs, starting with zero) to the top of the list by rotating the stack.
//@
//@ Examples:
//@
//@ ```javascript
//@ // process.cwd() === '/usr'
//@ pushd('/etc'); // Returns /etc /usr
//@ pushd('+1');   // Returns /usr /etc
//@ ```
//@
//@ Save the current directory on the top of the directory stack and then cd to `dir`. With no arguments, pushd exchanges the top two directories. Returns an array of paths in the stack.
var _pushd = require('./src/dirs').pushd;
exports.pushd = common.wrap('pushd', _pushd);

//@
//@ ### popd([options,] ['-N' | '+N'])
//@
//@ Available options:
//@
//@ + `-n`: Suppresses the normal change of directory when removing directories from the stack, so that only the stack is manipulated.
//@
//@ Arguments:
//@
//@ + `+N`: Removes the Nth directory (counting from the left of the list printed by dirs), starting with zero.
//@ + `-N`: Removes the Nth directory (counting from the right of the list printed by dirs), starting with zero.
//@
//@ Examples:
//@
//@ ```javascript
//@ echo(process.cwd()); // '/usr'
//@ pushd('/etc');       // '/etc /usr'
//@ echo(process.cwd()); // '/etc'
//@ popd();              // '/usr'
//@ echo(process.cwd()); // '/usr'
//@ ```
//@
//@ When no arguments are given, popd removes the top directory from the stack and performs a cd to the new top directory. The elements are numbered from 0 starting at the first directory listed with dirs; i.e., popd is equivalent to popd +0. Returns an array of paths in the stack.
var _popd = require('./src/dirs').popd;
exports.popd = common.wrap("popd", _popd);

//@
//@ ### exit(code)
//@ Exits the current process with the given exit code.
exports.exit = process.exit;

//@
//@ ### env['VAR_NAME']
//@ Object containing environment variables (both getter and setter). Shortcut to process.env.
exports.env = process.env;

//@
//@ ### exec(command [, options] [, callback])
//@ Available options (all `false` by default):
//@
//@ + `async`: Asynchronous execution. Defaults to true if a callback is provided.
//@ + `silent`: Do not echo program output to console.
//@
//@ Examples:
//@
//@ ```javascript
//@ var version = exec('node --version', {silent:true}).output;
//@
//@ var child = exec('some_long_running_process', {async:true});
//@ child.stdout.on('data', function(data) {
//@   /* ... do something with data ... */
//@ });
//@
//@ exec('some_long_running_process', function(code, output) {
//@   console.log('Exit code:', code);
//@   console.log('Program output:', output);
//@ });
//@ ```
//@
//@ Executes the given `command` _synchronously_, unless otherwise specified.
//@ When in synchronous mode returns the object `{ code:..., output:... }`, containing the program's
//@ `output` (stdout + stderr)  and its exit `code`. Otherwise returns the child process object, and
//@ the `callback` gets the arguments `(code, output)`.
//@
//@ **Note:** For long-lived processes, it's best to run `exec()` asynchronously as
//@ the current synchronous implementation uses a lot of CPU. This should be getting
//@ fixed soon.
var _exec = require('./src/exec');
exports.exec = common.wrap('exec', _exec, {notUnix:true});


//@
//@ ### chmod(octal_mode || octal_string, file)
//@ ### chmod(symbolic_mode, file)
//@
//@ Available options:
//@
//@ + `-v`: output a diagnostic for every file processed//@
//@ + `-c`: like verbose but report only when a change is made//@
//@ + `-R`: change files and directories recursively//@
//@
//@ Examples:
//@
//@ ```javascript
//@ chmod(755, '/Users/brandon');
//@ chmod('755', '/Users/brandon'); // same as above
//@ chmod('u+x', '/Users/brandon');
//@ ```
//@
//@ Alters the permissions of a file or directory by either specifying the
//@ absolute permissions in octal form or expressing the changes in symbols.
//@ This command tries to mimic the POSIX behavior as much as possible.
//@ Notable exceptions:
//@
//@ + In symbolic modes, 'a-r' and '-r' are identical.  No consideration is
//@   given to the umask.
//@ + There is no "quiet" option since default behavior is to run silent.
var _chmod = require('./src/chmod');
exports.chmod = common.wrap('chmod', _chmod);






//@
//@ ## Configuration
//@

exports.config = common.config;

//@
//@ ### config.silent
//@ Example:
//@
//@ ```javascript
//@ var silentState = config.silent; // save old silent state
//@ config.silent = true;
//@ /* ... */
//@ config.silent = silentState; // restore old silent state
//@ ```
//@
//@ Suppresses all command output if `true`, except for `echo()` calls.
//@ Default is `false`.

//@
//@ ### config.fatal
//@ Example:
//@
//@ ```javascript
//@ config.fatal = true;
//@ cp('this_file_does_not_exist', '/dev/null'); // dies here
//@ /* more commands... */
//@ ```
//@
//@ If `true` the script will die on errors. Default is `false`.




//@
//@ ## Non-Unix commands
//@


//@
//@ ### tempdir()
//@ Searches and returns string containing a writeable, platform-dependent temporary directory.
//@ Follows Python's [tempfile algorithm](http://docs.python.org/library/tempfile.html#tempfile.tempdir).
var _tempDir = require('./src/tempdir');
exports.tempdir = common.wrap('tempdir', _tempDir);


//@
//@ ### error()
//@ Tests if error occurred in the last command. Returns `null` if no error occurred,
//@ otherwise returns string explaining the error
var _error = require('./src/error');
exports.error = _error;
