const rl = require('readline-sync');
const globe = require('./global/cells');
const DotParent = require('./index');

const ops = [ '-', '|', '<', '^', '>', 'v', '.', '#', '@', '%', '?', '/', '\\', '~', '[', ']', '{', '}', '&', '"', "'" ];
const operations = [ '*', '/', '÷', '+', '-', '%', '^', '&', '!', 'o', 'x', '>', '≥', '<', '≤', '=', '≠' ];
const move_right = [ '-', '>', 'v', '^', '/', '\\', '+', '#', '@', '[', '(', '{', '$' ]; // Right
const move_left = [ '-', 'v', '<', '^', '/', '\\', '+', '#', '@', ']', ')', '}', '$' ]; // Left
const move_up = [ '|', '>', '<', '^', '/', '\\', '+', '#', '@', '$' ]; // Up
const move_down = [ '|', '>', '<', 'v', '/', '\\', '+', '#', '@', '$' ]; // Down

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
        while(ops.indexOf(map.get(x, y).op) === -1 && operations.indexOf(map.get(x, y).op) === -1 && !isNaN(map.get(x, y).op)) {
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
        if (operations.indexOf(cur.op) > -1) {
            //dot.basicMove();
            return cur.op;
        }
        if (!isNaN(cur.op)) {
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
    
    function evalOperation(fir, op, sec) {
        switch (op) {
            case '*':
                return fir * sec;
            case '/':
            case '÷':
                return fir / sec;
            case '+':
                return fir + sec;
            case '-':
                return fir - sec;
            case '%':
                return fir % sec;
            case '^':
                return Math.pow(fir, sec);
            case '&':
                return fir && sec ? 1 : 0;
            case '!':
                return !(evalOperation(fir, map.get(x + 1, y).op, sec));
            case 'o':
                return fir || sec ? 1 : 0;
            case 'x':
                return !fir !== !sec ? 1 : 0;
            case '>':
                return fir > sec ? 1 : 0;
            case '≥':
                return fir >= sec ? 1 : 0;
            case '<':
                return fir < sec ? 1 : 0;
            case '≤':
                return fir <= sec ? 1 : 0;
            case '=':
                return fir === sec;
            case '≠':
                return fir !== sec;
        }
    }

    function runOperationLoop() {
        let op_cell = globe.get(x, y);
        // First dot that is recorded is the horizontal one
        if (!op_cell.dots[0] && (dot.dir === 0 || dot.dir === 2)) op_cell.dots[0] = dot;
        else if (!op_cell.dots[1] && (dot.dir === 1 || dot.dir === 3)) op_cell.dots[1] = dot;
        // Check if this is the vertical dot and there are two dots resting here
        if (op_cell.dots[1] === dot && op_cell.dots[0]) {
            dot.value = parseInt(evalOperation(parseInt(dot.value), cell.op, parseInt(op_cell.dots[0].value)));
            dot.basicMove();
            op_cell.dots[0].delete = true;
            op_cell.dots = [false, false];
        }
        return false;
    }

    switch (cell.op) {
        case '-':
            if (map.get(x - 1, y).op && (map.get(x - 1, y).op === "[" || map.get(x - 1, y).op === "{")) return runOperationLoop();
            if (dir !== 0 && dir !== 2) throw new Error("Invalid operator \"-\" for direction " + dir);
            dot.basicMove();
            return false;
        case '|':
            if (dir !== 1 && dir !== 3) throw new Error("Invalid operator \"|\" for direction " + dir);
            dot.basicMove();
            return false;
        case '!':
            if (map.get(x - 1, y).op && (map.get(x - 1, y).op === "[" || map.get(x - 1, y).op === "{")) return runOperationLoop();
            if (dir !== 1 && dir !== 3) throw new Error("Invalid operator \"!\" for direction " + dir);
            dot.basicMove();
            return false;
        case '<':
            if (map.get(x - 1, y).op && (map.get(x - 1, y).op === "[" || map.get(x - 1, y).op === "{")) return runOperationLoop();
            dot.basicMove();
            dot.dir = 0;
            return false;
        case '^':
            if (map.get(x - 1, y).op && (map.get(x - 1, y).op === "[" || map.get(x - 1, y).op === "{")) return runOperationLoop();
            dot.basicMove();
            dot.dir = 1;
            return false;
        case '>':
            if (map.get(x - 1, y).op && (map.get(x - 1, y).op === "[" || map.get(x - 1, y).op === "{")) return runOperationLoop();
            dot.basicMove();
            dot.dir = 2;
            return false;
        case 'v':
            dot.basicMove();
            dot.dir = 3;
            return false;
        case '+':
            if (map.get(x - 1, y).op && (map.get(x - 1, y).op === "[" || map.get(x - 1, y).op === "{")) return runOperationLoop();
            dot.basicMove();
            return false;
        case '*':
            if (map.get(x - 1, y).op && (map.get(x - 1, y).op === "[" || map.get(x - 1, y).op === "{")) return runOperationLoop();
            if (dot.y < y) d = 1;
            else if (dot.y > y) d = 3;
            else if (dot.x < x) d = 0;
            else if (dot.x > x) d = 2;

            let dot_dirs = [];
            if (d !== 0 && move_left.indexOf(map.get(x - 1, y).op) > -1) dot_dirs.push(0);
            if (d !== 1 && move_up.indexOf(map.get(x, y - 1).op) > -1) dot_dirs.push(1);
            if (d !== 2 && move_right.indexOf(map.get(x + 1, y).op) > -1) dot_dirs.push(2);
            if (d !== 3 && move_down.indexOf(map.get(x, y + 1).op) > -1) dot_dirs.push(3);
            
            for(var ind in dot_dirs) {
                let dot_dir = dot_dirs[ind];
                DotParent.createDot({ x: x, y: y, dir: dot_dir, value: dot.value}, map);
            }
            dot.delete = true;
            return false;
        case '[':
            dot.basicMove();
            return false;
        case ']':
            dot.basicMove();
            return false;
        case '(':
            dot.basicMove();
            findOtherParens(2);
            dir = 0;
            dot.dir = 0;
            return false;
        case ')':
            dot.basicMove();
            findOtherParens(0);
            dir = 2;
            dot.dir = 2;
            return false;
        case '/':
            if (map.get(x - 1, y).op && (map.get(x - 1, y).op === "[" || map.get(x - 1, y).op === "{")) return runOperationLoop();
            dot.basicMove();
            if (dot.dir === 0) dot.dir = 3;
            else if (dot.dir === 1) dot.dir = 2;
            else if (dot.dir === 2) dot.dir = 1;
            else if (dot.dir === 3) dot.dir = 0;
            return false;
        case '\\':
            dot.basicMove();
            if (dot.dir === 0) dot.dir = 1;
            else if (dot.dir === 1) dot.dir = 0;
            else if (dot.dir === 2) dot.dir = 3;
            else if (dot.dir === 3) dot.dir = 2;
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
                    if (map.get(x, y + 1).op === "!") dot.dir = 1;
                    cel.dots[0].delete = true;
                } else if (cel.dots[0]) {
                    dot.value = cel.dots[0].value
                    dot.basicMove();
                    if (map.get(x, y + 1).op === "!") dot.dir = 2;
                    else dot.dir = 1;
                    cel.dots[0].delete = true;
                }
            }
            return false;
        case '&':
            if (map.get(x - 1, y).op && (map.get(x - 1, y).op === "[" || map.get(x - 1, y).op === "{")) return runOperationLoop();
            process.exit();
        case undefined:
        case null:
            dot.delete = true;
            return true;
        case ' ':
            dot.delete = true;
            return true;
        // '*', '/', '÷', '+', '-', '%', '^', '&', '!', 'o', 'x', '>', '≥', '<', '≤', '=', '≠'
        case '÷':
        case '%':
        case 'o':
        case 'x':
        case '≥':
        case '≤':
        case '=':
        case '≠':
            return runOperationLoop();
    }

    return false;
}