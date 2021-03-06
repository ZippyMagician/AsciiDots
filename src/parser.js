const rl = require('readline-sync');
const globe = require('./global/cells');
const warpGlobe = require('./global/warp_cells');
const parent = require('./index');

const ops = [ '-', '|', '<', '^', '>', 'v', '.', '#', '@', '%', '?', '/', '\\', '~', '[', ']', '{', '}', '&', '"', "'" ];
const operations = [ '*', '/', '÷', '+', '-', '%', '^', '&', '!', 'o', 'x', '>', '≥', '<', '≤', '=', '≠' ];
const move_right = [ '-', '>', 'v', '^', '/', '\\', '+', '#', '@', '[', '(', '{', '$', '~' ]; // Right
const move_left = [ '-', 'v', '<', '^', '/', '\\', '+', '#', '@', ']', ')', '}', '$', '~' ]; // Left
const move_up = [ '|', '>', '<', '^', '/', '\\', '+', '*', '#', '@', '$', '~', '!' ]; // Up
const move_down = [ '|', '>', '<', 'v', '/', '\\', '+', '*', '#', '@', '$', '~' ]; // Down

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

    function parseString(newline, op) {
        let str = "";
        moveCursor();
        dot.basicMove();
        try {
            while (map.get(x, y).op !== op && x < map.tiles.length) {
                str += map.get(x, y).op;
                moveCursor();
                dot.basicMove();
            }
            // if (newline) str += '\n';
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

    function parseParam(newline = true, special_case = false) {
        moveCursor();
        let cur = map.get(x, y);
        if (cur.op === '"' || cur.op === "'") {
            dot.basicMove();
            return parseString(newline, cur.op);
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
        if (operations.indexOf(cur.op) > -1 && !special_case) {
            //dot.basicMove();
            return cur.op;
        }
        if (!isNaN(cur.op) && cur.op !== "-") {
            return parseParamInt();
        }
        //throw new Error("Unrecognized parameter: " + cell.op + " x: " + x + " y: " + y)
        return false;
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
                return !!fir && !!sec ? 1 : 0;
            case '!':
                return fir !== sec ? 1 : 0;
            case 'o':
                return !!fir || !!sec ? 1 : 0;
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
                return fir === sec ? 1 : 0;
            case '≠':
                return fir !== sec ? 1 : 0;
        }
    }

    function runOperationLoop() {
        let op_cell = map.warps.fileName ? warpGlobe.maps[map.warps.fileName].get(x, y) : globe.get(x, y);
        let curly = map.get(x - 1, y).op === "{";
        // First dot that is recorded is the horizontal one
        if (!op_cell.dots[curly ? 1 : 0] && (dot.dir === 0 || dot.dir === 2)) op_cell.dots[curly ? 1 : 0] = dot;
        else if (!op_cell.dots[curly ? 0 : 1] && (dot.dir === 1 || dot.dir === 3)) op_cell.dots[curly ? 0 : 1] = dot;
        // Check if this is the vertical dot and there are two dots resting here
        if (op_cell.dots[1] === dot && op_cell.dots[0]) {
            dot.maybeAddress(parseInt(evalOperation(parseInt(dot.want_address ? dot.address : dot.value), cell.op, parseInt(op_cell.dots[0].want_address ? op_cell.dots[0].address : op_cell.dots[0].value))));

            if (dot.want_address) dot.want_address = false;
            if (op_cell.dots[0].want_address) op_cell.dots[0].want_address = false;

            dot.basicMove();
            op_cell.dots[0].delete = true;
            op_cell.dots = [false, false];
        }
        return false;
    }
    
    let val;
    switch (cell.op) {
        case '-':
            if (map.get(x - 1, y).op && (map.get(x - 1, y).op === "[" || map.get(x - 1, y).op === "{")) return runOperationLoop();
            if (dir !== 0 && dir !== 2) throw new Error("Invalid operator \"-\" for direction " + dir + " at position " + x + " " + y);
            dot.want_address = false

            dot.basicMove();
            return false;
        case '|':
            if (dir !== 1 && dir !== 3) throw new Error("Invalid operator \"|\" for direction " + dir + " at position " + x + " " + y);
            dot.want_address = false

            dot.basicMove();
            return false;
        case '!':
            if (map.get(x - 1, y).op && (map.get(x - 1, y).op === "[" || map.get(x - 1, y).op === "{")) return runOperationLoop();
            if (dir !== 1 && dir !== 3) throw new Error("Invalid operator \"!\" for direction " + dir + " at position " + x + " " + y);
            dot.want_address = false

            dot.basicMove();
            return false;
        case '<':
            if (map.get(x - 1, y).op && (map.get(x - 1, y).op === "[" || map.get(x - 1, y).op === "{")) return runOperationLoop();
            dot.want_address = false

            dot.basicMove();
            dot.dir = dot.dir === 2 ? 2 : 0;
            return false;
        case '^':
            if (map.get(x - 1, y).op && (map.get(x - 1, y).op === "[" || map.get(x - 1, y).op === "{")) return runOperationLoop();
            dot.want_address = false

            dot.basicMove();
            dot.dir = dot.dir === 3 ? 3 : 1;
            return false;
        case '>':
            if (map.get(x - 1, y).op && (map.get(x - 1, y).op === "[" || map.get(x - 1, y).op === "{")) return runOperationLoop();
            dot.want_address = false

            dot.basicMove();
            dot.dir = dot.dir === 0 ? 0 : 2;
            return false;
        case 'v':
            dot.want_address = false

            dot.basicMove();
            dot.dir = dot.dir === 1 ? 1 : 3;
            return false;
        case '+':
            if (map.get(x - 1, y).op && (map.get(x - 1, y).op === "[" || map.get(x - 1, y).op === "{")) return runOperationLoop();
            dot.want_address = false

            dot.basicMove();
            return false;
        case '*':
            if (map.get(x - 1, y).op && (map.get(x - 1, y).op === "[" || map.get(x - 1, y).op === "{")) return runOperationLoop();
            dot.want_address = false

            if (dot.y < y) d = 1;
            else if (dot.y > y) d = 3;
            else if (dot.x < x) d = 0;
            else if (dot.x > x) d = 2;

            let dot_dirs = [];
            if (d !== 0 && (move_left.indexOf(map.get(x - 1, y).op) > -1 || map.warps.isWarp(map.get(x - 1, y).op) || map.warps.isHomeWarp(map.get(x - 1, y).op) || map.warps.isImportWarp(map.get(x - 1, y).op))) dot_dirs.push(0);
            if (d !== 1 && (move_up.indexOf(map.get(x, y - 1).op) > -1 || map.warps.isWarp(map.get(x, y - 1).op) || map.warps.isHomeWarp(map.get(x, y - 1).op) || map.warps.isImportWarp(map.get(x, y - 1).op))) dot_dirs.push(1);
            if (d !== 2 && (move_right.indexOf(map.get(x + 1, y).op) > -1 || map.warps.isWarp(map.get(x + 1, y).op) || map.warps.isHomeWarp(map.get(x + 1, y).op) || map.warps.isImportWarp(map.get(x + 1, y).op))) dot_dirs.push(2);
            if (d !== 3 && (move_down.indexOf(map.get(x, y + 1).op) > -1 || map.warps.isWarp(map.get(x, y + 1).op) || map.warps.isHomeWarp(map.get(x, y + 1).op) || map.warps.isImportWarp(map.get(x, y + 1).op))) dot_dirs.push(3);
            
            for(var ind in dot_dirs) {
                let dot_dir = dot_dirs[ind];
                parent.createDot(dot.createDot(x, y, dot_dir));
            }
            dot.delete = true;
            return false;
        case '[':
        case '{':
            dot.basicMove();
            return false;
        case ']':
        case '}':
            dot.basicMove();
            return false;
        case '(':
            dot.want_address = false

            dot.basicMove();
            dot.dir = 2;
            return false;
        case ')':
            dot.want_address = false

            dot.basicMove();
            dot.dir = 0;
            return false;
        case ':':
            dot.want_address = false

            dot.basicMove();
            if (dot.value === 0) dot.delete = true;
            return false;
        case ';':
            dot.want_address = false

            dot.basicMove();
            if (dot.value === 1) dot.delete = true;
            return false;
        case '/':
            if (map.get(x - 1, y).op && (map.get(x - 1, y).op === "[" || map.get(x - 1, y).op === "{")) return runOperationLoop();
            dot.want_address = false

            dot.basicMove();
            if (dot.dir === 0) dot.dir = 3;
            else if (dot.dir === 1) dot.dir = 2;
            else if (dot.dir === 2) dot.dir = 1;
            else if (dot.dir === 3) dot.dir = 0;
            return false;
        case '\\':
            dot.want_address = false

            dot.basicMove();
            if (dot.dir === 0) dot.dir = 1;
            else if (dot.dir === 1) dot.dir = 0;
            else if (dot.dir === 2) dot.dir = 3;
            else if (dot.dir === 3) dot.dir = 2;
            return false;
        case '#':
            dot.want_address = false

            dot.basicMove();
            val = parseParam(false, true);
            dot.value = val === false ? dot.value : val;
            return false;
        case '@':
            dot.want_address = false

            dot.basicMove();
            val = parseParam(false, true);
            dot.address = val === false ? dot.address : val;
            if (val === false) dot.want_address = true;
            return false;
        case '$':
            dot.want_address = false

            dot.basicMove();
            val = parseParam(true, true);
            if (val !== false) console.log(val);
            return false;
        case '~':
            let cel = map.warps.fileName ? warpGlobe.maps[map.warps.fileName].get(x, y) : globe.get(x, y);
            if (!cel.dots[0] && dot.dir === 1) {
                cel.dots[0] = dot;
            } else if (dot.dir === 2 || dot.dir === 0) {
                if (!cel.dots[1]) cel.dots[1] = dot;
                if (cel.dots[0] && (cel.dots[0].want_address ? cel.dots[0].address : cel.dots[0].value) === 0 && cel.dots[1] === dot) {
                    dot.basicMove();
                    if (map.get(x, y + 1).op === "!" && (map.get(x - 1, y + 1).op !== "[" && map.get(x - 1, y + 1).op !== "{")) dot.dir = 1;
                    cel.dots[0].delete = true;
                    cel.dots = [false, false];
                } else if (cel.dots[0] && (cel.dots[0].want_address ? cel.dots[0].address : cel.dots[0].value) !== 0 && cel.dots[1] === dot) {
                    dot.basicMove();
                    if (map.get(x, y + 1).op !== "!" || (map.get(x, y + 1).op === "!" && (map.get(x - 1, y + 1).op === "[" || map.get(x - 1, y + 1).op === "{"))) dot.dir = 1;
                    cel.dots[0].delete = true;
                    cel.dots = [false, false];
                }
            }
            return false;
        case '&':
            if (map.get(x - 1, y).op && (map.get(x - 1, y).op === "[" || map.get(x - 1, y).op === "{")) return runOperationLoop();
            dot.want_address = false

            return process.exit();
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
        case '.': // Move past dot (for code golfing)
            dot.want_address = false

            dot.basicMove();
            return false;
        default:
            dot.want_address = false
            dot.basicMove();

            if (map.warps.isHomeWarp(cell.op)) {
                dot.revertMap();
            } else if (map.warps.isImportWarp(cell.op)) {
                let data = map.warps.getImport(cell.op);
                dot.changeMap(data[0], data[1], data[2])
            } else if (map.warps.isWarp(cell.op)) {
                let pos = map.warps.find(cell.op, dot.x, dot.y);
                dot.x = pos.x;
                dot.y = pos.y;
            }

            return false;
    }

    return false;
}
