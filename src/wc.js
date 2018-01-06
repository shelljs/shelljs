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
        'm': 'charCount',
        'l': 'lineCount',
        'w': 'wordCount',
    },
});

function getLines(data) {
    //data is the file contents
    var lines = data.split('\n').length; //int is size of array
    return lines.toString();
}

function getWords(data) {
    var wordsInitial = data.split(' '); //array

    while (wordsInitial.indexOf('') !== -1) {
        //with words, cut out any blanks enumerated
        wordsInitial.splice(wordsInitial.indexOf(''), 1);
    }
    return wordsInitial.length.toString();
}

function getChars(data) {
    return data.length.toString();
}

//@
//@ ### wc([options,] file [, file ...])
//@ ### wc([options,] file_array)
//@ Available options:
//@ + `-m`: print the char counts 
//@ + `-l`: print the newline counts
//@ + `-w`: print the word counts (space delimited characters)
//@ 
//@ Examples:
//@
//@ ```javascript
//@ var counts = wc('file.txt'); //returns charCount lineCount wordCount
//@ var charCount = wc('-m','file.txt'); //returns number of characters
//@ var lineCount = wc('-l','file.txt'); //returns number of newlines
//@ var wordCount = wc('-w','file.txt'); //returns number of words 
//@ var countFiles = wc('file1', 'file2'); // returns 'file1' charCount lineCount wordCount\n'file2' charCount lineCount wordCount\n'total' lineCount
//@ var countFiles = wc(['file1', 'file2']); //same as above
//@ ```
//@
//@ Read the end of a file.
function _wc(options, files) {
    var wc = [];
    var pipe = common.readFromPipe();

    if (!files && !pipe) common.error('no paths given');

    var idx = 1;

    /*  - from tail.js, which I'm using as a template. Not sure I need this section
            - so each file will get the options applied to it?

        if (options.numLines === true) {
            idx = 2;
            options.numLines = Number(arguments[1]);
        } else if (options.numLines === false) {
            options.numLines = 10;
        }
        options.numLines = -1 * Math.abs(options.numLines);

    */

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
        /*
        'm': 'charCount',
        'l': 'lineCount',
        'w': 'wordCount',
        */
        var temp;
        if (files.length === 1) {
            //then not including filename in the result
        } else {
            //include filename in result:
            temp = `${file.toString()} `;
        }

        if (options.charCount || options.lineCount || options.wordCount) {
            //modify wc accordingly
            if (options.charCount) temp += `${getChars(contents)} `;
            if (options.lineCount) temp += `${getLines(contentsfile)} `;
            if (options.wordCount) temp += `${getWords(contents)} `;
        } else {
            //get all variables! 
            temp += `${getChars(contents)} ${getLines(contents)} ${getWords(contents)}`;
        }

        wc.push(temp);

    });

    //joins seperate file output into big string
    return wc.join('\n');
}
module.exports = _wc;