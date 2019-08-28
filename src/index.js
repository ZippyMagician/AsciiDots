const CellMap = require('./cellmap');
const PointerDot = require('./pointer');
const globe = require('./global/cells');

const requestAnimationFrame = function(f) {
    return setTimeout(f, 1000 / 60);
};

function main(input, map_size) {
    let dots = [];

    let map = new CellMap(input, map_size);
    for (var dot in map.dot_pos) {
        dots.push(new PointerDot(map.dot_pos[dot], map));
    }
    globe.tiles = dots[0].map.tiles;

    requestAnimationFrame(dotTick.bind(false, dots));
}

function dotTick(dots) {
    for (var index in dots) {
        let del = 0;
        for (var i in dots) {
            if (!dots[i]) del += 1;
        }
        if (del === dots.length) process.exit();
        
        let dot = dots[index];
        if (dot.delete) {
            delete dots[index];
            dots[index] = false;
        }
        if (dots[index]) {
            dot.moveDot();
        }
    }

    requestAnimationFrame(dotTick.bind(false, dots));
}

module.exports.execute = main;