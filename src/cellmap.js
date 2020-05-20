class CellMap {
    constructor(code, size, warps) {
        this.dimension = size;
        this.input = code;

        this.warps = warps;
        this.tiles = [];
        this.dot_pos = [];
        
        this._parse(this._init(this.dimension));

        return this.hash;
    }

    get(x, y) {
        for (var i in this.tiles) {
            if (this.tiles[i].x === x && this.tiles[i].y === y) {
                return this.tiles[i];
            }
        }
        return false;
    }

    set(x, y, obj) {
        for (var i in this.tiles) {
            if (this.tiles[i].x === x && this.tiles[i].y === y) {
                this.tiles[i] = obj;
                return true;
            }
        }
        return false;
    }

    _init_dots() {
        for (var i in this.tiles) {
            if (this.tiles[i].dots > 0) this.dot_pos.push(this.tiles[i]);
        }
    }

    _init(size) {
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
                this.tiles.push(obj);
            }
        }
    }

    _parse() {
        let code = this.warps.newInp.replace(/\r/g, '').split()[0].split(/\n/g).map(r => r.length < this.dimension[0] ? r + (' '.repeat(this.dimension[0] - r.length - 1)) : r);
        
        for (var y = 0; y < code.length; y++) {
            for (var x = 0; x < this.dimension[0]; x++) {
                let obj = this.get(x, y);
                obj.op = code[y][x];
                obj.dots = obj.op === "." ? 1 : new Array(2);
                try { this.set(x, y, obj) } catch (e) { console.log(e) }
            }
        }
        this._init_dots();
    }
}

module.exports = CellMap;