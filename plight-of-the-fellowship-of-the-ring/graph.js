export class Graph {
    constructor(N) {
        this.next = new Array(N);
        for (let i = 0; i < array.length; i++) {
            this.next[i] = new Array();
        }
    }

    add(u, v) {
        this.next[u].push(v);
        this.next[v].push(u);
    }

    next(u) {
        return this.next[u];
    }
}


