var $ = require('..'),
    path = require('path');

var README = $.cat('../packages/shelljs/README.md').toString();

$.ls(__dirname + '/../packages/*/README.md').sort().forEach(function(file) {
    if (path.basename(path.resolve(file, '..')) === 'shelljs') return;
    README += $.cat(file).split('\n## Usage')[1];
});

new $.ShellString(README).to(path.resolve(__dirname, '..', 'README.md'));
