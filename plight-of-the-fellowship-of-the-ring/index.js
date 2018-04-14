const readline = require('readline');
const fs = require('fs');

export function readOut(out) {
    return new Promise((resolve, reject) => {
        const lineReader = readline.createInterface({
            input: fs.createReadStream(out),
            crlfDelay: Infinity,
            terminal: false,
        });
        let answer;
        lineReader.on('line', line => {
            if (line === 'IMPOSSIBLE') {
                answer = 'IMPOSSIBLE';
            } else {
                const tokens = line.split(' ');
                answer = tokens.map(token => parseInt(token));    
            }});
        lineReader.on('close', () => {
            resolve(answer);
        })
    });
}

export function readInput(inputFileName) {
    return new Promise((resolve, reject) => {

        let N = 0;
        let M = 0;
        let L = 0;

        let spots_x = [];
        let spots_y = [];
        let orcs_x = [];
        let orcs_y = [];
        let portals_u = [];
        let portals_v = [];

        let S = -1;
        let E = -1;

        const lineReader = readline.createInterface({
            input: fs.createReadStream(inputFileName),
            crlfDelay: Infinity,
            terminal: false,
        });
        let lineNo = 0;
        let success = false;
        lineReader.on('line', line => {
            lineNo++;
            let curr = 0;
            if (lineNo === 1) {
                N = parseInt(line);
                spots_x = new Array(N);
                spots_y = new Array(N);
            } else if (lineNo === 2) {
                M = parseInt(line);
                orcs_x = new Array(M);
                orcs_y = new Array(M);
            } else if (lineNo === 3) {
                L = parseInt(line);
                portals_u = new Array(L);
                portals_v = new Array(L);
            }

            if (lineNo >= 4 && lineNo <= 3 + N) {
                const tokens = line.split(' ');
                curr = lineNo - 4;
                spots_x[curr] = parseInt(tokens[0]);
                spots_y[curr] = parseInt(tokens[1]);
            } else if (lineNo >= 4 + N && lineNo <= 3 + N + M) {
                curr = lineNo - (4 + N);
                const tokens = line.split(' ');
                orcs_x[curr] = parseInt(tokens[0]);
                orcs_y[curr] = parseInt(tokens[1]);
            } else if (lineNo >= 4 + N + M && lineNo <= 3 + N + M + L) {
                curr = lineNo - (4 + N + M);
                const tokens = line.split(' ');
                portals_u[curr] = parseInt(tokens[0]);
                portals_v[curr] = parseInt(tokens[1]);
            }

            if (lineNo > 3 + N + M + L) {
                curr = lineNo - (3 + N + M + L);
                if (curr === 1) {
                    S = parseInt(line);
                } else if (curr === 2) {
                    E = parseInt(line);
                    success = true;
                }
            }
        });

        lineReader.on('close', () => {
            if (success) {
                const input = {
                    spots_x: spots_x,
                    spots_y: spots_y,
                    orcs_x: orcs_x,
                    orcs_y: orcs_y,
                    portals_u: portals_u,
                    portals_v: portals_v,
                    S: S,
                    E: E
                };
                resolve(input);
            } else {
                reject('Failed to read input from files');
            }
        });
    });
}
