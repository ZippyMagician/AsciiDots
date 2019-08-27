const ops = [ '-', '|', '<', '^', '>', 'v', '.', '#', '@', '%', '/', '\\', '~', '[', ']', '{', '}', '&', '"', '+' ];

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
            while (ops.indexOf(map.get(x, y).op) === -1) {
                str += map.get(x, y).op;
                moveCursor();
                dot.basicMove();
            }
            if (!map.get(x, y) || map.get(x, y).op !== '"') throw new Error("Invalid termination of string");
            else {
                if (newline) str += '\n';
            }
        } catch (e) {
            throw new Error("Line " + (y + 1) + " to long");
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
        if (cur.op === '"') {
            dot.basicMove();
            return parseString(newline);
        }
        if (cur.op === "_") {
            dot.basicMove();
            return parseParam(false);
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
        throw new Error("Unrecognized parameter")
    }

    //console.log("Parser called with op " + cell.op + " at x: " + x + " y: " + y);

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
            dot.value = parseParam(false);
            return false;
        case '$':
            dot.basicMove();
            console.log(parseParam());
            break;
        case '&':
            process.exit();
        case undefined:
            process.exit();
    }

    return false;
}