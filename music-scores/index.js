const { readRaw, writeToFile } = require('./inout');
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

function recognize(bw) {
    const { space, width, segments } = bw.readStd();
    const notes = bw.getNotes(space, width);
    const scores = [];
    for (let note of notes) {
        const img = bw.getNote(note.begin, note.end);
        const score = img.tellNote(segments);
        const isHalf = img.isHalf(segments);
        scores.push(score + (isHalf ? 'H' : 'Q'));
    }
    return scores;
}

module.exports.readRaw = readRaw;
module.exports.recognize = recognize;
