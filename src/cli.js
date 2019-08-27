module.exports = {
    getArgs: (argv, callback) => {
        let obj = argv["_"], name, ret;
        if (obj.length > 2) name = obj.shift(), ret = obj;
        else ret = obj[1], name = obj[0];
        return callback(name, ret);
    }
}