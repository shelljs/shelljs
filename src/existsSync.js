var fs = require('fs');
var path = require('path');

module.exports = fs.existsSync || path.existsSync;
