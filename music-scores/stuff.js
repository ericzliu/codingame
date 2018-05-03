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
            return { space: stdSpace, width: stdSize, segments: segments };
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
        const eq1 = sizes.reduce(function (res, size) {
            return res && size === width;
        }, true);
        const spaces = [];
        for (let i = 1; i < segments.length; i++) {
            spaces.push(segments[i].begin - segments[i - 1].end);
        }
        if (spaces.length > 0) {
            const eq2 = spaces.reduce(function (res, value) {
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

    getNote(begin, end) {
        const width = end - begin;
        const height = this.height;
        const pixels = new Array(width * height);
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                pixels[j + i * width] = this.pixels[j + begin + (i * this.width)];
            }
        }
        return new BWImage(pixels, width, height);
    }

    encode() {
        const arr = new Array();
        let color = this.pixels[0];
        let num = 0;
        for (let i = 0; i < this.pixels.length; i += 1) {
            if (color === this.pixels[i]) {
                num += 1;
            } else {
                arr.push(color === BLACK ? 'B' : 'W');
                arr.push(num);
                color = this.pixels[i];
                num = 1;
            }
        }
        if (num > 0) {
            arr.push(color === BLACK ? 'B' : 'W');
            arr.push(num);
        }
        const lines = new Array(2);
        lines[0] = this.width + ' ' + this.height;
        lines[1] = arr.join(' ');
        return lines;
    }

    countBlack(segments) {
        const nums = new Array(6);
        nums.fill(0);
        for (var h = 0; h < this.height; h += 1) {
            for (var w = 0; w < this.width; w += 1) {
                if (this.pixels[h * this.width + w] === BLACK) {
                    let ind = -1;
                    if (h < segments[0].begin) {
                        ind = 0;
                    } else if (h >= segments[0].end && h < segments[1].begin) {
                        ind = 1;
                    } else if (h >= segments[1].end && h < segments[2].begin) {
                        ind = 2;
                    } else if (h >= segments[2].end && h < segments[3].begin) {
                        ind = 3;
                    } else if (h >= segments[3].end && h < segments[4].begin) {
                        ind = 4;
                    } else if (h >= segments[4].end) {
                        ind = 5;
                    }
                    if (ind >= 0) {
                        nums[ind] += 1;
                    }
                }
            }
        }
        return nums;
    }

    getPixel(w, h) {
        return this.pixels[h * this.width + w];
    }

    isBlackRegionRect(begin, end) {
        const MAX = Number.MAX_SAFE_INTEGER;
        const MIN = Number.MIN_SAFE_INTEGER;
        var minW = MAX, minH = MAX, maxW = MIN, maxH = MIN;
        for (let h = begin; h < end; h += 1) {
            for (let w = 0; w < this.width; w += 1) {
                const p = this.getPixel(w, h);
                if (p === BLACK) {
                    if (w < minW) {
                        minW = w;
                    }
                    if (w > maxW) {
                        maxW = w;
                    }
                    if (h < minH) {
                        minH = h;
                    }
                    if (h > maxH) {
                        maxH = h;
                    }
                }
            }
        }

        if (minW > maxW || minH > maxH) {
            return { isRect: false };
        }

        for (let h = minH; h <= maxH; h += 1) {
            for (let w = minW; w <= maxW; w += 1) {
                const p = this.getPixel(w, h);
                if (p != BLACK) {
                    return { isRect: false };
                }
            }
        }
        return { isRect: true, minW: minW, minH: minH, maxW: maxW, maxH: maxH };
    }
}

module.exports.BLACK = BLACK;
module.exports.WHITE = WHITE;
module.exports.BWImage = BWImage;
module.exports.getBlackSegments = getBlackSegments;
