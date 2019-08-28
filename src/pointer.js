const parser = require('./parser');

class Pointer {
    constructor (parent, map) {
        this.dot = parent;
        this.map = map;

        this.delete = false;

        this.value;
        this.address;

        this.x = this.dot.x;
        this.y = this.dot.y;

        this.dir = this.findDir();
    }

    findDir() {
        let x = this.x;
        let y = this.y;

        if (this.map.get(x - 1, y) && this.map.get(x - 1, y).op === "-") return 0;
        if (this.map.get(x, y - 1) && this.map.get(x, y - 1).op === "|") return 1;
        if (this.map.get(x + 1, y) && this.map.get(x + 1, y).op === "-") return 2;
        if (this.map.get(x, y + 1) && this.map.get(x, y + 1).op === "|") return 3;

        throw new Error("No valid dot direction found");
    }

    getNextCell(dir) {
        if (dir === 0) return this.map.get(this.x - 1, this.y);
        if (dir === 1) return this.map.get(this.x, this.y - 1);
        if (dir === 2) return this.map.get(this.x + 1, this.y);
        if (dir === 3) return this.map.get(this.x, this.y + 1);
    }

    basicMove() {
        if (this.dir === 0) this.x -= 1;
        if (this.dir === 1) this.y -= 1;
        if (this.dir === 2) this.x += 1;
        if (this.dir === 3) this.y += 1;
    }

    moveDot() {
        let next = this.getNextCell(this.dir);
        parser.parseCell(this, next, this.map);
    }
}

module.exports = Pointer;