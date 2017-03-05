/**
 * Recursive utility function for creating a details tag.
 * Returns the html string for the details tag.
 * Creates subordinate details tags if the main one contains objects or arrays of objects.
 * Author: Helam
 * @param summary (value to be shown next to the dropdown arrow)
 * @param list (array or object whose properties or elements will be displayed when the tag is expanded)
 * @param depth (USED ONLY FOR LIMITING RECURSION. DONT TOUCH.)
 * @returns {*}
 */
global.showDetails = function(summary, list, depth = 0) {
    const RECURSION_LIMIT = 3; // can modify this, but must be limited due to memory cycles

    if (Memory.detailsIdCounter == undefined || Memory.detailsIdCounter > 1000)
    {
        Memory.detailsIdCounter = 0;
    }
    let detailsId = Memory.detailsIdCounter++;

    if (list == undefined)
    {
        list = summary;
    }

    // must limit this because it can recurse
    // infinitely if there are cycles in memory
    if (depth >= RECURSION_LIMIT)
    {
        return summary;
    }

    var outstr = `<details id="${detailsId}"><summary>${summary}</summary>`;
    outstr += `<ul>`;

    if (Array.isArray(list) && typeof list[0] !== 'object') {
        list.forEach( (element, index) => {
            let output;
            if (Array.isArray(element)) {
                output = element;
            } else if (typeof element === 'object') {
                output = showDetails(element, element, depth + 1);
            } else {
                output = element;
            }
            outstr += `<li>${index}: \t\t${output}</li>`
        })
    }
    else if (typeof list === 'object')
    {
        // console.log('LIST: '+JSON.stringify(list));
        // console.log('LIST: '+JSON.stringify(_.keys(list)));
        if (!_.isUndefined(list) && list != null )
        {
            Object.keys(list).forEach( key =>
            {
                let property = list[key];
                let output;
                if (Array.isArray(property) && typeof property[0] !== 'object')
                {
                    output = property;
                }
                else if (typeof property === 'object')
                {
                    output = showDetails(property, property, depth + 1);
                }
                else
                {
                    output = property;
                }
                outstr += `<li>${key}: \t\t${output}</li>`
            })
        }
    }
    else
    {
        return "invalid list argument";
    }

    outstr += `</ul>`;
    outstr += `</details>`;

    return outstr;
};

/**
 * Outputs an expandable details tag to the console that allows browsing the memory of an object.
 * Pass in an object with memory OR its id OR name
 * @param arg {Creep|Room|Structure|String} Anything with a '.memory' property basically
 * Author: Helam
 */
global.showMemory = function (arg) {
    let object = undefined;
    if (arg == undefined) {
        console.log(`<font color="#a52a2a">Undefined argument to global.showMemory()</font>`);
        return;
    } else if (typeof arg === 'object') {
        object = arg;
    } else if (typeof arg === 'string') {
        object = Game.creeps[arg] || Game.spawns[arg] || Game.rooms[arg] || Game.flags[arg] || Game.getObjectById(arg);
    }

    if (object != undefined) {
        let memory = object.memory;

        if (memory != undefined) {
            let outstr = showDetails(object, memory);
            console.log(outstr);
        } else {
            console.log(`<font color="#a52a2a">Memory not defined for object ${object}. Arg: ${arg}`);
        }
    } else {
        console.log(`<font color="#a52a2a">No object found. Arg: ${arg}`);
    }
};
