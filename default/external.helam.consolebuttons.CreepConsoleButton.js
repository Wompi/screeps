/**
 * Returns html for a button that will execute the given command when pressed in the console.
 * @param id (from global.getId, value to be used for the id property of the html tags)
 * @param type (resource type, pass undefined most of the time. special parameter for storageContents())
 * @param text (text value of button)
 * @param command (command to be executed when button is pressed)
 * @param browserFunction {boolean} (true if command is a browser command, false if its a game console command)
 * @returns {string}
 * Author: Helam
 */
global.makeButton = function(id, type, text, command, browserFunction=false) {
    var outstr = ``;
    var handler = ``;
    if (browserFunction) {
        outstr += `<script>var bf${id}${type} = ${command}</script>`;
        handler = `bf${id}${type}()`
    } else {
        handler = `customCommand${id}${type}(\`${command}\`)`;
    }
    outstr += `<script>var customCommand${id}${type} = function(command) { $('body').injector().get('Connection').sendConsoleCommand(command) }</script>`;
    outstr += `<input type="button" value="${text}" style="background-color:#555;color:white;" onclick="${handler}"/>`;
    return outstr;
};

/**
 * Returns the html for the svg representation of the given creep or creep name
 * Author: Helam
 * @param creep
 * @returns {string}
 */
global.svgCreep = function(creep) {
    function invalid() {
        console.log(`Invalid argument passed to global.svgCreep! arg: ${creep}`);
        return true;
    }
    if (!creep && invalid()) return;

    if (typeof creep === 'string') {
        creep = Game.creeps[creep];
        if (!creep && invalid()) return;
    }

    if (!(creep instanceof Creep) && invalid()) return;

    let PART_COLORS = {
        [CARRY]: undefined,
        [MOVE]: "#A9B7C6",
        [WORK]: "#FFE56D",
        [CLAIM]: "#B99CFB",
        [ATTACK]: "#F93842",
        [RANGED_ATTACK]: "#5D80B2",
        [HEAL]: "#65FD62",
        [TOUGH]: "#858585"
    };

    let BORDER_COLOR = "#202020";
    let INTERNAL_COLOR = "#555555";

    let BORDER_WIDTH = 8;
    let CENTER_X = 25;
    let CENTER_Y = 25;
    let RADIUS = 15;

    let TOUGH_EXTRA_RADIUS = 8;

    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    function describeArc(x, y, radius, startAngle, endAngle){

        var start = polarToCartesian(x, y, radius, endAngle);
        var end = polarToCartesian(x, y, radius, startAngle);

        var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        var d = [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");

        return d;
    }

    function partsArc(partType, partCount, prevPartCount) {
        if (partType === CARRY)
            return ``;

        let centerAngle;
        if (partType === MOVE)
            centerAngle = 180;
        else
            centerAngle = 0;

        let arcLength = ((prevPartCount + partCount) / 50.0) * 360.0;
        let startAngle = centerAngle - arcLength / 2.0;
        let endAngle = centerAngle + arcLength / 2.0;
        var arc = `<path d="${describeArc(CENTER_X, CENTER_Y, RADIUS, startAngle, endAngle)}" fill="none" stroke="${PART_COLORS[partType]}" stroke-width="${BORDER_WIDTH}"/>`;
        return arc;
    }

    let parts = _.map(creep.body, b => b.type);
    let partCounts = _.countBy(parts);

    var outstr = ``;
    outstr += `<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">`;

    // add tough circle
    let TOUGH_OPACITY = (partCounts[TOUGH] || 0) / 50.0;
    outstr += `<circle cx="${CENTER_X}" cy="${CENTER_Y}" r="${RADIUS + TOUGH_EXTRA_RADIUS}" fill="${PART_COLORS[TOUGH]}" fill-opacity="${TOUGH_OPACITY}"/>`;

    // main body
    outstr += `<circle cx="${CENTER_X}" cy="${CENTER_Y}" r="${RADIUS}" fill="${INTERNAL_COLOR}" stroke="${BORDER_COLOR}" stroke-width="${BORDER_WIDTH}"/>`;

    //console.log(JSON.stringify(partCounts));

    let arcs = [];

    let PRIO = {
        [CARRY]: 0,
        [MOVE]: 0,
        [WORK]: 1,
        [CLAIM]: 5,
        [ATTACK]: 2,
        [RANGED_ATTACK]: 3,
        [HEAL]: 4,
        [TOUGH]: 0
    };

    let keys = Object.keys(partCounts).sort( (a,b) => {
        return partCounts[b] - partCounts[a] || PRIO[b] - PRIO[a];
    });

    keys.reverse().reduce((partsTotal, type) => {
        if (type !== TOUGH) {
            if (type === MOVE) {
                arcs.push(partsArc(type, partCounts[type], 0));
                return partsTotal;
            } else {
                arcs.push(partsArc(type, partCounts[type], partsTotal));
                partsTotal += partCounts[type];
            }
        }
        return partsTotal;
    }, 0);

    arcs.reverse().forEach(arc => outstr += arc);

    outstr += `</svg>`;
    return outstr;
};

/**
 * Prints buttons to console that allow for manual movement control of the creep.
 * Still want to add more features, could easily be modified to do other actions
 * with more buttons. If you do anything with it please share!
 * Author: Helam
 */
// Creep.prototype.override = function() {
//     let directions = [8,1,2,3,4,5,6,7];
//     let labels = ['ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ','ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ','ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ','ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ','ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ','ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ','ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ','ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ'];
//     let buttons = directions.map((dir, idx)=>{
//         let id = getId();
//         let manualCommand = `Game.creeps.${this.name}.move(${dir});`;
//         return makeButton(id, undefined, `${labels[idx]}`, manualCommand);
//     });
//     let holdId = getId();
//     let holdCommand = `Game.creeps.${this.name}.cancelOrder('move')`;
//     let holdButton = makeButton(holdId, undefined, 'X', holdCommand);
//     let [top_left, top, topRight, right, bottom_right, bottom, bottom_left, left] = buttons;
//     let output = top_left + top + topRight + `\n` + left + holdButton + right + `\n` + bottom_left + bottom + bottom_right;
//     console.log(output);
// };
