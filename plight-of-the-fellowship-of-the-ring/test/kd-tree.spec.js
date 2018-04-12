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

    it('select should work', function () {
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

    it('split should work', function () {
        const api = new KdTree();
        const p0 = new Point(0, 0);
        const p1 = new Point(1, 1);
        const p2 = new Point(2, 2);
        const p3 = new Point(3, 1);
        let points = [p0, p1, p2, p3];
        // Split over the whole array should work
        let ans = api.split(points, 0, 4, p2, axis_h);
        assert.equal(ans, 2);
        assert.deepEqual(points, [p0, p1, p2, p3]);

        // Split on vertical direction should work
        ans = api.split(points, 0, 4, p2, axis_v);
        assert.equal(ans, 3);
        assert.deepEqual(points, [p0, p1, p3, p2]);
    });

    it('split should work (cont.)', function () {
        const api = new KdTree();
        const p0 = new Point(0, 1);
        const p1 = new Point(1, 1);
        const p2 = new Point(2, 2);
        const p3 = new Point(0, 0);
        const p4 = new Point(3, 0);
        let points = [p0, p1, p2, p3, p4];
        // Split over the whole array should work
        let ans = api.split(points, 0, 5, p2, axis_h);
        assert.equal(ans, 3);
        assert.deepEqual(points, [p0, p1, p3, p2, p4]);

        points = [p0, p1, p2, p3, p4];
        ans = api.split(points, 0, 5, p0, axis_v);
        assert.equal(ans, 2);
        assert.deepEqual(points, [p4, p3, p0, p1, p2]);

        points = [p0, p1, p2, p3, p4];
        ans = api.split(points, 0, 5, p1, axis_v);
        assert.equal(ans, 2);
        assert.deepEqual(points, [p4, p3, p1, p0, p2]);
    });

    it('split should work (cont.)(cont.)', function () {
        const api = new KdTree();
        const p0 = new Point(0, 1);
        const p1 = new Point(1, 1);
        const p2 = new Point(2, 2);
        const p3 = new Point(0, 0);
        const p4 = new Point(3, 0);
        const p5 = new Point(-1, -1);
        let points = [p0, p1, p2, p3, p4, p5];
        // Split over the whole array should work
        let ans = api.split(points, 0, 5, p2, axis_h);
        assert.equal(ans, 3);
        assert.deepEqual(points, [p0, p1, p3, p2, p4, p5]);

        points = [p0, p1, p2, p3, p4, p5];
        ans = api.split(points, 0, 5, p0, axis_v);
        assert.equal(ans, 2);
        assert.deepEqual(points, [p4, p3, p0, p1, p2, p5]);

        points = [p0, p1, p2, p3, p4, p5];
        ans = api.split(points, 0, 5, p1, axis_v);
        assert.equal(ans, 2);
        assert.deepEqual(points, [p4, p3, p1, p0, p2, p5]);
    });

    it('split should work (cont.)(cont.)(cont.)', function () {
        const api = new KdTree();
        const p0 = new Point(9, 9);
        const p1 = new Point(0, 1);
        const p2 = new Point(1, 1);
        const p3 = new Point(2, 2);
        const p4 = new Point(0, 0);
        const p5 = new Point(3, 0);
        const p6 = new Point(-1, -1);
        let points = [p0, p1, p2, p3, p4, p5, p6];
        // Split over the whole array should work
        let ans = api.split(points, 1, 6, p3, axis_h);
        assert.equal(ans, 4);
        assert.deepEqual(points, [p0, p1, p2, p4, p3, p5, p6]);

        points = [p0, p1, p2, p3, p4, p5, p6];
        ans = api.split(points, 1, 6, p1, axis_v);
        assert.equal(ans, 3);
        assert.deepEqual(points, [p0, p5, p4, p1, p2, p3, p6]);

        points = [p0, p1, p2, p3, p4, p5, p6];
        ans = api.split(points, 1, 6, p2, axis_v);
        assert.equal(ans, 3);
        assert.deepEqual(points, [p0, p5, p4, p2, p1, p3, p6]);
        
    });

    it('insert KdTree should work', function() {
        const api = new KdTree();
        const p0 = new Point(0, 0);
        const p1 = new Point(-3, -3);
        const p2 = new Point(3, 3);
        let tree = api.insert([p0, p1, p2], 0, 3, axis_v);
        assert.equal(tree.x, p0.x);
        assert.equal(tree.y, p0.y);
        assert.equal(tree.split_axis, axis_v);
        assert.equal(tree.left.x, p1.x);
        assert.equal(tree.left.y, p1.y);
        assert.equal(tree.left.split_axis, axis_h);
        assert.equal(tree.right.x, p2.x);
        assert.equal(tree.right.y, p2.y);
        assert.equal(tree.right.split_axis, axis_h);
        assert.isUndefined(tree.left.left);
        assert.isUndefined(tree.left.right);
        assert.isUndefined(tree.right.left);
        assert.isUndefined(tree.right.right);
    });
});
