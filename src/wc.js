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
    var lines = data.split('\n'); // array

    if (lines[lines.length - 1] === '') {
        //in case it wanted to count an empty line at the bottom
        lines.pop();
    }

    return lines.length;
}

function getWords(data) {



    var regexSplit = /\s/;
    var wordsInitial = data.split(regexSplit); //array

    var wordsList = wordsInitial.filter(function(word) {
        if (word !== '') return word;
    });

    return wordsList.length;
}

function getChars(data) {
    return data.length;
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
//@ var countFiles = wc('file1', 'file2'); // returns: lineCount wordCount charCount 'file1'\nlineCount wordCount charCount 'file2' \n totalLines totalWords totalChars 'total'
//@ var countFiles = wc(['file1', 'file2']); //same as above
//@ ```
//@
//@ Read the end of a file.
function _wc(options, files) {
    var wc = [];
    var pipe = common.readFromPipe();

    if (!files && !pipe) common.error('no paths given');

    var idx = 1;

    files = [].slice.call(arguments, idx);

    if (pipe) {
        files.unshift('-');
    }

    var moreThan1 = false;
    var totalLines = 0;
    var totalWords = 0;
    var totalChars = 0;
    if (files.length > 1) moreThan1 = true;
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

        var temp = '';
        var thisLines = getLines(contents);
        var thisWords = getWords(contents);
        var thisChars = getChars(contents);
        totalLines += thisLines;
        totalWords += thisWords;
        totalChars += thisChars;

        if (options.charCount || options.lineCount || options.wordCount) {
            //modify wc accordingly

            if (options.lineCount) temp += `${thisLines} `;
            if (options.wordCount) temp += `${thisWords} `;
            if (options.charCount) temp += `${thisChars} `;
        } else {
            //get all variables! 
            temp += `${thisLines} ${thisWords} ${thisChars}`;
        }
        temp += ` ${file}`

        wc.push(temp);

    });

    if (moreThan1) wc.push(`${totalLines} ${totalWords} ${totalChars} total`);

    return wc.join('\n');
}
module.exports = _wc;