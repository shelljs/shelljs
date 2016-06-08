var common = require('./common');
var fs = require('fs');

//add c spaces to the left of str
function lpad(c, str){
    var res = "" + str;
    if(res.length < c){
        res = Array((c-res.length)+1).join(" ") + res;
    }
    return res;
}

//@
//@ ### uniq([options,] [input, [output]])
//@ Available options:
//@
//@ + `-i`: Ignore differences in case when comparing
//@ + `-c`: Prefix lines by the number of occurrences
//@ + `-d`: Only print duplicate lines, one for each group
//@
//@ Examples:
//@
//@ ```javascript
//@ uniq('foo.txt');
//@ uniq('-i', 'foo.txt');
//@ uniq('-cd', 'foo.txt', 'bar.txt');
//@ ```
//@
//@ Filter adjacent matching lines from input
function _uniq(options, input, output) {
  options = common.parseOptions(options, {
    'i': 'ignoreCase',
    'c': 'count',
    'd': 'duplicates'
  });

  // Check if this is coming from a pipe
  var pipe = common.readFromPipe(this);

  if (!input && !pipe)
    common.error('no input given');

  var lines = (input ? fs.readFileSync(input, 'utf8') : pipe).
              trimRight().
              split(/\r*\n/);

  //Perform a run-length encoding of the lines
  var uniqed = [{count: 1, ln: lines[0]}];
  lines.slice(1).forEach(function(line){
    var cmp = options.ignoreCase ? 
                line.toLocaleLowerCase().localeCompare(uniqed[uniqed.length-1].ln.toLocaleLowerCase()) :
                line.localeCompare(uniqed[uniqed.length-1].ln);
    if(cmp !== 0){
      uniqed.push({count: 1, ln: line});
    }else{
      uniqed[uniqed.length - 1].count++;
    }
  });
  uniqed = uniqed.
             //Do we want only duplicated objects?
             filter(function(obj){return options.duplicates ? obj.count > 1 : true;}).
             //Are we tracking the counts of each line?
             map(function(obj){return (options.count ? (lpad(7,obj.count) + " ") : "") + obj.ln;}).
             join('\n') + '\n';

  var res = new common.ShellString(uniqed, common.state.error, common.state.errorCode);
  if(output){
    res.to(output);
    //if uniq writes to output, nothing is passed to the next command in the pipeline (if any)
    return new common.ShellString('', common.state.error, common.state.errorCode);
  }else{
    return res;
  }
}

module.exports = _uniq;
