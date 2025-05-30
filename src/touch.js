var fs = require('fs');
var common = require('./common');

common.register('touch', _touch, {
  cmdOptions: {
    'a': 'atime_only',
    'c': 'no_create',
    'd': 'date',
    'm': 'mtime_only',
    'r': 'reference',
  },
});

//@
//@ ### touch([options,] file [, file ...])
//@ ### touch([options,] file_array)
//@
//@ Available options:
//@
//@ + `-a`: Change only the access time
//@ + `-c`: Do not create any files
//@ + `-m`: Change only the modification time
//@ + `{'-d': someDate}`, `{date: someDate}`: Use a `Date` instance (ex. `someDate`)
//@   instead of current time
//@ + `{'-r': file}`, `{reference: file}`: Use `file`'s times instead of current
//@   time
//@
//@ Examples:
//@
//@ ```javascript
//@ touch('source.js');
//@ touch('-c', 'path/to/file.js');
//@ touch({ '-r': 'referenceFile.txt' }, 'path/to/file.js');
//@ touch({ '-d': new Date('December 17, 1995 03:24:00'), '-m': true }, 'path/to/file.js');
//@ touch({ date: new Date('December 17, 1995 03:24:00') }, 'path/to/file.js');
//@ ```
//@
//@ Update the access and modification times of each file to the current time.
//@ A file argument that does not exist is created empty, unless `-c` is supplied.
//@ This is a partial implementation of
//@ [`touch(1)`](http://linux.die.net/man/1/touch). Returns a
//@ [ShellString](#shellstringstr) indicating success or failure.
function _touch(opts, files) {
  if (!files) {
    common.error('no files given');
  } else if (typeof files === 'string') {
    files = [].slice.call(arguments, 1);
  } else {
    common.error('file arg should be a string file path or an Array of string file paths');
  }

  files.forEach(function (f) {
    touchFile(opts, f);
  });
  return '';
}

function touchFile(opts, file) {
  var stat = tryStatFile(file);

  if (stat && stat.isDirectory()) {
    // don't error just exit
    return;
  }

  // if the file doesn't already exist and the user has specified --no-create then
  // this script is finished
  if (!stat && opts.no_create) {
    return;
  }

  // open the file and then close it. this will create it if it doesn't exist but will
  // not truncate the file
  fs.closeSync(fs.openSync(file, 'a'));

  //
  // Set timestamps
  //

  // setup some defaults
  var now = new Date();
  var mtime = opts.date || now;
  var atime = opts.date || now;

  // use reference file
  if (opts.reference) {
    var refStat = tryStatFile(opts.reference);
    if (!refStat) {
      common.error('failed to get attributess of ' + opts.reference);
    }
    mtime = refStat.mtime;
    atime = refStat.atime;
  } else if (opts.date) {
    mtime = opts.date;
    atime = opts.date;
  }

  if (opts.atime_only && opts.mtime_only) {
    // keep the new values of mtime and atime like GNU
  } else if (opts.atime_only) {
    mtime = stat.mtime;
  } else if (opts.mtime_only) {
    atime = stat.atime;
  }

  fs.utimesSync(file, atime, mtime);
}

module.exports = _touch;

function tryStatFile(filePath) {
  try {
    return common.statFollowLinks(filePath);
  } catch (e) {
    return null;
  }
}
