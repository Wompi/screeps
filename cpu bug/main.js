
var myCPU = {};

var a0 = Game.cpu.getUsed();

if (module.timestamp != Memory.timestamp)
{
    Memory.timestamp = module.timestamp,
    Memory.nodeCount = 0;
}
var aNode = (Memory.nodeCount + 1);
Memory.nodeCount = aNode;

var aHeavy = [];
if (aNode > 4)
{
    console.log(`<font style="color:#FF0000"> HEAVY WORK ${aNode} ... will not be seen</font>`);
    var a1 = Game.cpu.getUsed();
    for (let x=0;x<50;x=x+1)
    {
        for (let y=0;y<50;y=y+1)
        {
            Game.map.getTerrainAt(x,y,_.find(Game.rooms).name);
            Game.map.getTerrainAt(x,y,_.find(Game.rooms).name);
            aHeavy.push(Game.map.getTerrainAt(x,y,_.find(Game.rooms).name));
        }
    }
    myCPU['heavyWork'] = Game.time + ' '+ (Game.cpu.getUsed() - a1);
}
myCPU['globalCPU'] = Game.time + ' '+ (Game.cpu.getUsed() - a0);
console.log(`<font style="color:#FF0000"> NEW NODE .... ${aNode}</font>`);


module.exports.loop = function ()
{
    var start = Game.cpu.getUsed();

    console.log('NODE: [ '+aNode+' | '+Memory.nodeCount+' ] - '+_.isEmpty(aHeavy));
    if (!_.isUndefined(myCPU['heavyWork']))
    {
        myCPU['heavyWorkTick'] = Game.time + ' '+start;
    }
    console.log('MY CPU: '+JSON.stringify(myCPU,undefined,2));

    var end = Game.cpu.getUsed();
    console.log('GAME:['+Game.time+'] [ '+start.toFixed(2)+' | '+(end-start).toFixed(2)+' | '+end.toFixed(2)+' ] BUCKET: '+Game.cpu.bucket+'\n\n');
};
