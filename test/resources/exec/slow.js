#!/usr/bin/env node
console.log('fast');
setTimeout(function() {
    console.log('slow');
}, parseInt(process.argv[2], 10));
