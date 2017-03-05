// var aRoot = {
//     root: Memory,
//     value: { GAME: 'game'},
// };
// var aGame = {
//     key: aRoot.value.GAME,
//     value: { RESPAWN_ROOM: 'respawnRoom', RESPAWN_TIME: 'respawnTime' },
// }
// var aDerp = _.get(aRoot.root,[aGame.key,aGame.value.RESPAWN_TIME],Game.time);
//
// console.log('DERP: '+aDerp)


String.prototype.padRight = function(l,c) {return this+Array(l-this.length+1).join(c||" ")}

global.diagnoseMemory = function()
{
    var stringified = JSON.stringify(Memory);
    var startCpu = Game.cpu.getUsed();
    JSON.parse(stringified);
    var endCpu = Game.cpu.getUsed();
    log('============================================================', "manage");
    log('CPU spent on Memory parsing: ' + (endCpu - startCpu), "manage");
    var toLog = {};
    var cpuSpend = {};
    var length = 20;
    for (var property in Memory)
    {
        var amount = recursiveIteration(Memory[property]);
        if(amount == 0)
            continue;
        if(property.length > length)
        {
            length = property.length;
        }
        stringified = JSON.stringify(Memory[property]);
        startCpu = Game.cpu.getUsed();
        JSON.parse(stringified);
        endCpu = Game.cpu.getUsed();
        toLog[property] = amount;
        cpuSpend[property] = (endCpu - startCpu);
    }
    for(var prop in toLog)
    {
        log('Amount of objects stored in Memory.'+ prop.padRight(length,' ')+'  : ' + toLog[prop] + '     -   ' + cpuSpend[prop].toFixed(2), "manage");
    }
    log('============================================================', "manage");
}

function recursiveIteration(object) {
    var objectCount = 0;
    for (var property in object)
    {
        if (object.hasOwnProperty(property))
        {
            if (typeof object[property] == "object")
            {
                objectCount++;
                if(Array.isArray(object[property]))
                {
                    objectCount += object[property].length;
                }
                else
                {
                    objectCount += recursiveIteration(object[property]);
                }
            }
            else
            {
                objectCount ++;
            }
        }
    }
    return objectCount;
}
global.log = function(theText, theCategory)
{
    console.log("["+ theCategory + "] - " + theText);
}
