#!/usr/bin/env node
const cli = require('../src/cli');
const { execute } = require('../src');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));

function longest(arr) {
    let longest = 0;

    for(var i = 0; i < arr.length; i++){
        if(arr[i].length > longest){
            longest = arr[i].length;
        }      
    }

    return longest;
}

cli.getArgs(argv, (name, data) => {
    switch (name) {
        case 'run':
            if (typeof data === "object") {
                fs.readFile(`${data[1]}/${data[0]}`, 'ascii', (err, dat) => {
                    dat = String.raw`${dat}`.replace(/C7/g, '/'); // Make sure backslashes work, replace division sign
                    let arr = [parseInt(longest(dat.split(/\n/g))), dat.split(/\n/g).length];
                    execute(dat, arr);
                });
            } else {
                fs.readFile(data, 'ascii', (err, dat) => {
                    dat = String.raw`${dat}`.replace(/C7/g, '/');;
                    let arr = [parseInt(longest(dat.split(/\n/g))), dat.split(/\n/g).length];
                    execute(dat, arr);
                });
            }
      break;
    }
  });
  