// @
// @ ### wc([options,] file [, file ...])
// @ ### wc([options,] file_array)
// @ Available options:
// @ + `-m`: print the char counts 
// @ + `-l`: print the newline counts
// @ + `-w`: print the word counts (space delimited characters)
// @ 
// @ Examples:
// @
// @ ```javascript
// @ var counts = wc('file.txt'); //returns charCount lineCount wordCount
// @ var charCount = wc('-m','file.txt'); //returns number of characters
// @ var lineCount = wc('-l','file.txt'); //returns number of newlines
// @ var wordCount = wc('-w','file.txt'); //returns number of words 
// @ var countFiles = wc(['file1', 'file2']); //same as above
// @ ```
// @
// @ read the number of characters, lines and words in a file.

var common = require('./common');
var fs = require('fs');

common.register('wc', _wc, {
    canReceivePipe: true,
    cmdOptions: {
        'm': 'charCount',
        'l': 'lineCount',
        'w': 'wordCount',
        'c': 'byteCount',
    },
});

function getLines(data) {
    // data is the file contents
    var lines = data.split('\n'); // array

    if (lines[lines.length - 1] === '') {
        // in case it wanted to count an empty line at the bottom
        lines.pop();
    }

    return lines.length;
}

function getWords(data) {
    // there will be a difference from UNIX since UNIX wc connects
    // the chars on the left of a newline to the ones on the right,
    // counting them as part of the same space delimited 'word'

    var regexSplit = /\s/;
    var wordsInitial = data.split(regexSplit); // array

    var wordsList = wordsInitial.filter(function(word) {
        if (word !== '') return word;
    });

    return wordsList.length;
}

function getChars(data) {
    // in the case of a pipe, all we have is the string size
    // in the file loaded buffer, we have a byte array
    return data.length;
}

function getBytes(data) {

}


function _wc(options, files) {
    var wc = [];
    var pipe = common.readFromPipe();

    if (!files && !pipe) common.error('no paths given');

    var idx = 1;

    files = [].slice.call(arguments, idx);

    if (pipe) {
        files.unshift('-');
    }

    var totalLines = 0;
    var totalWords = 0;
    var totalChars = 0;
    var totalBytes = 0;

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

        var contents = file === '-' ? Buffer.from(pipe) : fs.readFileSync(file);
        // the contents are either a Buffer from pipe, or Buffer from fs
        /*
        'm': 'charCount',
        'l': 'lineCount',
        'w': 'wordCount',
        'b': 'byteCount',
        */

        var formattedOutput = '';
        var thisLines = getLines(contents);
        var thisWords = getWords(contents);
        var thisChars = getChars(contents);
        var thisBytes = getChars(contents);
        totalLines += thisLines;
        totalWords += thisWords;
        totalChars += thisChars;
        totalBytes += thisBytes;

        if (options.charCount || options.lineCount || options.wordCount || options.byteCount) {
            // modify wc accordingly

            if (options.lineCount) formattedOutput += thisLines;
            if (options.wordCount) formattedOutput += thisWords;
            if (options.charCount) formattedOutput += thisChars;
            if (options.byteCount) formattedOutput += thisBytes;
        } else {
            // get all variables! 
            formattedOutput += `${thisLines} ${thisWords} ${thisChars} ${thisBytes}`;
        }
        formattedOutput += ` ${file}`

        wc.push(formattedOutput);

    });

    if (files.length > 1) wc.push(`${totalLines} ${totalWords} ${totalChars} ${thisBytes} total\n`);

    return wc.join('\n');
}

module.exports = _wc;