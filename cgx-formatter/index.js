const EOL = '\r\n';

const TokenType = Object.freeze({
    UNKNOWN: 0, // Usefule if the token type is defined later than calling the token constructor
    SEMICOLON: 1,
    OPEN_PAREN: 2,
    CLOSE_PAREN: 3,
    NUMBER: 4,
    BOOL: 5,
    NULL: 6,
    STRING: 7,
    ASSIGN: 8
});

function isWhitespace(char) {
    return (char === ' ' || char === '\t' || char === '\r' || char === '\n');
}

function isNullOrUndefined(x) {
    return typeof x === 'undefined' || x === null;
}

function isBoolean(char) {
    const BOOL = 'truefalse';
    return (BOOL.indexOf(char) >= 0);
}

function isNumber(char) {
    return char >= '0' && char <= '9';
}

class Token {
    constructor(type, chars) {
        this.type = type;
        this.chars = chars;
    }
}

class Scanner {
    constructor(lines) {
        this.lines = lines.join('');
        this.l = 0;
        this.tokens = [];
        this.t = 0;
    }

    next() {
        while (this.t >= this.tokens.length) {
            let token = this.parseNext();
            if (!isNullOrUndefined(token)) {
                this.tokens.push(token);
            } else {
                break;
            }
        }
        if (this.t < this.tokens.length)
            return this.tokens[this.t++];
    }

    prev() {
        if (this.t >= 0) {
            const curr = this.tokens[this.t];
            this.t -= 1;
            return curr;
        }
    }

    // Read next token from lines
    parseNext() {
        let char;

        for (char = this.nextChar(); isWhitespace(char); char = this.nextChar()) {
        };

        if (isNullOrUndefined(char)) {
            return;
        }

        const APOSTROPHE = '\'';
        if (char === ';') {
            return new Token(TokenType.SEMICOLON, char);
        } else if (char === '(') {
            return new Token(TokenType.OPEN_PAREN, char);
        } else if (char === ')') {
            return new Token(TokenType.CLOSE_PAREN, char);
        } else if (char === '=') {
            return new Token(TokenType.ASSIGN, char);
        } else if (char === APOSTROPHE) {
            const buffer = [];
            buffer.push(char);
            while ((char = this.nextChar()) != APOSTROPHE && !isNullOrUndefined(char)) {
                buffer.push(char);
            }
            if (char != APOSTROPHE) throw new Error(`Can't find apostrophe ${APOSTROPHE}.`);
            buffer.push(char);
            return new Token(TokenType.STRING, buffer.join(''));
        } else if (char === 't' || char === 'f') {
            const buffer = [];
            while (isBoolean(char)) {
                buffer.push(char);
                char = this.nextChar();
            }
            // To stop the pointer at last char of last token
            this.prevChar();
            return new Token(TokenType.BOOL, buffer.join(''));
        } else if (isNumber(char)) {
            const buffer = [];
            while (isNumber(char)) {
                buffer.push(char);
                char = this.nextChar();
            }
            this.prevChar();
            return new Token(TokenType.NUMBER, buffer.join(''));
        } else {
            throw new Error(`Unrecognised character ${char}`);
        }
    }

    nextChar() {
        if (this.l < this.lines.length) {
            return this.lines[this.l++];
        }
    }

    prevChar() {
        if (this.l >= 1) {
            this.l -= 1;
        }
    }
}

function whitespaces(indent) {
    var str = '';
    for (var i = 0; i < indent; i += 1) {
        str = str.concat(' ');
    }
    return str;
}

class Element {
    toString() {
        return '';
    }

    format(indent) {
        return '';
    }
}

class Primitive extends Element {
    constructor(token) {
        super();
        this.token = token;
    }

    toString() {
        let str = '';
        switch (this.token.type) {
            case TokenType.NUMBER:
                str = this.token.chars;
                break;
            case TokenType.BOOL:
                str = this.token.chars;
                break;
            case TokenType.STRING:
                str = this.token.chars;
                break;
        }
        return str;
    }

    format(indent) {
        let str = whitespaces(indent);
        str = str.concat(this.toString());
        return str;
    }
}

class NullElement extends Primitive {
    constructor() {
        super(undefined);
    }

    toString() {
        return '';
    }

    format(indent) {
        return '';
    }
}

class Block extends Element {
    constructor(elements) {
        super();
        this.elements = elements;
    }

