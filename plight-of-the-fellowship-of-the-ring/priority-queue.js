import { isUndefinedOrNull } from './utility';

export class PriorityQueue {
    constructor(comparator) {
        this.comparator = comparator;
        this.elements = [];
    }

    empty() {
        if (this.elements.length === 0) {
            return true;
        }
        return false;
    }

    peek() {
        if (this.empty()) {
            throw new Error('PriorityQueue is empty');
        }
        return this.elements[0];
    }

    insert(element) {
        this.elements.push(element);
        this.siftUp(this.elements.length - 1);
    }

    delete(element) {
        const i = this.elements.indexOf(element);
        if (i > -1) {
            if (this.elements.length - 1 === i) {
                this.elements.pop();
            } else {
                this.swap(i, this.elements.length - 1);
                this.elements.pop();
                this.siftUp(i);
                this.siftDown(i);
            }
        }
    }

    pop() {
        const answer = this.peek();
        const last = this.elements.pop();
        if (!this.empty()) {
            this.elements[0] = last;
            this.siftDown(0);
        }
        return answer;
    }

    siftUp(i) {
        while (i > 0 && this.smallerIndex(i, this.getParentIndex(i)) === i) {
            const p = this.getParentIndex(i);
            this.swap(i, p);
            i = p;
        }
    }

    smallerIndex(i, j) {
        const answer = this.comparator(this.elements[i], this.elements[j]);
        if (answer < 0) {
            return i;
        }
        return j;
    }

    siftDown(i) {
        while (i < this.elements.length) {
            const j = this.getLeftChildIndex(i);
            if (isUndefinedOrNull(j)) {
                break;
            }
            const k = this.getRightChildIndex(i);
            const l = isUndefinedOrNull(k) ? j : this.smallerIndex(j, k);

            if (this.smallerIndex(l, i) === l) {
                this.swap(l, i);
                i = l;
            } else {
                break;
            }
        }
    }

    getParentIndex(i) {
        if (i === 0) {
            return undefined;
        }
        return ((i - 1) / 2) >> 0;
    }

    getLeftChildIndex(i) {
        const answer = (i * 2) + 1;
        if (answer >= this.elements.length) {
            return undefined;
        }
        return answer;
    }

    getRightChildIndex(i) {
        const answer = (i * 2) + 2;
        if (answer >= this.elements.length) {
            return undefined;
        }
        return answer;
    }

    swap(i, j) {
        const temp = this.elements[i];
        this.elements[i] = this.elements[j];
        this.elements[j] = temp;
    }
}
