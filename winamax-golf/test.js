const io = require('./in-out');
const program = require('./index');
const assert = require('chai').assert;

describe('winamax challenge', () => {
    it('find path should work for 1', () => {
        return io.readGrid('./testcases/1.in').then(({ grid, width, height }) => {
            const course = new program.Grid(grid, width, height);
            const balls = course.balls;
            assert.equal(balls.length, 1);
            assert.deepEqual(balls[0], { x: 0, y: 0, shotCount: 1 });
            const holeNodes = course.findPaths(new program.Node(balls[0])); // 
            assert.equal(holeNodes.length, 1);
            assert.deepEqual(holeNodes[0].state, { x: 1, y: 0, shotCount: 0 });
            const segments = program.segments(holeNodes[0]); // 
            const res = segments.next();
            assert.deepEqual({ x: res.value.s.x, y: res.value.s.y }, { x: 0, y: 0 });
            assert.deepEqual({ x: res.value.t.x, y: res.value.t.y }, { x: 1, y: 0 });
            const plan = course.findPlan(undefined, [holeNodes], 0, 0); // 
            assert.isTrue(!program.isNullOrUndefined(plan.state));
            const paths = program.getAllPaths(plan); // 
            const ans = paths.next();
            assert.equal(program.path2str(ans.value), '{"x":1,"y":0,"shotCount":0}<-{"x":0,"y":0,"shotCount":1}');
            assert.isTrue(paths.next().done);
        });
    });

    it('find path should work for 2', () => {
        return io.readGrid('./testcases/2.in').then(({ grid, width, height }) => {
            const course = new program.Grid(grid, width, height); //
            const balls = course.balls; // 
            assert.equal(balls.length, 2);
            const ball = balls.filter(value => value.shotCount === 2)[0];
            const holeNodes = course.findPaths(new program.Node(ball)); //
            assert.equal(holeNodes.length, 1);
            const holeNode1 = holeNodes.find(value => value.state.x === 1 && value.state.y === 2);
            assert.notEqual(holeNode1, undefined);
            const locations1 = program.locations(holeNode1);
            assert.deepEqual(locations1, [{ x: 0, y: 0 }, { x: 0, y: 2 }, { x: 1, y: 2 }]);

            const second = balls.filter(value => value.shotCount === 1)[0];
            const holeNodes2 = course.findPaths(new program.Node(second));
            assert.equal(holeNodes2.length, 2);
            const holeNode2 = holeNodes2.find(value => value.state.x === 2 && value.state.y === 1);
            const locations2 = program.locations(holeNode2);
            assert.deepEqual(locations2, [{ x: 2, y: 2 }, { x: 2, y: 1 }]);

            const plan1 = course.findPlan(undefined, [holeNodes, holeNodes2], 0, 1); //
            const paths1 = Array.from(program.getAllPaths(plan1));
            assert.equal(paths1.length, 2);
            assert.deepEqual(paths1[0], holeNode2);
            assert.deepEqual(paths1[1], holeNode1);

            const plan2 = course.findPlan(undefined, [holeNodes2, holeNodes], 0, 1);
            const paths2 = Array.from(program.getAllPaths(plan2));
            assert.equal(paths2.length, 2);
            assert.deepEqual(paths2[0], holeNode1);
            assert.deepEqual(paths2[1], holeNode2);
        });
    });


    it('can plan for 3', () => {
        return io.readGrid('./testcases/3.in').then(({ grid, width, height }) => {
            const course = new program.Grid(grid, width, height); //
            const planning = course.getPlanGrid();

            return io.readLines('./testcases/3.out').then(lines => {
                const width = planning.length;
                assert.isTrue(width > 0);
                const height = planning[0].length;
                for (let i = 0; i < height; i += 1) {
                    const line = lines[i];
                    for (let j = 0; j < width; j += 1) {
                        assert.equal(planning[j][i], line[j]);
                    }
                }
            });
        });
    });

    it('can plan for 4', () => {
        return io.readGrid('./testcases/4.in').then(({ grid, width, height }) => {
            const course = new program.Grid(grid, width, height); //
            const planning = course.getPlanGrid();

            return io.readLines('./testcases/4.out').then(lines => {
                const width = planning.length;
                assert.isTrue(width > 0);
                const height = planning[0].length;
                for (let i = 0; i < height; i += 1) {
                    const line = lines[i];
                    for (let j = 0; j < width; j += 1) {
                        assert.equal(planning[j][i], line[j]);
                    }
                }
            });
        });
    });

    it('can plan for 5', () => {
        return io.readGrid('./testcases/5.in').then(({ grid, width, height }) => {
            const course = new program.Grid(grid, width, height);
            const planning = course.getPlanGrid();
            return io.readLines('./testcases/5.out').then(lines => {
                const width = planning.length;
                assert.isTrue(width > 0);
                const height = planning[0].length;
                for (let i = 0; i < height; i += 1) {
                    const line = lines[i];
                    for (let j = 0; j < width; j += 1) {
                        assert.equal(planning[j][i], line[j]);
                    }
                }
            });
        });
    });
});
