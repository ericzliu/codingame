import { PriorityQueue } from '../priority-queue';
import { assert } from 'chai';

describe('PriorityQueue', function () {
    let comparator = function (p, q) {
        if (p < q) {
            return -1;
        }
        if (p > q) {
            return 1;
        }
        return 0;
    };

    it('can create', function () {
        let pq = new PriorityQueue();
        assert.isObject(pq);
    });

    it('can add one element and then pop', function () {
        let pq = new PriorityQueue(comparator);
        pq.insert(1);
        assert.isFalse(pq.empty());
        assert.equal(pq.peek(), 1);
        assert.equal(pq.pop(), 1);
        assert.isTrue(pq.empty());
    });

    it('sift up should work', function () {
        let pq = new PriorityQueue(comparator);
        pq.insert(1);
        pq.insert(0);
        let x = pq.pop();
        let y = pq.pop();
        assert.equal(x, 0);
        assert.equal(y, 1);
        assert.isTrue(pq.empty());
    });

    it('sift down should work', function () {
        let pq = new PriorityQueue(comparator);
        pq.insert(1);
        pq.insert(2);
        pq.insert(3);
        pq.insert(4);
        assert.deepEqual(pq.elements, [1, 2, 3, 4]);
        let x = pq.pop();
        assert.equal(x, 1);
        assert.deepEqual(pq.elements, [2, 4, 3]);
        assert.equal(pq.pop(), 2);
        assert.deepEqual(pq.elements, [3, 4]);
        assert.equal(pq.pop(), 3);
        assert.deepEqual(pq.elements, [4]);
        assert.equal(pq.pop(), 4);
        assert.isTrue(pq.empty());
    });

    it('delete should work', function () {
        let pq = new PriorityQueue(comparator);
        pq.insert(1);
        pq.insert(2);
        pq.insert(3);
        pq.insert(4);
        assert.deepEqual(pq.elements, [1, 2, 3, 4]);
        pq.delete(4);
        assert.deepEqual(pq.elements, [1, 2, 3]);
        pq.insert(4);
        pq.delete(2);
        assert.deepEqual(pq.elements, [1, 4, 3]);
    })

    it('delete with sift down should work', function () {
        let pq = new PriorityQueue(comparator);
        pq.insert(1);
        pq.insert(2);
        pq.insert(3);
        pq.insert(4);
        pq.insert(5);
        pq.insert(6);
        pq.insert(7);
        pq.delete(3);
        assert.deepEqual(pq.elements, [1, 2, 6, 4, 5, 7]);

        pq = new PriorityQueue(comparator);
        pq.insert(1);
        pq.insert(2);
        pq.insert(3);
        pq.insert(4);
        pq.insert(5);
        pq.insert(6);
        pq.insert(7);
        pq.delete(2);
        assert.deepEqual(pq.elements, [1, 4, 3, 7, 5, 6]);
    })

    it('delete with sift up should work', function () {
        let pq = new PriorityQueue(comparator);
        pq.insert(1);
        pq.insert(6);
        pq.insert(2);
        pq.insert(7);
        pq.insert(8);
        pq.insert(3);
        pq.delete(7);
        assert.deepEqual(pq.elements, [1, 3, 2, 6, 8]);
    })

    it('delete only element from priority queue should work', function() {
        let pq = new PriorityQueue(comparator);
        pq.insert(1);
        pq.delete(1);
        assert.deepEqual(pq.elements, []);
    })
});
