var common = require('./common');
var fs = require('fs');

//@
//@ ### sed([options,] search_regex, replacement, file [, file ...])
//@ ### sed([options,] search_regex, replacement, file_array)
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
//@ Reads an input string from `files` and performs a JavaScript `replace()` on the input
//@ using the given search regex and replacement string or function. Returns the new string after replacement.
function _sed(options, regex, replacement, files) {
  options = common.parseOptions(options, {
    'i': 'inplace'
  });

  // Check if this is coming from a pipe
  var pipe = common.readFromPipe(this);

  if (typeof replacement === 'string' || typeof replacement === 'function')
    replacement = replacement; // no-op
  else if (typeof replacement === 'number')
    replacement = replacement.toString(); // fallback
  else
    common.error('invalid replacement string');

  // Convert all search strings to RegExp
  if (typeof regex === 'string')
    regex = RegExp(regex);

  if (!files && !pipe)
    common.error('no files given');

  files = [].slice.call(arguments, 3);

  if (pipe)
    files.unshift('-');

  var sed = [];
  files.forEach(function(file) {
    if (!fs.existsSync(file) && file !== '-') {
      common.error('no such file or directory: ' + file, 2, true);
      return;
    }

    var contents = file === '-' ? pipe : fs.readFileSync(file, 'utf8');
    var lines = contents.split(/\r*\n/);
    var result = lines.map(function (line) {
      return line.replace(regex, replacement);
    }).join('\n');

    sed.push(result);

    if (options.inplace)
      fs.writeFileSync(file, result, 'utf8');
  });

  return new common.ShellString(sed.join('\n'), common.state.error, common.state.errorCode);
}
module.exports = _sed;
