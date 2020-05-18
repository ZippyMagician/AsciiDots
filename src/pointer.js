const move1 = [ '-', '>', 'v', '<', '^', '/', '\\', '+', '*' ];
const move2 = [ '|', '>', 'v', '<', '^', '/', '\\', '+', '*' ];
const parser = require('./parser');

module.exports = class Pointer {
    constructor (parent, map) {
        this.dot = parent;
        this.map = map;

        this.delete = false;

        this.value = 0;
        this.address = 0;

        if (parent.value) this.value = parent.value;

        this.x = this.dot.x;
        this.y = this.dot.y;

        this.dir = parent.dir !== undefined ? parent.dir : this.findDir();
    }

    findDir() {
        let x = this.x;
        let y = this.y;

        if (this.map.get(x, y - 1) && move2.indexOf(this.map.get(x, y - 1).op) > -1) return 1; // Up
        if (this.map.get(x + 1, y) && move1.indexOf(this.map.get(x + 1, y).op) > -1) return 2; // Right
        if (this.map.get(x, y + 1) && move2.indexOf(this.map.get(x, y + 1).op) > -1) return 3; // Down
        if (this.map.get(x - 1, y) && move1.indexOf(this.map.get(x - 1, y).op) > -1) return 0; // Left

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

    changeMap(newMap, x, y) {
        this.prevMap = this.map;
        this.prevX = x;
        this.prevY = y;
        this.map = newMap;

        this.x = x;
        this.y = y;
    }
}