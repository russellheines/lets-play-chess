const map = new Map([["p", -1], ["n", -3], ["b", -3], ["r", -5], ["q", -9], ["k", 0], ["P", 1], ["N", 3],["B", 3], ["R", 5], ["Q", 9], ["K", 0]]);

export function fen2matrix(fen) {

    let matrix = [[null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null]];

    if (!fen) {
        return matrix;
    }
    
    let pos = 0;
    for (let i=0; i<8; i++) {
        for (let j=0; j<8;) {
            let c = fen.charAt(pos++);
            if (c === '/') {
                continue;
            }
			else if (map.has(c)) {
            	matrix[i][j] = c;
            	j++;
            }
            else {
                j += parseInt(c);
            }            
        }
    }
    
    return matrix;
}