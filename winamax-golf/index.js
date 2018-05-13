class Ball {
    constructor(x, y, shotCount) {
        this.x = x;
        this.y = y;
        this.shotCount = shotCount;
    }
}

class Node {
    constructor(state, parent) {
        this.state = state;
        this.parent = parent;
    }
}

function isNullOrUndefined(x) {
    return typeof x === 'undefined' || x === null;
}

function isHorizontal(s, t) {
    return (s.y === t.y);
}

function isVertical(s, t) {
    return (s.x === t.x);
}


/**
 * two paths x and y cross each other
 * @param {Node<Ball>} x 
 * @param {Node<Ball>} y 
 */
function overlap(x, y) {
    for (let xseg of segments(x)) {
        for (let yseg of segments(y)) {
            if (cross(xseg.s, xseg.t, yseg.s, yseg.t)) {
                return true;
            }
        }
    }
    return false;
}
/**
 * check if two segments cross
 */
function cross(s1, t1, s2, t2) {
    const a1 = s1.x;
    const b1 = s1.y;
    const a2 = t1.x;
    const b2 = t1.y;
    const x1 = s2.x;
    const y1 = s2.y;
    const x2 = t2.x;
    const y2 = t2.y;
    if (isHorizontal(s1, t1)) {
        if (isHorizontal(s2, t2)) {
            return (y1 === b1 && x1 <= a2 && a1 <= x2);
        } else {
            return (a1 <= x1 && x1 <= a2 && y1 <= b1 && b1 <= y2);
        }
    } else {
        if (isHorizontal(s2, t2)) {
            return (x1 <= a1 && a1 <= x2 && y1 >= b1 && y1 <= b2);
        } else {
            return (x1 === a1 && y1 <= b2 && b1 <= y2);
        }
    }
}

function path2str(dest) {
    let str = '';
    let isFirst = true;
    while (!isNullOrUndefined(dest)) {
        if (isFirst) {
            isFirst = false;
        } else {
            str = str.concat('<-');
        }
        str = str.concat(JSON.stringify(dest.state));
        dest = dest.parent;
    }
    return str;
}

const inSegment = function (x, y, s, t) {
    if (isHorizontal(s, t)) {
        if (y != s.y) {
            return false;
        }
        const inc = s.x < t.x ? 1 : -1;
        for (let i = s.x; i != t.x; i += inc) {
            if (x === i) {
                return true;
            }
        }
        return false;
    } else {
        if (x != s.x) {
            return false;
        }
        const inc = s.y < t.y ? 1 : -1;
        for (let i = s.y; i != t.y; i += inc) {
            if (y === i) {
                return true;
            }
        }
        return false;
    }
};

