// Returns the n-th position along an Ulam spiral, sq is the Chebyshev distance from the origin
var ulamSpiral = function(n) {
    // Note - The spiral paths counter-clockwise: (0,0) (0,1) (-1,1) (-1,0) ...
    let p = Math.floor(Math.sqrt(4*n+1));
    let q = n - Math.floor(p*p/4);
    let sq = Math.floor((p+2)/4);
    let x = 0;
    let y = 0;
    if (p % 4 === 0) {
        // Bottom Segment
        x = -sq + q;
        y = -sq;
    } else if (p % 4 === 1) {
        // Right Segment
        x = sq;
        y = -sq + q;
    } else if (p % 4 === 2) {
        // Top Segment
        x = sq - q - 1;
        y = sq;
    } else if (p % 4 === 3) {
        // Left Segment
        x = -sq;
        y = sq - q;
    }
    return {x:x,y:y,sq:sq};
};
