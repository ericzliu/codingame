// Black and white image
const BLACK = 1;
const WHITE = 0;

function getBlackSegments(column) {
    const segments = [];
    let inSegment = false;
    let begin = -1;
    let end = -1;
    for (let i = 0; i < column.length; i++) {
        if (column[i] === BLACK) {
            if (!inSegment) {
                inSegment = true;
                begin = i;
            }
        } else {
            if (inSegment) {
                end = i;
                inSegment = false;
                segments.push({ begin: begin, end: end });
                begin = -1;
                end = -1;
            }
        }
    }
    return segments;
}

function average(data) {
    const total = data.reduce(function (sum, value) { return sum + value; }, 0);
    return total / data.length;
}

function getStdMeasure(pixels, W, H) {
    var buffer = new Array(H);
    var segments;
    var spaces;
    for (let w = 0; w < W; w++) {
        for (let h = 0, p = w; h < H; h += 1, p += W) {
            buffer[h] = pixels[p];
        }
        segments = getBlackSegments(buffer);
        if (segments.length === 5) {
            spaces = [];
            for (let i = 1; i < segments.length; i++) {
                spaces.push(segments[i].begin - segments[i - 1].end);
            }
            var stdSpace = average(spaces);
            var sizes = segments.map(value => value.end - value.begin);
            var stdSize = average(sizes);
            return {space: stdSpace, width: stdSize};
        }
    }
}

class BWImage {
    constructor(pixels, width, height) {
        this.pixels = pixels;
        this.width = width;
        this.height = height;
    }

    isColumnEmpty(w) {
        for (let p = w, i = 0; i < this.height; i += 1, p += this.width) {
            if (this.pixels[p] === BLACK) {
                return false;
            }
        }
        return true;
    }

    getColumn(w) {
        const data = new Array(this.height);
        for (let p = w, i = 0; i < this.height; i += 1, p += this.width) {
            data[i] = this.pixels[p];
        }
        return data;
    }

    copyColumn(w, buffer) {
        for (let p = w, i = 0; i < this.height; i += 1, p += this.width) {
            buffer[i] = this.pixels[p];
        }
    }

    readStd() {
        return getStdMeasure(this.pixels, this.width, this.height);
    }

    isColumnStd(segments, space, width) {
        const sizes = segments.map(value => value.end - value.begin);
        const eq1 = sizes.reduce(function(res, size) {
            return res && size === width;
        }, true);
        const spaces = [];
        for (let i = 1; i < segments.length; i++) {
            spaces.push(segments[i].begin - segments[i-1].end);
        }
        if (spaces.length > 0) {
            const eq2 = spaces.reduce(function(res, value) {
                return res && value === space;
            }, true);
            if (eq1 && eq2) return true;
        }
        return false;
    }

    getNotes(space, width) {
        const notes = new Array(this.width);
        const buffer = new Array(this.height);
        for (let w = 0; w < this.width; w++) {
            notes[w] = WHITE;
            if (!this.isColumnEmpty(w)) {
                this.copyColumn(w, buffer);
                const segments = getBlackSegments(buffer);
                if (!this.isColumnStd(segments, space, width)) {
                    notes[w] = BLACK;
                }
            }
        }
        return getBlackSegments(notes);
    }
}

module.exports.BLACK = BLACK;
module.exports.WHITE = WHITE;
module.exports.BWImage = BWImage;
module.exports.getBlackSegments = getBlackSegments;