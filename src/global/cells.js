// A global set of cells for dots to work from

// Will be set in the index upon initializing
module.exports.tiles = {}

module.exports.get = function getTileFromXAndY(x, y) {
    for (var i in this.tiles) {
        if (this.tiles[i].x === x && this.tiles[i].y === y) return this.tiles[i];
    }
    
    return false;
}

module.exports.set = function setTileFromXAndY(x, y, obj) {
    for (var i in this.tiles) {
        if (this.tiles[i].x === x && this.tiles[i].y === y) {
            this.tiles[i] = obj;
            return true;
        }
    }

    return false;
}