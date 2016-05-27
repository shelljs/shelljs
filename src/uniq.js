var common = require('./common');
var fs = require('fs');

//@
//@ ### uniq([options,] file)
//@ Available options:
//@
//@ + `-i`: Ignore differences in case when comparing
//@
//@ Examples:
//@
//@ ```javascript
//@ uniq('foo.txt');
//@ uniq('-i', 'foo.txt');
//@ ```
//@
//@ Filter adjacent matching lines from input
function _uniq(options, input) {
  options = common.parseOptions(options, {
    'i': 'ignoreCase'
  });

  // Check if this is coming from a pipe
  var pipe = common.readFromPipe(this);

  if (!input && !pipe)
    common.error('no input given');
  if(input && pipe)
      common.error('too many inputs')

  if (pipe)
    files.unshift('-');

  var lines = (pipe ? pipe : fs.readFileSync(input, 'utf8')).
              trimRight().
              split(/\r*\n/);

  var uniqed = [];
  lines.forEach(function(line){
      var cmp = options.ignoreCase ? 
                  line.toLocaleLowerCase().localeCompare(uniqed[-1].toLocaleLowerCase()) :
                  line.localeCompare(uniqed[-1]);
      if(cmp !== 0)uniqed.push(line)
  });

  return new common.ShellString(uniqed.join('\n'), common.state.error, common.state.errorCode);
}

module.exports = _uniq;
