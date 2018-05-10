const assert = require('assert');
const { Molecule, Side, parseInput, makeMat, listTuples, mul, checkTuple, findNullTuple, printResult } = require('./index');

describe('Chemical equation balancing', function () {

    it('Can parse molecule', function () {
        let m;

        m = new Molecule('H', Side.LEFT);
        assert.deepEqual(['H'], m.elements);
        assert.equal(Side.LEFT, m.side);

        m = new Molecule('CO', Side.LEFT);
        assert.deepEqual(['C', 'O'], m.elements);
        assert.equal(Side.LEFT, m.side);
        assert.equal(1, m.count('C'));
        assert.equal(0, m.count('D'));

        m = new Molecule('H12O', Side.LEFT);
        assert.deepEqual(['H', 'O'], m.elements);
        assert.equal(12, m.count('H'));
        assert.equal(1, m.count('O'));

        m = new Molecule('H2PtCl6', Side.LEFT);
        assert.deepEqual(['H', 'Pt', 'Cl'], m.elements);
        assert.equal(2, m.count('H'));
        assert.equal(1, m.count('Pt'));
        assert.equal(6, m.count('Cl'));

    });

    it('can parse formula Photosynthesis', function () {
        const molecules = parseInput('CO2 + H2O -> C6H12O6 + O2');
        assert.equal(4, molecules.length);
        assert.deepEqual(new Molecule('CO2', Side.LEFT), molecules[0]);
        assert.deepEqual(new Molecule('H2O', Side.LEFT), molecules[1]);
        assert.deepEqual(new Molecule('C6H12O6', Side.RIGHT), molecules[2]);
        assert.deepEqual(new Molecule('O2', Side.RIGHT), molecules[3]);
    });

    it('can parse formula Sulfuric Acid', function () {
        const molecules = parseInput('S + HNO3 -> H2SO4 + NO2 + H2O');
        assert.equal(5, molecules.length);
        assert.deepEqual(new Molecule('S', Side.LEFT), molecules[0]);
        assert.deepEqual(new Molecule('HNO3', Side.LEFT), molecules[1]);
        assert.deepEqual(new Molecule('H2SO4', Side.RIGHT), molecules[2]);
        assert.deepEqual(new Molecule('NO2', Side.RIGHT), molecules[3]);
        assert.deepEqual(new Molecule('H2O', Side.RIGHT), molecules[4]);
    });

    it('can fill matrix for Photosynthesis', function () {
        const molecules = parseInput('CO2 + H2O -> C6H12O6 + O2');
        const mat = makeMat(molecules);
        assert.deepEqual([1, 0, -6, 0], mat.get('C'));
        assert.deepEqual([0, 2, -12, 0], mat.get('H'));
        assert.deepEqual([2, 1, -6, -2], mat.get('O'));
    });

    it('can fill matrix for Uncommon Elements', function () {
        const molecules = parseInput('Rb + HNO3 -> RbNO3 + H2');
        const mat = makeMat(molecules);
        assert.deepEqual([1, 0, -1, 0], mat.get('Rb'));
        assert.deepEqual([0, 1, 0, -2], mat.get('H'));
        assert.deepEqual([0, 1, -1, 0], mat.get('N'));
        assert.deepEqual([0, 3, -3, 0], mat.get('O'));
    });

    it('can list tuples', function () {
        let tuples;
        tuples = Array.from(listTuples(1));
        assert.deepEqual([[1], [2], [3], [4], [5], [6]], tuples);

        tuples = Array.from(listTuples(2));
        assert.deepEqual(
            [[1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6]],
            [tuples[0], tuples[1], tuples[2], tuples[3], tuples[4], tuples[5]]);

        tuples = Array.from(listTuples(3));
        assert.deepEqual(
            [[1, 2, 1], [1, 2, 2], [1, 2, 3], [1, 2, 4], [1, 2, 5], [1, 2, 6]],
            [tuples[6], tuples[7], tuples[8], tuples[9], tuples[10], tuples[11]]);
    });

    it('can find tuple', function () {
        assert.equal(11, mul([1, 2], [3, 4]));
        assert.equal(-5, mul([1, 2], [3, -4]));

        var molecules;
        var mat;
        var tuple;

        molecules = parseInput('CO2 + H2O -> C6H12O6 + O2');
        mat = makeMat(molecules);
        assert.equal(true, checkTuple(mat, [6, 6, 1, 6]));
        tuple = findNullTuple(mat);
        assert.deepEqual([6, 6, 1, 6], tuple);

        molecules = parseInput('NaOH + H2CO3 -> Na2CO3 + H2O');
        mat = makeMat(molecules);
        assert.equal(true, checkTuple(mat, [2, 1, 1, 2]));
        tuple = findNullTuple(mat);
        assert.deepEqual([2, 1, 1, 2], tuple);
    });


    it('can print result', function () {
        var molecules;
        var out;

        molecules = parseInput('CO2 + H2O -> C6H12O6 + O2');
        out = printResult(molecules, [6, 6, 1, 6]);
        assert.deepEqual('6CO2 + 6H2O -> C6H12O6 + 6O2', out);

        molecules = parseInput('NaOH + H2CO3 -> Na2CO3 + H2O');
        out = printResult(molecules, [2, 1, 1, 2]);
        assert.deepEqual('2NaOH + H2CO3 -> Na2CO3 + 2H2O', out);
    });

});
