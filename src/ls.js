var path = require('path');
var fs = require('fs');
var constants = require('constants');

var common = require('./common');
var _cd = require('./cd');
var _pwd = require('./pwd');


function classify(file)
{
  var S_IX = constants.S_IXUSR
           | constants.S_IXGRP
           | constants.S_IXOTH

  // Devices
  if(file.isBlockDevice())     return 'bd'
  if(file.isCharacterDevice()) return 'cd'

  // Straighforward types
  if(file.isDirectory()) return 'di'
//  if(file.isDoor())      return 'do'  // SolarisOS
  if(file.isFile())      return 'fi'
  if(file.isFIFO())      return 'pi'
  if(file.isSocket())    return 'so'

  // Simbolic links
  if(file.isSymbolicLink())
  {
    // ToDo: orphan and missing links
    return 'ln'
  }

  // Executable
  if(file.mode & S_IX) return 'ex'

  // By default, return 'file' class
  return 'fi'
}

function lsColor(str, type)
{
  var colors = {}

  process.env['LS_COLORS'].split(':')
  .forEach(function(color)
  {
    color = color.split('=')

    var key = color[0]
    if(key[0] == '*')
       key = key.substr(1);

    colors[key] = color[1]
  })

  // Get color from extension
  var color = colors[path.extname(str)]
  if(color)
    return '\x1b['+color+'m' + str + '\x1b[0m'

  // Get color from filetype
  var color = colors[type]
  if(color)
    return '\x1b['+color+'m' + str + '\x1b[0m'

  // Unknown file, default color
  return str
}


//@
//@ ### ls([options ,] path [,path ...])
//@ ### ls([options ,] path_array)
//@ Available options:
//@
//@ + `-l`: long list format
//@ + `-C`: classify
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
function _ls(options, paths) {
  options = common.parseOptions(options, {
    'l': 'long',
    'C': 'classify',
    'R': 'recursive',
    'A': 'all',
    'a': 'all_deprecated'
  });

  if (options.all_deprecated) {
    // We won't support the -a option as it's hard to image why it's useful
    // (it includes '.' and '..' in addition to '.*' files)
    // For backwards compatibility we'll dump a deprecated message and proceed as before
    common.log('ls: Option -a is deprecated. Use -A instead');
    options.all = true;
  }

  if (!paths)
    paths = ['.'];
  else if (typeof paths === 'object')
    paths = paths; // assume array
  else if (typeof paths === 'string')
    paths = [].slice.call(arguments, 1);

  var list = [];

  // Conditionally pushes file to list - returns true if pushed, false otherwise
  // (e.g. prevents hidden files to be included unless explicitly told so)
  function pushFile(file, query) {
    // hidden file?
    if (path.basename(file.name)[0] === '.') {
      // not explicitly asking for hidden files?
      if (!options.all && !(path.basename(query)[0] === '.' && path.basename(query).length > 1))
        return false;
    }

    if (common.platform === 'win')
      file.name = file.name.replace(/\\/g, '/');

    list.push(file);
    return true;
  }

  paths.forEach(function(p) {
    if (fs.existsSync(p)) {
      var stats = fs.lstatSync(p);

      // Simple file?
      if (stats.isFile()) {
        stats.name = p;
        pushFile(stats, p);
        return; // continue
      }

      // Simple dir?
      if (stats.isDirectory()) {
        // Iterate over p contents
        fs.readdirSync(p).forEach(function(file) {
          var stats = fs.lstatSync(p + '/' + file);
          stats.name = file;

          if (!pushFile(stats, p))
            return;

          // Recursive?
          if (options.recursive) {
            var oldDir = _pwd();
            _cd('', p);
            if (stats.isDirectory())
              list = list.concat(_ls('-R'+(options.all?'A':''), file+'/*'));
            _cd('', oldDir);
          }
        });
        return; // continue
      }
    }

    // p does not exist - possible wildcard present

    var basename = path.basename(p);
    var dirname = path.dirname(p);
    // Wildcard present on an existing dir? (e.g. '/tmp/*.js')
    if (basename.search(/\*/) > -1 && fs.existsSync(dirname) && fs.lstatSync(dirname).isDirectory) {
      // Escape special regular expression chars
      var regexp = basename.replace(/(\^|\$|\(|\)|<|>|\[|\]|\{|\}|\.|\+|\?)/g, '\\$1');
      // Translates wildcard into regex
      regexp = '^' + regexp.replace(/\*/g, '.*') + '$';
      // Iterate over directory contents
      fs.readdirSync(dirname).forEach(function(file) {
        if (file.match(new RegExp(regexp))) {
          var pp = dirname + '/' + file;
          var stats = fs.lstatSync(pp);
          stats.name = path.normalize(pp);

          if (!pushFile(stats, basename))
            return;

          // Recursive?
          if (options.recursive) {
            if (fs.lstatSync(pp).isDirectory())
              list = list.concat(_ls('-R'+(options.all?'A':''), pp+'/*'));
          } // recursive
        } // if file matches
      }); // forEach
      return;
    }

    common.error('no such file or directory: ' + p, true);
  });

  function inspect(depth) {
    return this.map(function(file)
    {
      var type = classify(file)

      var result = '';

      // Long list
      if(options.long)
      {
        result += file.mode+' '+file.nlink              +' '+
               file.uid +' '+file.gid                   +' '+
               file.size+' '+file.mtime.toLocaleString()+' '
      }

      // Color
      result += lsColor(file.name, type)

      // Classify
      if(options.classify)
        switch(type)
        {
          case 'di': result += '/'; break;
//          case 'do': result += '>'; break;
          case 'ex': result += '*'; break;
          case 'li': result += '@'; break;
          case 'pi': result += '|'; break;
          case 'so': result += '='; break;
        }

      return result
    }).join('\n')
  }
  Object.defineProperty(list, 'inspect', {value: inspect});

  return list;
}
module.exports = _ls;
