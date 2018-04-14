import { readInput, readOut } from '../index';
import { findPath } from '../main';
import { assert } from 'chai';

describe('index', function() {

    function testCase(input, out) {
        return readInput(input).then(input => {
            return readOut(out).then(out => {
                const ans = findPath(input.spots_x, input.spots_y, input.orcs_x, input.orcs_y, input.portals_u, input.portals_v, input.S, input.E);
                assert.deepEqual(out, ans);
            });
        });
    }

    it('read input', function() {
        return readInput('./test/tc01.in').then(function(data) {
            assert.equal(data.S, 0);
            assert.equal(data.E, 3);
            assert.deepEqual(data.spots_x, [1, 2, 2, 3]);
            assert.deepEqual(data.spots_y, [1, 0, 2, 1]);
            assert.deepEqual(data.orcs_x, [ 1 ]);
            assert.deepEqual(data.orcs_y, [ 2 ]);
            assert.deepEqual(data.portals_u, [0, 0, 1, 2]);
            assert.deepEqual(data.portals_v, [1, 2, 3, 3]);
        });
    });

    it('read input no orcs', function() {
        return readInput('./test/tc05.in').then(function(data) {
            assert.equal(data.S, 0);
            assert.equal(data.E, 3);
            assert.equal(data.spots_x.length, 4);
            assert.equal(data.spots_y.length, 4);
            assert.deepEqual(data.orcs_x.length, 0);
            assert.deepEqual(data.orcs_y.length, 0);
            assert.deepEqual(data.portals_u.length, 4);
            assert.deepEqual(data.portals_v.length, 4);
        });        
    });

    it('read out', function() {
        return readOut('./test/tc01.out').then(function(data) {
            assert.deepEqual(data, [0, 1, 3]);
        });
    });

    it('read out (cont.)', function() {
        return readOut('./test/tc04.out').then(function(data) {
            assert.deepEqual(data, 'IMPOSSIBLE');
        });
    });

    it('One Orc', function() {
        return testCase('./test/tc01.in', './test/tc01.out');
    });

    it('Multiple Orcs', function() {
        return testCase('./test/tc02.in', './test/tc02.out');
    });

    it('Many choices', function() {
        return testCase('./test/tc03.in', './test/tc03.out');
    });

    it('Impossible', function() {
        return testCase('./test/tc04.in', './test/tc04.out');
    });

    it('No orcs!', function() {
        return testCase('./test/tc05.in', './test/tc05.out');
    });
});
