#!/usr/bin/env node
setTimeout(function() {
    console.log('slow');
}, parseInt(process.argv[2], 10));
