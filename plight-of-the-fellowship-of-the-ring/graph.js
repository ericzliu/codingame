import { PriorityQueue } from './priority-queue';
import { remove } from './utility';

export class Graph {
    constructor(N) {
        this.N = N;
        this.next = new Array(N);
        for (let i = 0; i < this.next.length; i++) {
            this.next[i] = new Array();
        }
    }

    add(u, v) {
        this.next[u].push(v);
        this.next[v].push(u);
    }

    connected(u) {
        return this.next[u];
    }

    getNumNode() {
        return this.N;
    }
}

export class DijkstraExt {
    constructor(graph, X, Y, S, T, fnIsNodeReachable) {
        this.graph = graph;
        const N = this.graph.getNumNode();
        this.distance = new Array(N);
        this.distance.fill(Number.POSITIVE_INFINITY);
        this.prev = new Array(N);
        this.prev.fill(-1);
        this.X = X;
        this.Y = Y;
        this.S = S;
        this.T = T;
        this.fnIsNodeReachable = fnIsNodeReachable;
    }

    compareNode(u, v) {
        const distU = this.getDistance(u);
        const distV = this.getDistance(v);
        if (distU < distV) {
            return -1;
        } else if (distU > distV) {
            return 1;
        }
        return 0;
    }

    apply() {
        this.distance[this.S] = 0;
        const comparator = this.compareNode.bind(this);
        const pq = new PriorityQueue(comparator);
        for (let i = 0; i < this.graph.getNumNode(); i++) {
            pq.insert(i);
        }
        const visited = new Set();
        while (!pq.empty() && !visited.has(this.T)) {
            const node = pq.pop();
            if (visited.has(node)) {
                continue;
            } else {
                visited.add(node);
            }
            const newDistance = this.distance[node] + 1;
            const nextNodes = this.graph.connected(node);
            for (let i = 0; i < nextNodes.length; i++) {
                const nextNode = nextNodes[i];
                if (!visited.has(nextNode) && newDistance < this.distance[nextNode]) {
                    if (this.fnIsNodeReachable(this.X[nextNode], this.Y[nextNode], newDistance)) {
                        this.distance[nextNode] = newDistance;
                        this.prev[nextNode] = node;
                        pq.delete(nextNode);
                        pq.insert(nextNode);
                    }
                }
            }
        }
    }

    getDistance(u) {
        return this.distance[u];
    }

    getPrev(u) {
        return this.prev[u];
    }

    getPath() {
        let u = this.T;
        let data = [];
        while (u != -1) {
            data.push(u);
            u = this.getPrev(u);
        }
        data.reverse();
        return data;
    }
}

