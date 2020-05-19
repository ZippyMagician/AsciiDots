const CellMap = require('../cellmap');
const WarpMap = require('../warpmap');

module.exports.maps = {};

module.exports.createGlobalWarp = (file, size) => {
    module.exports.maps[file] = new CellMap(file, size, new WarpMap(file, size));
}