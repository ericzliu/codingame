const fs = require('fs');

function readLines(path) {
    return new Promise((resolve, reject) => {
        var data = '';
        var rd = fs.createReadStream(path, 'utf8');
        var isFirst = true;
        rd.on('data', function (chunk) {
            data += chunk;
        }).on('end', function () {
            const lines = data.split('\n');
            resolve(lines);
        }).on('error', function (error) {
            reject(error);
        });
    });
}

function readGrid(path) {
    return readLines(path).then(lines => {
        return new Promise((resolve, reject) => {
            const inputs = lines[0].split(' ');
            const width = parseInt(inputs[0]);
            const height = parseInt(inputs[1]);
            const grid = new Array(width);
            for (let i = 0; i < width; i += 1) {
                grid[i] = new Array(height);
            }
            for (let i = 0; i < height; i += 1) {
                let row = lines[i + 1];
                for (let j = 0; j < width; j += 1) {
                    grid[j][i] = row[j];
                }
            }
            resolve({ grid, width, height });
        });
    });
}

module.exports.readGrid = readGrid;
module.exports.readLines = readLines;
