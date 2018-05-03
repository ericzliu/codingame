// Black and white image
const BLACK = 1;
const WHITE = 0;

function getBlackSegments(column) {
    return getSegments(column, BLACK);
}

function getWhiteSegments(column) {
    return getSegments(column, WHITE);
}

function getSegments(column, color) {
    const segments = [];
    let inSegment = false;
    let begin = -1;
    let end = -1;
    for (let i = 0; i < column.length; i++) {
        if (column[i] === color) {
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

    getRegions(segments) {
        const regions = new Array(6);
        regions[0] = { begin: 0, end: segments[0].begin };
        regions[1] = { begin: segments[0].end, end: segments[1].begin };
        regions[2] = { begin: segments[1].end, end: segments[2].begin };
        regions[3] = { begin: segments[2].end, end: segments[3].begin };
        regions[4] = { begin: segments[3].end, end: segments[4].begin };
        regions[5] = { begin: segments[4].end, end: this.height };
        return regions;
    }

    // Assuming the current image only contains one music score
    // Find the regions that contains things other than the score tail
    // The region tells which place the score occupies, and we can deduce the score
    tellNote(segments) {
        const numBlack = this.countBlack(segments);
        if (numBlack.length != 6) {
            throw new Error('Format error: only five lines and six region');
        }
        const regionId = [];
        const regions = this.getRegions(segments);
        for (let i = 0; i < 6; i += 1) {
            if (numBlack[i] > 0) {
                if (!this.isBlackRegionRect(regions[i].begin, regions[i].end).isRect) {
                    regionId.push(i);
                }
            }
        }
        var score;
        if (regionId.length === 1) {
            switch (regionId[0]) {
            case 0:
                score = 'G';
                break;
            case 1:
                score = 'E';
                break;
            case 2:
                score = 'C';
                break;
            case 3:
                score = 'A';
                break;
            case 4:
                score = 'F';
                break;
            case 5:
                if (this.isLowerC(segments)) {
                    score = 'C';
                }
                else {
                    score = 'D';
                }
                break;
            }
        }
        else if (regionId.length === 2) {
            if (regionId[0] === 0 && regionId[1] === 1) {
                score = 'F';
            } else if (regionId[0] === 1 && regionId[1] === 2) {
                score = 'D';
            } else if (regionId[0] === 2 && regionId[1] === 3) {
                score = 'B';
            } else if (regionId[0] === 3 && regionId[1] === 4) {
                score = 'G';
            } else if (regionId[0] === 4 && regionId[1] === 5) {
                score = 'E';
            }
        }
        else {
            throw new Error('Unable to recognise note');
        }
        return score;
    }

    // Assume the image only contains the score columns
    // The distance between the lowest line and the top of the score
    // If zero, then is a D, else is a lower C
    isLowerC(segments) {
        const regions = this.getRegions(segments);
        let dist = Number.MAX_SAFE_INTEGER;
        for (let w = 0; w < (this.width / 2); w += 1) {
            for (let h = regions[5].begin; h < regions[5].end; h += 1) {
                if (this.getPixel(w, h) === BLACK) {
                    const local = h - regions[5].begin;
                    if (local < dist) {
                        dist = local;
                    }
                    break;
                }
            }
        }
        return (dist > 0);
    }

    // Assume image only contains the music note columns
    // Check column by column, if there is a white segment that doesn't start from a line and not end with a line
    // Then this is a half note
    isHalf(segments) {
        for (let w = 0; w < this.width; w += 1) {
            const data = this.getColumn(w);
            const whiteSegments = getWhiteSegments(data);
            for (let whiteSegment of whiteSegments) {
                const { begin, end } = whiteSegment;
                let next = false;
                if (begin === 0 || end == this.height) {
                    next = true;
                }
                if (!next) {
                    for (let segment of segments) {
                        if (begin === segment.end) {
                            next = true;
                            break;
                        }
                    }
                }
                if (!next) {
                    for (let segment of segments) {
                        if (end === segment.begin) {
                            next = true;
                            break;
                        }
                    }

                    if (end === (segments[4].end + segments[2].begin - segments[1].end)) {
                        next = true;
                    }
                }
                if (!next) {
                    return true;
                }
            }
        }
        return false;
    }
}

module.exports.BLACK = BLACK;
module.exports.WHITE = WHITE;
module.exports.BWImage = BWImage;
module.exports.getBlackSegments = getBlackSegments;
