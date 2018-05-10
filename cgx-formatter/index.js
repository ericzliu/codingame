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
            return new Token(TokenType.STRING, buffer);
        } else if (char === 't') {
            const buffer = [];
            while (isBoolean(char)) {
                buffer.push(char);
                char = this.nextChar();
            }
            // To stop the pointer at last char of last token
            this.prevChar();
            return new Token(TokenType.BOOL, buffer);
        } else if (isNumber(char)) {
            const buffer = [];
            while (isNumber(char)) {
                buffer.push(char);
                char = this.nextChar();
            }
            this.prevChar();
            return new Token(TokenType.NUMBER, buffer);
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

module.exports = {
    Scanner: Scanner,
    Token: Token,
    TokenType: TokenType,
    isNullOrUndefined: isNullOrUndefined
};
