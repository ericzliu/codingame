const assert = require('chai').assert;
const fs = require('fs');
const app = require('./index');

function readInput(lines) {
    const inputs = [];
    if (lines.length > 0) {
        let num = parseInt(lines[0].trim());
        let l = 0;
        while (l < num) {
            inputs.push(lines[l + 1]);
            l += 1;
        }
        return inputs;
    }
}

function readFile(path) {
    return new Promise((resolve, reject) => {
        var data = '';
        var rd = fs.createReadStream(path, 'utf8');
        var isFirst = true;
        rd.on('data', function (chunk) {
            data += chunk;
        }).on('end', function () {
            const lines = data.split('\n');
            resolve(readInput(lines));
        }).on('error', function (error) {
            reject(error);
        });
    });
}

describe('Smaller CGX compiler', () => {
    it('scanner next/prev behaves like i++, i--', () => {
        readFile('testcases/block_containing_a_single_value').then(lines => {
            let scanner = new app.Scanner(lines);
            let token = scanner.next();
            assert.equal(app.TokenType.OPEN_PAREN, token.type);
            token = scanner.next();
            assert.equal(app.TokenType.NUMBER, token.type);
            token = scanner.next();
            assert.equal(app.TokenType.CLOSE_PAREN, token.type);
            assert.isTrue(app.isNullOrUndefined(scanner.next()));
            assert.isTrue(app.isNullOrUndefined(scanner.next()));
            token = scanner.prev();
            assert.isTrue(app.isNullOrUndefined(token));
            token = scanner.prev();
            assert.equal(app.TokenType.CLOSE_PAREN, token.type);
            token = scanner.prev();
            assert.equal(app.TokenType.NUMBER, token.type);
            token = scanner.prev();
            assert.equal(app.TokenType.OPEN_PAREN, token.type);
            token = scanner.prev();
            assert.isTrue(app.isNullOrUndefined(token));
            assert.isTrue(app.isNullOrUndefined(scanner.prev()));
            scanner.next();
            token = scanner.next();
            assert.equal(app.TokenType.OPEN_PAREN, token.type);
        });
    });

    it('scanner parse block with multiple values', () => {
        readFile('testcases/block_containing_multiple_values').then(lines => {
            let scanner = new app.Scanner(lines);
            scanner.next(); // (
            let zero = scanner.next();
            scanner.next(); // ;
            let one = scanner.next();
            scanner.next(); // ;
            let two = scanner.next();
            assert.equal('0', zero.chars);
            assert.equal('1', one.chars);
            assert.equal('2', two.chars);
        });
    });
});