    toString() {
        let str = '(';
        let isFirst = true;
        for (let element of this.elements) {
            if (isFirst) {
                isFirst = false;
            } else {
                str += ';';
            }
            str += element.toString();
        }
        str += ')';
        return str;
    }

    format(indent) {
        let str = whitespaces(indent) + '(' + EOL;
        const childIndent = indent + 4;
        let isFirst = true;
        for (var i = 0; i < this.elements.length; i += 1) {
            const element = this.elements[i];
            str = str.concat(element.format(childIndent));
            if (i < (this.elements.length - 1)) {
                str = str.concat(';');
            }
            str = str.concat(EOL);
        }
        str = str.concat(whitespaces(indent) + ')');
        return str;
    }
}

class KeyValue extends Element {
    constructor(key, value) {
        super();
        this.key = key;
        this.value = value;
    }

    toString() {
        let str = this.key.toString();
        str += '=';
        str += this.value.toString();
        return str;
    }

    format(indent) {
        let str = whitespaces(indent);
        str = str.concat(this.key.toString() + '=');
        if (this.value instanceof Block) {
            str = str.concat(EOL);
            str = str.concat(this.value.format(indent));
        } else if (this.value instanceof NullElement) {

        } else if (this.value instanceof Primitive) {
            str = str.concat(this.value.toString());
        }
        return str;
    }
}

function parseElement(scanner) {
    let token = scanner.next();
    if (isNullOrUndefined(token)) {
        return new NullElement();
    }
    if (token.type === TokenType.OPEN_PAREN) {
        scanner.prev();
        return parseBlock(scanner);
    } else if (token.type === TokenType.STRING) {
        let suiv = scanner.next();
        if (!isNullOrUndefined(suiv) && suiv.type === TokenType.ASSIGN) {
            scanner.prev();
            scanner.prev();
            return parseKeyValue(scanner);
        } else {
            if (isNullOrUndefined(suiv)) {
                scanner.prev();
            } else {
                scanner.prev();
                scanner.prev();
            }
            return parsePrimitive(scanner);
        }
    } else {
        scanner.prev();
        return parsePrimitive(scanner);
    }
}

function parseBlock(scanner) {
    const open = scanner.next();
    if (open.type === TokenType.OPEN_PAREN) {
        const elements = [];
        while (true) {
            let token = scanner.next();
            if (token.type === TokenType.CLOSE_PAREN) {
                return new Block(elements);
            } else {
                scanner.prev();
                let element = parseElement(scanner);
                if (isNullOrUndefined(element)) {
                    return;
                }
                if (!(element instanceof NullElement)) {
                    elements.push(element);
                }
                token = scanner.next();
                if (token.type === TokenType.SEMICOLON) {
                    continue;
                } else if (token.type === TokenType.CLOSE_PAREN) {
                    return new Block(elements);
                } else {
                    throw new Error('Syntax error in block');
                }
            }
        }
    }
}

function parsePrimitive(scanner) {
    const token = scanner.next();
    let isPrimitive = (token.type === TokenType.NUMBER);
    isPrimitive = isPrimitive || (token.type === TokenType.BOOL);
    isPrimitive = isPrimitive || (token.type === TokenType.STRING);
    if (isPrimitive) {
        return new Primitive(token);
    } else {
        scanner.prev();
        return new NullElement();
    }
}

function parseKeyValue(scanner) {
    const key = scanner.next();
    if (key.type === TokenType.STRING) {
        const assign = scanner.next();
        if (assign.type === TokenType.ASSIGN) {
            const token = scanner.next();
            if (isNullOrUndefined(token)) {
                return new KeyValue(new Primitive(key), new NullElement());
            }
            if (token.type === TokenType.OPEN_PAREN) {
                scanner.prev();
                const block = parseBlock(scanner);
                return new KeyValue(new Primitive(key), block);
            } else {
                scanner.prev();
                const primitive = parsePrimitive(scanner);
                return new KeyValue(new Primitive(key), primitive);
            }
        }
    }
}

module.exports = {
    Scanner: Scanner,
    Token: Token,
    TokenType: TokenType,
    isNullOrUndefined: isNullOrUndefined,
    Element: Element,
    Primitive: Primitive,
    NullElement: NullElement,
    Block: Block,
    KeyValue: KeyValue,
    parseElement: parseElement,
    parseBlock: parseBlock,
    parsePrimitive: parsePrimitive,
    parseKeyValue: parseKeyValue
};
