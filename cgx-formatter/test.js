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

function readAnswer(path) {
    return new Promise((resolve, reject) => {
        var data = '';
        var rd = fs.createReadStream(path, 'utf8');
        var isFirst = true;
        rd.on('data', function (chunk) {
            data += chunk;
        }).on('end', function () {
            resolve(data);
        }).on('error', function (error) {
            reject(error);
        });
    });    
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
        return readFile('testcases/block_containing_a_single_value').then(lines => {
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
        return readFile('testcases/block_containing_multiple_values').then(lines => {
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

    it('scanner parse simple string', () => {
        return readFile('testcases/simple_string_of_characters_which_must_not_be_modified').then(lines => {
            let scanner = new app.Scanner(lines);
            let token = scanner.next();
            assert.equal(token.type, app.TokenType.STRING);
            assert.deepEqual(token.chars, "' Content with spaces and	tabs'");
        });
    });

    it('parser can parse primitive string', () => {
        return readFile('testcases/simple_string_of_characters_which_must_not_be_modified').then(lines => {
            let scanner = new app.Scanner(lines);
            let element = app.parseElement(scanner);
            assert.isTrue(element instanceof app.Primitive);
            assert.deepEqual(element.token.chars, "' Content with spaces and	tabs'");
        });
    });

    it('parser can parse nested blocks', () => {
        return readFile('testcases/nested_blocks').then(lines => {
            const scanner = new app.Scanner(lines);
            const element = app.parseElement(scanner);
            assert.isTrue(element instanceof app.Block);
            const elements = element.elements;
            assert.isTrue(elements[0] instanceof app.Block);
            assert.equal(elements[0].elements[0].token.type, app.TokenType.BOOL);
        });
    });

    it('parser can parse empty blocks', () => {
        return readFile('testcases/empty_block').then(lines => {
            const scanner = new app.Scanner(lines);
            const element = app.parseElement(scanner);
            assert.isTrue(element instanceof app.Block);
            const elements = element.elements;
            assert.equal(elements.length, 0);
        });
    });

    it('parser can parse block_with_several_key_value', () => {
        return readFile('testcases/block_with_several_key_value').then(lines => {
            const scanner = new app.Scanner(lines);
            const element = app.parseElement(scanner);
            assert.isTrue(element instanceof app.Block);
            const elements = element.elements;
            assert.equal(elements.length, 4);
            assert.isTrue(elements[0] instanceof app.KeyValue);
            assert.isTrue(elements[1] instanceof app.KeyValue);
            assert.isTrue(elements[2] instanceof app.Primitive);
            assert.isTrue(elements[3] instanceof app.KeyValue);
            assert.equal(elements[0].toString(), "'k1'='v1'");
            assert.equal(elements[2].toString(), '123');
        });
    });

    it('parser can parse example_provided', () => {
        return readFile('testcases/example_provided').then(lines => {
            const scanner = new app.Scanner(lines);
            const element = app.parseElement(scanner);
            assert.isTrue(element instanceof app.KeyValue);
            assert.isTrue(element.value instanceof app.Block);
            const value = element.value;
            assert.equal(value.elements.length, 3);
            const one = value.elements[0];
            const two = value.elements[1];
            const three = value.elements[2];
            assert.isTrue(one instanceof app.Block);
            assert.equal(one.elements.length, 3);
            assert.isTrue(one.elements[2] instanceof app.KeyValue);
            assert.isTrue(one.elements[2].value instanceof app.Block);
            const str = element.toString();
            assert.equal(str, "'users'=(('id'=10;'name'='Serge';'roles'=('visitor';'moderator'));('id'=11;'name'='Biales');true)");
        });
    });

    it('format block_containing_a_single_value.out', () => {
        return readFile('testcases/block_containing_a_single_value').then(lines => {
            const scanner = new app.Scanner(lines);
            const element = app.parseElement(scanner);
            return readAnswer('testcases/block_containing_a_single_value.out').then(data => {
                const output = element.format(0);
                assert.equal(output, data.trim());
            });
        });
    });
    
    it('format block_containing_multiple_values', () => {
        return readFile('testcases/block_containing_multiple_values').then(lines => {
            const scanner = new app.Scanner(lines);
            const element = app.parseElement(scanner);
            return readAnswer('testcases/block_containing_multiple_values.out').then(data => {
                const output = element.format(0);
                assert.equal(output, data.trim());
            });
        });
    });
    
    it('format block_with_several_key_value', () => {
        return readFile('testcases/block_with_several_key_value').then(lines => {
            const scanner = new app.Scanner(lines);
            const element = app.parseElement(scanner);
            return readAnswer('testcases/block_with_several_key_value.out').then(data => {
                const output = element.format(0);
                assert.equal(output, data.trim());
            });
        });
    });

    it('format empty_block', () => {
        return readFile('testcases/empty_block').then(lines => {
            const scanner = new app.Scanner(lines);
            const element = app.parseElement(scanner);
            return readAnswer('testcases/empty_block.out').then(data => {
                const output = element.format(0);
                assert.equal(output, data.trim());
            });
        });
    });

    it('format example_provided', () => {
        return readFile('testcases/example_provided').then(lines => {
            const scanner = new app.Scanner(lines);
            const element = app.parseElement(scanner);
            return readAnswer('testcases/example_provided.out').then(data => {
                const output = element.format(0);
                assert.equal(output, data.trim());
            });
        });
    });

    it('format full_example', () => {
        return readFile('testcases/full_example').then(lines => {
            const scanner = new app.Scanner(lines);
            const element = app.parseElement(scanner);
            return readAnswer('testcases/full_example.out').then(data => {
                const output = element.format(0);
                assert.equal(output, data.trim());
            });
        });
    });

    it('format numerous_overlaps', () => {
        return readFile('testcases/numerous_overlaps').then(lines => {
            const scanner = new app.Scanner(lines);
            const element = app.parseElement(scanner);
            return readAnswer('testcases/numerous_overlaps.out').then(data => {
                const output = element.format(0);
                assert.equal(output, data.trim());
            });
        });
    });
});
