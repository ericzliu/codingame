const Side = Object.freeze({ LEFT: 0, RIGHT: 1 });

function isUpperCase(char) {
    return char >= 'A' && char <= 'Z';
}

function isLowerCase(char) {
    return char >= 'a' && char <= 'z';
}

function isNumber(char) {
    return char >= '0' && char <= '9';
}

class Molecule {
    constructor(expr, side) {
        this._expr = expr;
        this._elements = new Array();
        this._numbers = new Array();
        this._side = side;
        let char = '';
        let num = '';
        for (let i = 0; i < expr.length; i += 1) {
            let c = expr[i];
            if (isUpperCase(c)) {
                if (char) {
                    let count = num ? parseInt(num) : 1;
                    this._elements.push(char);
                    this._numbers.push(count);
                    char = '';
                    num = '';
                }
                char = char.concat(c);
            } else if (isLowerCase(c)) {
                char = char.concat(c);
            } else if (isNumber(c)) {
                num = num.concat(c);
            }
        }
        if (char) {
            let count = num ? parseInt(num) : 1;
            this._elements.push(char);
            this._numbers.push(count);
        }
    }

    get elements() {
        return this._elements;
    }

    get side() {
        return this._side;
    }

    get expr() {
        return this._expr;
    }

    count(element) {
        for (let i = 0; i < this._elements.length; i += 1) {
            if (this._elements[i] === element) {
                return this._numbers[i];
            }
        }
        return 0;
    }
}

function parseInput(formula) {
    let i = 0;
    let token = '';
    let side = Side.LEFT;
    let molecules = new Array();
    while (i < formula.length) {
        if (isUpperCase(formula[i])) {
            while (isUpperCase(formula[i]) || isLowerCase(formula[i]) || isNumber(formula[i])) {
                token = token.concat(formula[i]);
                i += 1;
            }
            molecules.push(new Molecule(token, side));
        } else if (formula[i] === ' ' || formula[i] === '+') {
            token = '';
            i += 1;
        } else if (formula[i] === '-') {
            side = Side.RIGHT;
            token = '';
            i += 2;
        }
    }
    return molecules;
}

function makeMat(molecules) {
    const reducer = function (accumulator, molecule) {
        const elements = molecule.elements;
        for (let element of elements) {
            accumulator.add(element);
        }
        return accumulator;
    };
    const mat = new Map();
    const elements = molecules.reduce(reducer, new Set());
    for (let element of elements.keys()) {
        const coef = new Array(molecules.length);
        for (let i = 0; i < molecules.length; i += 1) {
            coef[i] = molecules[i].count(element);
            if (molecules[i].side === Side.RIGHT) {
                coef[i] = -coef[i];
            }
        }
        mat.set(element, coef);
    }
    return mat;
}

function* listTuples(n) {
    if (n === 1) {
        yield* [[1], [2], [3], [4], [5], [6]];
    } else {
        const cache = Array.from(listTuples(n - 1));
        for (let i = 1; i <= 6; i += 1) {
            for (let tup of cache) {
                yield [i].concat(tup);
            }
        }
    }
}

function mul(v1, v2) {
    let sum = 0;
    for (let i = 0; i < v1.length; i += 1) {
        sum += v1[i] * v2[i];
    }
    return sum;
}

function checkTuple(mat, tuple) {
    for (let [element, coef] of mat) {
        if (mul(coef, tuple) !== 0) {
            return false;
        }
    }
    return true;
}

function findNullTuple(mat) {
    let tuples = listTuples(mat.values().next().value.length);
    for (let tuple of tuples) {
        if (checkTuple(mat, tuple)) {
            return tuple;
        }
    }
    return undefined;
}

function printResult(molecules, tuple) {
    var out = '';
    for (let i = 0; i < molecules.length; i += 1) {
        if (tuple[i] > 1) {
            out = out.concat(tuple[i]);
        }
        out = out.concat(molecules[i].expr);
        if (i !== molecules.length - 1) {
            if (molecules[i].side === Side.LEFT && molecules[i + 1].side === Side.RIGHT) {
                out = out.concat(' -> ');
            } else {
                out = out.concat(' + ');
            }
        }
    }
    return out;
}

module.exports.Molecule = Molecule;
module.exports.Side = Side;
module.exports.parseInput = parseInput;
module.exports.makeMat = makeMat;
module.exports.listTuples = listTuples;
module.exports.mul = mul;
module.exports.checkTuple = checkTuple;
module.exports.findNullTuple = findNullTuple;
module.exports.printResult = printResult;
