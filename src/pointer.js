const move1 = [ '-', '>', 'v', '<', '^', '/', '\\', '+', '*' ];
const move2 = [ '|', '>', 'v', '<', '^', '/', '\\', '+', '*' ];
const parser = require('./parser');

module.exports = class Pointer {
    constructor (parent, map) {
        this.dot = parent;
        this.map = map;
        this.prevMap = parent.prevMap ? parent.prevMap : false;
        this.prevX = parent.prevX ? parent.prevX : false;
        this.prevY = parent.prevY ? parent.prevY : false;

        this.delete = false;

        this.value = parent.value ? parent.value : 0;
        this.address = parent.address ? parent.address : 0;

        this.x = parent.x ? parent.x : 0;
        this.y = parent.y ? parent.y : 0;

        this.dir = parent.dir ? parent.dir : this.findDir();

        this.want_address = parent.want_address || false;
    }

    maybeAddress(value) {
        if (this.want_address) this.address = value;
        else this.value = value;
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

    createDot(x, y, dir) {
        let d = new Pointer(this, this.map);
        d.x = x;
        d.y = y;
        d.dir = dir;

        return d;
    }

    changeMap(newMap, x, y) {
        this.prevMap = this.map;
        this.prevX = this.x;
        this.prevY = this.y;

        this.map = newMap;
        this.x = x;
        this.y = y;
    }

    revertMap() {
        this.map = this.prevMap;
        this.x = this.prevX;
        this.y = this.prevY;

        this.prevMap = false;
        this.prevX = false;
        this.prevY = false;
    }
}