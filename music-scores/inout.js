const stuff = require('./stuff');

function parseImage(image, width, height) {
    const tokens = image.split(' ');
    const pixels = new Array(width * height);
    let p = 0;
    for (let t = 0; t < tokens.length; t += 2) {
        const code = tokens[t];
        const num = parseInt(tokens[t + 1]);
        const color = code === 'B' ? stuff.BLACK : stuff.WHITE;
        for (let n = 0; n < num; n++) {
            pixels[p + n] = color;
        }
        p += num;
    }
    return pixels;
}
// Returen 
function readRaw(lines) {
    const dimension = lines[0].split(' ');
    const width = parseInt(dimension[0]);
    const height = parseInt(dimension[1]);
    const image = lines[1];
    const pixels = parseImage(image, width, height);
    return new stuff.BWImage(pixels, width, height);
}

module.exports.readRaw = readRaw;
