const CellMap = require('./cellmap');
const globalWarp = require('./global/warp_cells');
const fs = require('fs');

function longest(arr) {
    let longest = 0;

    for(var i = 0; i < arr.length; i++){
        if(arr[i].length > longest){
            longest = arr[i].length;
        }      
    }

    return longest;
}

module.exports = class WarpMapper {
    constructor(input, size, file = false) {
        this.input = input;
        this.newInp = null;
        this.size = size;
        this.fileName = file;

        this.hWarps = [];
        this.nWarps = [];
        this.iWarps = [];
        
        this._cacheWarps();

        // I know this will result in a circular object (since this is also in a CellMap.hash.warps) but I'm too lazy to fix this
        this.cached_map = new CellMap(this.newInp, size, this);
    }

    _cacheWarps() {
        let inp = this.input.replace(/\r/g, '').split('\n').filter(item => !item.startsWith('``')).map(item => item.replace(/(\`\`.+)/g, ''));
        let length = 0;

        for (let item of inp) {
            if (item.startsWith('%')) {
                length++;
                switch(item.substr(0, 2)) {
                    case '%^':
                        this.hWarps.push(item[2]);
                        break;
                    case '%$':
                        for (let ch of [...item.substr(2)]) this.nWarps.push(ch);
                        break;
                    case '%!':
                        this._getImportData(item.split(' ')[0].substr(2)).then(data => {
                            this.iWarps.push({data: data, name: item.split(' ')[1]});
                        });
                        break;
                    default:
                        length--;
                        break;
                }
            }
        }

        for (let i = 0; i < length; i++) inp.shift();
        this.newInp = inp.join('\n');
    }

    isWarp(op) {
        return this.nWarps.indexOf(op) > -1;
    }

    isHomeWarp(op) {
        return this.hWarps.indexOf(op) > -1;
    }

    isImportWarp(op) {
        for (let item of this.iWarps) {
            if (item.name === op) return true;
        }
        return false;
    }

    find(op, sx = -1, sy = -1) {
        let map = this.cached_map;
        let opts = [];

        for (let y = 0; y < this.size[1]; y++) {
            for (let x = 0; x < this.size[0]; x++) {
                if (map.get(x, y).op && map.get(x, y).op === op) opts.push(map.get(x, y));
            }
        }

        return opts.filter(item => item.x !== sx || (item.x === sx && item.y !== sy))[0];
    }

    _getImportData(file) {
        return new Promise((resolve, reject) => {
            if (file.indexOf('/') > -1) {
                fs.readFile(file, 'ascii', (err, dat) => {
                    if (err) return reject(err);
                    dat = String.raw`${dat}`.replace(/C7/g, '/');;
                    let arr = [parseInt(longest(dat.split(/\n/g))), dat.split(/\n/g).length];
                    let wMap = new WarpMapper(dat, arr);

                    globalWarp.createGlobalWarp(file, arr);
    
                    return resolve([new CellMap(dat, arr, wMap), wMap.find(wMap.hWarps[0]).x, wMap.find(wMap.hWarps[0]).y]);
                });
            } else {
                fs.readFile(__dirname + "/libs/" + file, 'ascii', (err, dat) => {
                    if (err) return reject(err);
                    dat = String.raw`${dat}`.replace(/C7/g, '/');
                    let arr = [parseInt(longest(dat.split(/\n/g))), dat.split(/\n/g).length];
                    let wMap = new WarpMapper(dat, arr, file);

                    globalWarp.createGlobalWarp(file, arr);
                    
                    return resolve([new CellMap(dat, arr, wMap), wMap.find(wMap.hWarps[0]).x, wMap.find(wMap.hWarps[0]).y]);
                });
            }
        });
    }

    getImport(op) {
        return this.iWarps.filter(item => item.name === op)[0].data;
    }
}