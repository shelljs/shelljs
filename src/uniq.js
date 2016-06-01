var common = require('./common');
var fs = require('fs');

//@
//@ ### uniq([options,] [input, [output]])
//@ Available options:
//@
//@ + `-i`: Ignore differences in case when comparing
//@
//@ Examples:
//@
//@ ```javascript
//@ uniq('foo.txt');
//@ uniq('-i', 'foo.txt');
//@ uniq('-i', 'foo.txt', 'bar.txt');
//@ ```
//@
//@ Filter adjacent matching lines from input
function _uniq(options, input, output) {
  options = common.parseOptions(options, {
    'i': 'ignoreCase'
  });

  // Check if this is coming from a pipe
  var pipe = common.readFromPipe(this);

  if (!input && !pipe)
    common.error('no input given');

  var lines = (input ? fs.readFileSync(input, 'utf8') : pipe).
              trimRight().
              split(/\r*\n/);

  var uniqed = lines.slice(0,1);
  lines.slice(1).forEach(function(line){
      var cmp = options.ignoreCase ? 
                  line.toLocaleLowerCase().localeCompare(uniqed[uniqed.length-1].toLocaleLowerCase()) :
                  line.localeCompare(uniqed[uniqed.length-1]);
      if(cmp !== 0){
          uniqed.push(line);
      }
  });
  var res = new common.ShellString(uniqed.join('\n') + '\n', common.state.error, common.state.errorCode);
  if(output){
      res.to(output);
  }else{
      return res;
  }
}

module.exports = _uniq;
