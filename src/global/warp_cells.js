const CellMap = require('../cellmap');
const WarpMap = require('../warpmap');
const globalIndex = require('../');

module.exports.maps = {};

module.exports.createGlobalWarp = (file, size) => {
    module.exports.maps[file] = new CellMap(file, size, new WarpMap(file, size));
    globalIndex.exportCounter -= 1;
}