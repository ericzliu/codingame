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

    it('Can split notes from only-quarter-notes-without-lower-c.txt', function() {
        return readFile('./testcase/only-quarter-notes-without-lower-c.txt').then(function (bw) {
            const { space, width } = bw.readStd();
            const notes = bw.getNotes(space, width);
            assert.equal(8, notes.length);
        });
    });

    it('Can split notes from only-half-notes-without-lower-c.txt', function() {
        return readFile('./testcase/only-half-notes-without-lower-c.txt').then(function (bw) {
            const { space, width } = bw.readStd();
            const notes = bw.getNotes(space, width);
            assert.equal(7, notes.length);
        });
    });

    it('Can split notes from only-1-pixel-wide.txt', function() {
        return readFile('./testcase/only-1-pixel-wide.txt').then(function (bw) {
            const { space, width } = bw.readStd();
            const notes = bw.getNotes(space, width);
            assert.equal(20, notes.length);
        });
    });

    it('Can split notes from scale-half-and-quarter-notes.txt', function() {
        return readFile('./testcase/scale-half-and-quarter-notes.txt').then(function (bw) {
            const { space, width } = bw.readStd();
            const notes = bw.getNotes(space, width);
            assert.equal(9, notes.length);
        });
    });

    it('Can split notes from very-close.txt', function() {
        return readFile('./testcase/very-close.txt').then(function (bw) {
            const { space, width } = bw.readStd();
            const notes = bw.getNotes(space, width);
            assert.equal(10, notes.length);
        });
    });

    it('Can split notes from doctor-who-theme.txt', function() {
        return readFile('./testcase/doctor-who-theme.txt').then(function (bw) {
            const { space, width } = bw.readStd();
            const notes = bw.getNotes(space, width);
            assert.equal(84, notes.length);
        });
    });

    it('Can split notes from random.txt', function() {
        return readFile('./testcase/random.txt').then(function (bw) {
            const { space, width } = bw.readStd();
            const notes = bw.getNotes(space, width);
            assert.equal(90, notes.length);
        });
    });
});
