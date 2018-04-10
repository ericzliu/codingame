import { Graph, DijkstraExt } from '../graph';
import { assert } from 'chai';

describe('DijkstraExt', function () {
    it('can create', function () {
        let graph = new Graph();
        assert.isObject(graph);
        let dijkstra = new DijkstraExt(graph, [], [], 0, 0, undefined);
        assert.isObject(dijkstra);
    });

    it('all reachable', function () {
        let graph = new Graph(4);
        assert.isObject(graph);
        graph.add(0, 1);
        graph.add(0, 2);
        graph.add(1, 3);
        graph.add(2, 3);
        const fnIsReachable = function (x, y, distance) {
            return true;
        };
        const X = [1, 2, 2, 3];
        const Y = [1, 0, 2, 1];
        let dijkstra = new DijkstraExt(graph, X, Y, 0, 3, fnIsReachable);
        dijkstra.apply();
        assert.equal(0, dijkstra.getDistance(0));
        assert.equal(1, dijkstra.getDistance(1));
        assert.equal(1, dijkstra.getDistance(2));
        assert.equal(2, dijkstra.getDistance(3));
        assert.deepEqual([0, 1, 3], dijkstra.getPath());
    });
    
    it('unreachable in the middle', function () {
        let graph = new Graph(4);
        assert.isObject(graph);
        graph.add(0, 1);
        graph.add(0, 2);
        graph.add(1, 3);
        graph.add(2, 3);
        const X = [1, 2, 2, 3];
        const Y = [1, 0, 2, 1];
        const fnIsReachable = function (x, y, distance) {
            if (x === X[1] && y === Y[1]) {
                return false;
            }
            if (x === X[2] && y === Y[2]) {
                return false;
            }
            return true;
        };
        let dijkstra = new DijkstraExt(graph, X, Y, 0, 3, fnIsReachable);
        dijkstra.apply();
        assert.equal(0, dijkstra.getDistance(0));
        assert.equal(Number.POSITIVE_INFINITY, dijkstra.getDistance(1));
        assert.equal(Number.POSITIVE_INFINITY, dijkstra.getDistance(2));
        assert.equal(Number.POSITIVE_INFINITY, dijkstra.getDistance(3));
    });

    it('unreachable at the end', function () {
        let graph = new Graph(4);
        assert.isObject(graph);
        graph.add(0, 1);
        graph.add(0, 2);
        graph.add(1, 3);
        graph.add(2, 3);
        const X = [1, 2, 2, 3];
        const Y = [1, 0, 2, 1];
        const fnIsReachable = function (x, y, distance) {
            if (x === X[3] && y === Y[3]) {
                return false;
            }
            return true;
        };
        let dijkstra = new DijkstraExt(graph, X, Y, 0, 3, fnIsReachable);
        dijkstra.apply();
        assert.equal(0, dijkstra.getDistance(0));
        assert.equal(1, dijkstra.getDistance(1));
        assert.equal(1, dijkstra.getDistance(2));
        assert.equal(Number.POSITIVE_INFINITY, dijkstra.getDistance(3));
    });

    it('unreachable on one side', function () {
        let graph = new Graph(4);
        assert.isObject(graph);
        graph.add(0, 1);
        graph.add(0, 2);
        graph.add(1, 3);
        graph.add(2, 3);
        const X = [1, 2, 2, 3];
        const Y = [1, 0, 2, 1];
        const fnIsReachable = function (x, y, distance) {
            if (x === X[2] && y === Y[2]) {
                return false;
            }
            return true;
        };
        let dijkstra = new DijkstraExt(graph, X, Y, 0, 3, fnIsReachable);
        dijkstra.apply();
        assert.equal(0, dijkstra.getDistance(0));
        assert.equal(1, dijkstra.getDistance(1));
        assert.equal(Number.POSITIVE_INFINITY, dijkstra.getDistance(2));
        assert.equal(2, dijkstra.getDistance(3));
        assert.deepEqual([0, 1, 3], dijkstra.getPath());
    });
})