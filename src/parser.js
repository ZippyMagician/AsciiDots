const rl = require('readline-sync');
const globe = require('./global/cells');
const ops = [ '-', '|', '<', '^', '>', 'v', '.', '#', '@', '%', '?', '/', '\\', '~', '[', ']', '{', '}', '&', '"', "'", '+' ];

module.exports.parseCell = function (dot, cell, map) {
    let x = cell.x;
    let y = cell.y;
    let dir = dot.dir;

    function moveCursor() {
        if (dir === 0) x -= 1;
        if (dir === 1) y -= 1;
        if (dir === 2) x += 1;
        if (dir === 3) y += 1;
    }

    function parseString(newline) {
        let str = "";
        moveCursor();
        dot.basicMove();
        try {
            while (map.get(x, y).op !== '"' && map.get(x, y).op !== "'" && x < map.tiles.length) {
                str += map.get(x, y).op;
                moveCursor();
                dot.basicMove();
            }
            if (newline) str += '\n';
        } catch (e) {
            throw new Error(e);
        }

        return str;
    }

    function parseParamInt() {
        let num = '';
        while(ops.indexOf(map.get(x, y).op) === -1 && !isNaN(map.get(x, y).op)) {
            num += map.get(x, y).op;
            moveCursor();
            dot.basicMove();
        }
        return parseInt(num);
    }

    function parseParam(newline = true) {
        moveCursor();
        let cur = map.get(x, y);
        if (cur.op === '"' || cur.op === "'") {
            dot.basicMove();
            return parseString(newline);
        }
        if (cur.op === "_") {
            dot.basicMove();
            return parseParam(false);
        }
        if (cur.op === "?") {
            dot.basicMove();
            let ret = rl.question("> ");
            return isNaN(ret) ? ret.toString() : parseInt(ret);
        }
        if (cur.op === "a") {
            dot.basicMove();
            return String.fromCharCode(parseInt(parseParam(false)));
        }
        if (cur.op === "#") {
            dot.basicMove();
            return dot.value;
        }
        if (cur.op === "@") {
            dot.basicMove();
            return dot.address;
        }
        if (!isNaN(cur.op)) {
            dot.basicMove();
            return parseParamInt();
        }
        throw new Error("Unrecognized parameter: " + cell.op + " x: " + x + " y: " + y)
    }

    function findOtherParens(dr) {
        dot.dir = dr;
        dir = dr;
        if (dr === 0) {
            while(map.get(x, y).op !== "(") {
                moveCursor();
                dot.basicMove();
            }
        } else {
            while(map.get(x, y).op !== ")") {
                moveCursor();
                dot.basicMove();
            }
        }
    }

    switch (cell.op) {
        case '-':
            if (dir !== 0 && dir !== 2) throw new Error("Invalid operator \"-\" for direction " + dir);
            dot.basicMove();
            return false;
        case '|':
            if (dir !== 1 && dir !== 3) throw new Error("Invalid operator \"|\" for direction " + dir);
            dot.basicMove();
            return false;
        case '<':
            dot.basicMove();
            dot.dir = 0;
            return false;
        case '^':
            dot.basicMove();
            dot.dir = 1;
            return false;
        case '>':
            dot.basicMove();
            dot.dir = 2;
            return false;
        case 'v':
            dot.basicMove();
            dot.dir = 3;
            return false;
        case '(':
            dot.basicMove();
            return false;
        case ')':
            dot.basicMove();
            findOtherParens(0);
            dir = 2;
            dot.dir = 2;
            return false;
        case '/':
            dot.basicMove();
            if (dot.dir === 0) dot.dir = 3;
            if (dot.dir === 1) dot.dir = 2;
            if (dot.dir === 2) dot.dir = 1;
            if (dot.dir === 3) dot.dir = 0;
            return false;
        case '\\':
            dot.basicMove();
            if (dot.dir === 0) dot.dir = 1;
            if (dot.dir === 1) dot.dir = 0;
            if (dot.dir === 2) dot.dir = 3;
            if (dot.dir === 3) dot.dir = 2;
        case '#':
            dot.basicMove();
            dot.value = parseParam(false);
            return false;
        case '@':
            dot.basicMove();
            dot.address = parseParam(false);
            return false;
        case '$':
            dot.basicMove();
            console.log(parseParam());
            return false;
        case '~':
            let cel = globe.get(x, y);
            if (!cel.dots[0] && dot.dir === 1) {
                let obj = globe.get(x, y);
                obj.dots[0] = dot;
                globe.set(x, y, obj);
            } else if (dot.dir === 2) {
                cel.dots[1] = dot;
                if (cel.dots[0] && cel.dots[0].value === 0) {
                    dot.value = cel.dots[0].value;
                    dot.basicMove();
                    cel.dots[0].delete = true;
                } else if (cel.dots[0]) {
                    dot.value = cel.dots[0].value
                    dot.basicMove();
                    dot.dir = 1;
                    cel.dots[0].delete = true;
                }
            }
            return false;
        case '&':
            process.exit();
        case undefined:
            dot.delete = true;
            return true;
        case ' ':
            dot.delete = true;
            return true;
    }

    return false;
}