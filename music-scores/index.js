const { readRaw } = require('./inout');
const fs = require('fs');

function readFile(path) {
    return new Promise((resolve, reject) => {
        var data = '';
        var rd = fs.createReadStream(path, 'utf8');
        rd.on('data', function (chunk) {
            data += chunk;
        }).on('end', function () {
            const lines = data.split('\n');
            const bw = readRaw(lines);
            resolve(bw);
        }).on('error', function (error) {
            reject(error);
        });
    });
}

readFile('./testcase/random.txt').then(function (bw) {
    const { space, width } = bw.readStd();
    const notes = bw.getNotes(space, width);
    console.log(notes);
    console.log(notes.length);
});
