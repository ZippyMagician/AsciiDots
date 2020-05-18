class CellMap {
    constructor(code, size) {//, warps) {
        this.dimension = size;
        this.input = code;
        //this.warps = warps;

        this.hash = {
            tiles: [],
            dot_pos: [],
            get: function getTileFromXAndY(x, y) {
                for (var i in this.tiles) {
                    if (this.tiles[i].x === x && this.tiles[i].y === y) return this.tiles[i];
                }
                return false;
            },
            set: function setTileBlank(x, y, obj) {
                for (var i in this.tiles) {
                    if (this.tiles[i].x === x && this.tiles[i].y === y) {
                        this.tiles[i] = obj;
                        return true;
                    }
                }
                return false;
            },
            __init_dots__: function dotInit() {
                for (var i in this.tiles) {
                    if (this.tiles[i].dots > 0) this.dot_pos.push(this.tiles[i]);
                }
            }/*,
            warps: warps*/
        };
        
        this.hash = this.parse(this.init(this.dimension), this.input);

        return this.hash;
    }

    init(size) {
        let width = size[0];
        let height = size[1];

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                let obj = {
                    x: x, 
                    y: y,
                    dots: [],
                    op: ""
                }
                this.hash.tiles.push(obj);
            }
        }

        return this.hash;
    }

    parse(map, input) {
        let code = input.replace(/\r/g, '').split()[0].split(/\n/g).map(r => r.length < this.dimension[0] ? r + (' '.repeat(this.dimension[0] - r.length - 1)) : r);
        for (var y = 0; y < code.length; y++) {
            for (var x = 0; x < this.dimension[0]; x++) {
                //console.log(code, x, y);
                //console.log(map.tiles);
                let obj = map.get(x, y);
                obj.op = code[y][x];
                obj.dots = obj.op === "." ? 1 : new Array(2);
                if(map.set(x, y, obj)) {} else throw new Error("Error encountered during the hashing of the tilemap");
            }
        }
        map.__init_dots__();
        return map;
    }
}

module.exports = CellMap;