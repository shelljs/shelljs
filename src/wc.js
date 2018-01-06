/*  
    copy tail.sh as an example, and provide a similar function to wc.
    wc man page:http://man7.org/linux/man-pages/man1/wc.1.html
    (notes from man page)        
       wc - Print newline, word, and byte counts for each FILE, and a total line
       if more than one FILE is specified.  A word is a non-zero-length
       sequence of characters delimited by white space.
        -c, --bytes print the byte counts
        -m, --chars print the character counts
        -l, --lines print the newline counts
        --files0-from=F
                    read input from the files specified by NUL-terminated names in
                    file F; If F is - then read names from standard input
        -L, --max-line-length print the maximum display width
        -w, --words print the word counts
        --help display this help and exit
        --version output version information and exit
*/

var common = require('./common');
var fs = require('fs');

common.register('wc', _wc, {
    canReceivePipe: true,
    cmdOptions: {
        'c': 'byteCount',
        'l': 'lineCount',
        'w': 'wordCount',
    },
});

//@
//@ ### wc([options,] file [, file ...])
//@ ### wc([options,] file_array)
//@ Available options:
//@ + `-c`: print the byte counts (generally the number of characters)
//@ + `-l`: print the newline counts
//@ + `-w`: print the word counts (space delimited characters)
//@ 
//@ Examples:
//@
//@ ```javascript
//@ var counts = wc('file.txt'); //returns object {'c':byteCount,'l':lineCount,'w':wordCount}
//@ var byteCount = wc('-c','file.txt'); //returns integer number of bytes
//@ var lineCount = wc('-l','file.txt'); //returns integer number of newlines
//@ var wordCount = wc('-w','file.txt'); //returns integer number of words 
//@ var countFiles = wc('file1', 'file2'); // returns object {'file1':{'c':byteCount,'l':lineCount,'w':wordCount},
//@                                                           'file2':{'c':byteCount,'l':lineCount,'w':wordCount},
//@                                                           'total':lineCount,
//@                                                          }
//@ var countFiles = wc(['file1', 'file2']); //same as above
//@ ```
//@
//@ Read the end of a file.
function _wc(options, files) {
    var wc = {};
    var pipe = common.readFromPipe();

    if (!files && !pipe) common.error('no paths given');

    var idx = 1;
    if (options.byteCount === true) {
        idx = 2;
        options.numLines = Number(arguments[1]);
    } else if (options.numLines === false) {
        options.numLines = 10;
    }
    options.numLines = -1 * Math.abs(options.numLines);
    files = [].slice.call(arguments, idx);

    if (pipe) {
        files.unshift('-');
    }

    var shouldAppendNewline = false;
    files.forEach(function(file) {
        if (file !== '-') {
            if (!fs.existsSync(file)) {
                common.error('no such file or directory: ' + file, { continue: true });
                return;
            } else if (common.statFollowLinks(file).isDirectory()) {
                common.error("error reading '" + file + "': Is a directory", {
                    continue: true,
                });
                return;
            }
        }

        var contents = file === '-' ? pipe : fs.readFileSync(file, 'utf8');

        var lines = contents.split('\n');
        if (lines[lines.length - 1] === '') {
            lines.pop();
            shouldAppendNewline = true;
        } else {
            shouldAppendNewline = false;
        }

        tail = tail.concat(lines.slice(options.numLines));
    });

    if (shouldAppendNewline) {
        tail.push(''); // to add a trailing newline once we join
    }
    return tail.join('\n');
}
module.exports = _tail;