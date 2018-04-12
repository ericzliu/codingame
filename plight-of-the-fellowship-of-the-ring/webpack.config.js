module.exports = {
    entry: "./kd-tree.js",
    output: {
        devtoolLineToLine: true,
        sourceMapFilename: "./bundle.js.map",
        pathinfo: true,
        path: __dirname,
        filename: "bundle.js"
    }
};
