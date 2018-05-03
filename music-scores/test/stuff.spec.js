const { describe, it } = require('mocha');
const fs = require('fs');
const { readRaw } = require('../inout');
const { assert } = require('chai');

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

function readRawFile(path) {
    return new Promise((resolve, reject) => {
        var data = '';
        var rd = fs.createReadStream(path, 'utf8');
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

describe('Stuff test', function () {
    it('Can get width and space from one-half-note-between-lines.txt', function () {
        return readFile('./testcase/one-half-note-between-lines.txt').then(function (bw) {
            const { space, width } = bw.readStd();
            assert.equal(space, 20);
            assert.equal(width, 4);
        });
    });

    it('Can get width and space from doctor-who-theme', function () {
        return readFile('./testcase/doctor-who-theme.txt').then(function (bw) {
            const { space, width } = bw.readStd();
            assert.equal(space, 30);
            assert.equal(width, 4);
        });
    });

    it('Can get width and space from lower-c', function () {
        return readFile('./testcase/lower-c.txt').then(function (bw) {
            const { space, width } = bw.readStd();
            assert.equal(space, 20);
            assert.equal(width, 4);
        });
    });

    it('Can get width and space from one-half-note-between-lines', function () {
        return readFile('./testcase/one-half-note-between-lines.txt').then(function (bw) {
            const { space, width } = bw.readStd();
            assert.equal(space, 20);
            assert.equal(width, 4);
        });
    });

    it('Can get width and space from only-1-pixel-wide', function () {
        return readFile('./testcase/only-1-pixel-wide.txt').then(function (bw) {
            const { space, width } = bw.readStd();
            assert.equal(space, 8);
            assert.equal(width, 1);
        });
    });

    it('Can get width and space from random', function () {
        return readFile('./testcase/random.txt').then(function (bw) {
            const { space, width } = bw.readStd();
            assert.equal(space, 30);
            assert.equal(width, 4);
        });
    });

    it('Can split notes from only-quarter-notes-without-lower-c.txt', function () {
        return readFile('./testcase/only-quarter-notes-without-lower-c.txt').then(function (bw) {
            const { space, width } = bw.readStd();
            const notes = bw.getNotes(space, width);
            assert.equal(8, notes.length);
        });
    });

    it('Can split notes from only-half-notes-without-lower-c.txt', function () {
        return readFile('./testcase/only-half-notes-without-lower-c.txt').then(function (bw) {
            const { space, width } = bw.readStd();
            const notes = bw.getNotes(space, width);
            assert.equal(7, notes.length);
        });
    });

    it('Can split notes from only-1-pixel-wide.txt', function () {
        return readFile('./testcase/only-1-pixel-wide.txt').then(function (bw) {
            const { space, width } = bw.readStd();
            const notes = bw.getNotes(space, width);
            assert.equal(20, notes.length);
        });
    });

    it('Can split notes from scale-half-and-quarter-notes.txt', function () {
        return readFile('./testcase/scale-half-and-quarter-notes.txt').then(function (bw) {
            const { space, width } = bw.readStd();
            const notes = bw.getNotes(space, width);
            assert.equal(9, notes.length);
        });
    });

    it('Can split notes from very-close.txt', function () {
        return readFile('./testcase/very-close.txt').then(function (bw) {
            const { space, width } = bw.readStd();
            const notes = bw.getNotes(space, width);
            assert.equal(10, notes.length);
        });
    });

    it('Can split notes from doctor-who-theme.txt', function () {
        return readFile('./testcase/doctor-who-theme.txt').then(function (bw) {
            const { space, width } = bw.readStd();
            const notes = bw.getNotes(space, width);
            assert.equal(84, notes.length);
        });
    });

    it('Can split notes from random.txt', function () {
        return readFile('./testcase/random.txt').then(function (bw) {
            const { space, width } = bw.readStd();
            const notes = bw.getNotes(space, width);
            assert.equal(90, notes.length);
        });
    });

    it('Can encode note', function () {
        return readRawFile('./testcase/random.txt').then(function (lines) {
            const bw = readRaw(lines);
            const encoded = bw.encode();
            assert.deepEqual(lines[1].trim(), encoded[1].trim());
            assert.deepEqual(lines[0].trim(), encoded[0].trim());
        });
    });

    it('Can test line', function () {
        return readFile('./testcase/one-quarter-note-on-a-line.txt').then(function (bw) {
            const { space, width, segments } = bw.readStd();
            const notes = bw.getNotes(space, width);
            //BQ
            const BQ = notes[0];
            const bqImg = bw.getNote(BQ.begin, BQ.end);
            const { isRect, minW, maxW, minH, maxH } = bqImg.isBlackRegionRect(segments[0].end, segments[1].begin);
            assert.isTrue(isRect);
            assert.equal(minH, segments[0].end);
            assert.equal(maxH, segments[1].begin - 1);
            assert.isTrue(minW > 0);
            assert.equal(maxW, bqImg.width - 1);
            assert.equal((maxH - minH + 1) * (maxW - minW + 1), 40);
        });
    });

    it('Can test no line', function () {
        return readFile('./testcase/one-quarter-note-on-a-line.txt').then(function (bw) {
            const { space, width, segments } = bw.readStd();
            const notes = bw.getNotes(space, width);
            //BQ
            const BQ = notes[0];
            const bqImg = bw.getNote(BQ.begin, BQ.end);
            assert.isFalse(bqImg.isBlackRegionRect(0, segments[0].begin).isRect);
            assert.isFalse(bqImg.isBlackRegionRect(segments[1].end, segments[2].begin).isRect);
            assert.isFalse(bqImg.isBlackRegionRect(segments[2].end, segments[3].begin).isRect);
            assert.isFalse(bqImg.isBlackRegionRect(segments[3].end, segments[4].begin).isRect);
            assert.isFalse(bqImg.isBlackRegionRect(segments[4].end, bqImg.height).isRect);
        });
    });

    it('Can test horizontal line', function () {
        return readFile('./testcase/random.txt').then(function (bw) {
            const { space, width, segments } = bw.readStd();
            const notes = bw.getNotes(space, width);
            //FH
            const FH = notes[0];
            const fhImg = bw.getNote(FH.begin, FH.end);
            assert.isTrue(fhImg.isBlackRegionRect(segments[4].end, fhImg.height).isRect);
            assert.isTrue(fhImg.isBlackRegionRect(segments[1].end, segments[2].begin).isRect);
        });
    });

    it('Can tell A', function () {
        return readFile('./testcase/one-half-note-between-lines.txt').then(function (bw) {
            const { space, width, segments } = bw.readStd();
            const notes = bw.getNotes(space, width);
            //AH
            const AH = notes[0];
            const ahImg = bw.getNote(AH.begin, AH.end);
            const note = ahImg.tellNote(segments);
            assert.equal(note, 'A');
        });
    });

    it('Can tell B', function () {
        return readFile('./testcase/one-quarter-note-on-a-line.txt').then(function (bw) {
            const { space, width, segments } = bw.readStd();
            const notes = bw.getNotes(space, width);
            //BQ
            const BQ = notes[0];
            const bqImg = bw.getNote(BQ.begin, BQ.end);
            const note = bqImg.tellNote(segments);
            assert.equal(note, 'B');
        });
    });    
    
    it('Can distinguish lower C and D', function () {
        return readFile('./testcase/lower-c.txt').then(function (bw) {
            const { space, width, segments } = bw.readStd();
            const notes = bw.getNotes(space, width);
            //CQ
            const CQ = notes[0];
            const cqImg = bw.getNote(CQ.begin, CQ.end);
            const note = cqImg.tellNote(segments);
            assert.equal(note, 'C');
            //DQ
            const DQ = notes[3];
            const dqImg = bw.getNote(DQ.begin, DQ.end);
            const score = dqImg.tellNote(segments);
            assert.equal(score, 'D');
        });
    });

    it('Can detect half', function() {
        return readFile('./testcase/lower-c.txt').then(function (bw) {
            const { space, width, segments } = bw.readStd();
            const notes = bw.getNotes(space, width);
            let CH = notes[10];
            const chImg = bw.getNote(CH.begin, CH.end);
            assert.isTrue(chImg.isHalf(segments));

            let DQ = notes[9];
            const dqImg = bw.getNote(DQ.begin, DQ.end);
            assert.isFalse(dqImg.isHalf(segments));
        });
    });

    it('Can detect music from lower-c.txt', function() {
        return readFile('./testcase/lower-c.txt').then(function (bw) {
            const { space, width, segments } = bw.readStd();
            const notes = bw.getNotes(space, width);
            const scores = [];
            for (let note of notes) {
                const img = bw.getNote(note.begin, note.end);
                const score = img.tellNote(segments);
                const isHalf = img.isHalf(segments);
                scores.push(score + (isHalf ? 'H' : 'Q'));
            }
            assert.deepEqual(scores, ['CQ', 'CQ', 'CQ', 'DQ', 'EH', 'DH', 'CQ', 'EQ', 'DQ', 'DQ', 'CH']);
        });
    });

    it('Can detect music from very-close.txt', function() {
        return readFile('./testcase/very-close.txt').then(function (bw) {
            const { space, width, segments } = bw.readStd();
            const notes = bw.getNotes(space, width);
            const scores = [];
            for (let note of notes) {
                const img = bw.getNote(note.begin, note.end);
                const score = img.tellNote(segments);
                const isHalf = img.isHalf(segments);
                scores.push(score + (isHalf ? 'H' : 'Q'));
            }
            assert.deepEqual(scores, ['BQ', 'CH', 'DH', 'EH', 'FQ', 'GQ', 'GQ', 'BQ', 'DH', 'BQ']);
        });
    });

    it('Can detect music from only-1-pixel-wide.txt', function() {
        return readFile('./testcase/only-1-pixel-wide.txt').then(function (bw) {
            const { space, width, segments } = bw.readStd();
            const notes = bw.getNotes(space, width);
            const scores = [];
            for (let note of notes) {
                const img = bw.getNote(note.begin, note.end);
                const score = img.tellNote(segments);
                const isHalf = img.isHalf(segments);
                scores.push(score + (isHalf ? 'H' : 'Q'));
            }
            assert.deepEqual(scores, ['BQ', 'CH', 'DH', 'EH', 'FQ', 'GQ', 'GQ', 'BQ', 'DH', 'BQ', 'BQ', 'CH', 'DH', 'EH', 'FQ', 'GQ', 'GQ', 'BQ', 'DH', 'BQ']);
        });
    });


    it('Can detect music from random.txt', function() {
        return readFile('./testcase/random.txt').then(function (bw) {
            const { space, width, segments } = bw.readStd();
            const notes = bw.getNotes(space, width);
            const note = notes[2];
            const img = bw.getNote(note.begin, note.end);
            const score = img.tellNote(segments);
            const isHalf = img.isHalf(segments);
            assert.equal(score, 'E');
            assert.isFalse(isHalf);
        });
    });

});
