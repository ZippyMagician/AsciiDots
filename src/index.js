const CellMap = require('./cellmap');
const PointerDot = require('./pointer');

const requestAnimationFrame = function(f) {
    return setTimeout(f, 1000 / 60);
};

function main(input, map_size) {
    let dots = [];

    let map = new CellMap(input, map_size);
    for (var dot in map.dot_pos) {
        dots.push(new PointerDot(map.dot_pos[dot], map));
    }

    requestAnimationFrame(dotTick.bind(false, dots));
}

function dotTick(dots) {
    for (var index in dots) {
        let dot = dots[index];
        dot.moveDot();
    }

    requestAnimationFrame(dotTick.bind(false, dots));
}

module.exports.execute = main;