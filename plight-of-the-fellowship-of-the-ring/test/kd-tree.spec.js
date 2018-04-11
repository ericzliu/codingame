import { KdTree, axis_h, axis_v, swap, Point } from '../kd-tree';
import { assert } from 'chai';

describe('2d KdTree', function () {
    it('compare symbol', function () {
        const h = axis_h;
        assert.equal(h, axis_h);
        assert.isTrue(h === axis_h);
    });

    it('array swap', function () {
        const array = [1, 2];
        swap(array, 0, 0);
        assert.deepEqual(array, [1, 2]);
        swap(array, 0, 1);
        assert.deepEqual(array, [2, 1]);
    });

    it('Points array indexOf works', function () {
        const p1 = new Point(1, 1);
        const array = [p1, new Point(0, 0)];
        const i = array.indexOf(p1);
        assert.equal(i, 0);
        const j = array.indexOf(new Point(1, 1));
        assert.equal(j, -1);
    });

    it('select should work', function() {
        const api = new KdTree();
        const p0 = new Point(0, 0);
        const p1 = new Point(1, 1);
        const p2 = new Point(2, 2);
        const p3 = new Point(3, 1);
        let points = [p0, p1, p2, p3];
        let p = api.select(points, 0, 1, axis_h);
        assert.equal(p, p0);
        p = api.select(points, 0, 3, axis_h);
        assert.equal(p, p1);
        p = api.select(points, 0, 4, axis_h);
        assert.equal(p, p2);
        p = api.select(points, 0, 4, axis_v);
        assert.equal(p, p3);
    });
});