function hasRepeats(dest) {
    const segs = segments(dest);
    let elm = segs.next();
    if (elm.done) {
        return false;
    }
    let last = elm.value;
    const pts = [];
    if (isHorizontal(last.s, last.t)) {
        const inc = last.s.x < last.t.x ? 1 : -1;
        for (let i = last.s.x + inc; i != last.t.x; i += 1) {
            pts.push({ x: i, y: last.t.y });
        }
    } else {
        const inc = last.s.y < last.t.y ? 1 : -1;
        for (let i = last.s.y + inc; i != last.t.y; i += 1) {
            pts.push({ x: last.s.x, y: i });
        }
    }
    pts.push({ x: dest.state.x, y: dest.state.y });    
    while (true) {
        let curr = segs.next();
        if (curr.done) {
            break;
        }
        else {
            for (let pt of pts) {
                if (inSegment(pt.x, pt.y, curr.value.s, curr.value.t)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function grid2str(grid) {
    const width = grid.length;
    if (width === 0) {
        return '';
    }
    const height = grid[0].length;
    if (height === 0) {
        return '';
    }
    let isFirst = true;
    let str = '';
    for (let i = 0; i < height; i += 1) {
        if (isFirst) {
            isFirst = false;
        } else {
            str += '\n';
        }
        for (let j = 0; j < width; j += 1) {
            str += grid[j][i];
        }
    }
    return str;
}

function locations(path) {
    const points = [];
    while (!isNullOrUndefined(path)) {
        points.push({ x: path.state.x, y: path.state.y });
        path = path.parent;
    }
    return points.reverse();
}

/**
 * Iterate segments of a path
 * @param {Node<Ball>} path 
 */
function* segments(path) {
    let s = path.state;
    path = path.parent;
    while (!isNullOrUndefined(path)) {
        let t = path.state;
        if (isHorizontal(s, t)) {
            if (s.x <= t.x) {
                yield { s: s, t: t };
            } else {
                yield { s: t, t: s };
            }
        } else {
            if (s.y <= t.y) {
                yield { s: s, t: t };
            } else {
                yield { s: t, t: s };
            }
        }
        s = t;
        path = path.parent;
    }
}

/**
 * Iterate paths
 * @param {Node<Node<Ball>>} node 
 */
function* getAllPaths(node) {
    while (!isNullOrUndefined(node)) {
        yield node.state;
        node = node.parent;
    }
}

class Grid {
    constructor(grid, width, height) {
        this.grid = grid;
        this.width = width;
        this.height = height;
        this.balls = [];
        for (let x = 0; x < width; x += 1) {
            for (let y = 0; y < height; y += 1) {
                if (grid[x][y] >= '1' && grid[x][y] <= '9') {
                    const shotCount = parseInt(grid[x][y]);
                    this.balls.push(new Ball(x, y, shotCount));
                }
            }
        }
    }

    toString() {
        let str = '';
        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                str = str.concat(grid[x][y]);
            }
            if (y < (height - 1)) {
                str = str.concat('\n');
            }
        }
        return str;
    }

    isOutlier(b) {
        const x = b.x;
        const y = b.y;
        return x < 0 || y < 0 || x >= this.width || y >= this.height || this.isWater(b);
    }

    isWater(b) {
        const x = b.x;
        const y = b.y;
        return this.grid[x][y] === 'X';
    }

    isHole(b) {
        const x = b.x;
        const y = b.y;
        return this.grid[x][y] === 'H';
    }

    findPlan(node, bags, start, end) {
        const bag = bags[start];
        const newStart = start + 1;
        const remaining = end - newStart + 1;
        const possibles = bag.filter(value => {
            const paths = getAllPaths(node);
            for (let path of paths) {
                if (overlap(path, value)) {
                    return false;
                }
            }
            return true;
        });
        const nextNodes = possibles.map(value => new Node(value, node));
        for (let nextNode of nextNodes) {
            if (remaining === 0) {
                return nextNode;
            } else {
                const plan = this.findPlan(nextNode, bags, newStart, end);
                if (!isNullOrUndefined(plan)) {
                    return plan;
                }
            }
        }
    }

    findPaths(node) {
        const ball = node.state;
        const shotCount = ball.shotCount;
        const newCount = shotCount - 1;
        const balls = [
            new Ball(ball.x - shotCount, ball.y, newCount),
            new Ball(ball.x + shotCount, ball.y, newCount),
            new Ball(ball.x, ball.y - shotCount, newCount),
            new Ball(ball.x, ball.y + shotCount, newCount)
        ];
        const newNodes = balls.filter(value => !this.isOutlier(value)).map(value => new Node(value, node)).filter(node => !hasRepeats(node));
        const answers = [];
        for (let newNode of newNodes) {
            if (this.isHole(newNode.state)) {
                answers.push(newNode);
            } else if (newNode.state.shotCount > 0) {
                const dests = this.findPaths(newNode);
                for (let dest of dests) {
                    answers.push(dest);
                }
            }
        }
        return answers;
    }

    getPathsGrid(paths) {
        const ans = new Array(this.width);
        for (let i = 0; i < this.width; i++) {
            ans[i] = new Array(this.height);
            ans[i].fill('.');
        }
        for (let path of paths) {
            const pts = locations(path);
            let prev = pts[0];
            for (let i = 1; i < pts.length; i += 1) {
                let curr = pts[i];
                let char = '';
                let inc = 1;
                if (isHorizontal(prev, curr)) {
                    char = (prev.x < curr.x) ? '>' : '<';
                    inc = (prev.x < curr.x) ? 1 : -1;
                    for (let x = prev.x; x != curr.x; x += inc) {
                        ans[x][prev.y] = char;
                    }
                } else {
                    char = (prev.y < curr.y) ? 'v' : '^';
                    inc = (prev.y < curr.y) ? 1 : -1;
                    for (let y = prev.y; y != curr.y; y += inc) {
                        ans[prev.x][y] = char;
                    }
                }
                prev = curr;
            }
        }
        return ans;
    }

    getPlanGrid() {
        const balls = this.balls; //
        const bags = [];
        for (let ball of balls) {
            const holeNodes = this.findPaths(new Node(ball));
            if (isNullOrUndefined(holeNodes) || holeNodes.length === 0) {
                return undefined;
            }
            bags.push(holeNodes);
        }
        const plan = this.findPlan(undefined, bags, 0, balls.length - 1);
        if (isNullOrUndefined(plan)) {
            return undefined;
        }
        return this.getPathsGrid(getAllPaths(plan));
    }
}

module.exports = {
    Ball: Ball,
    Node: Node,
    Grid: Grid,
    isNullOrUndefined: isNullOrUndefined,
    path2str: path2str,
    segments: segments,
    isHorizontal: isHorizontal,
    isVertical: isVertical,
    locations: locations,
    cross: cross,
    getAllPaths: getAllPaths,
    grid2str: grid2str,
}

