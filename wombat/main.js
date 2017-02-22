
console.log('-------------------------- RESTART '+Game.time+'------------------ C -----------------');


var myCPU = {};

var a = Game.cpu.getUsed();

// REQUIRE: debug related classes
var Visualization = require('case.debug.Visualization');
var Test = require('case.debug.Test');

// REQUIRE: admin related classes
var Logging = require('case.admin.Logging');
var ServerNode = require('case.admin.ServerNode');
var Constants = require('case.admin.Constants');
var Functions = require('case.admin.Functions');
var ClassExtensions = require('case.admin.ClassExtensions');

// REQUIRE: design related classes
var MemoryManager = require('case.design.MemoryManager');
var GlobalCache = require('case.design.GlobalCache');
var GlobalGameManager = require('case.design.GlobalGameManager');

// REQUIRE: operation related classes
var RespawnOperation = require('case.operations.respawn.Operation');
var ResettleOperation = require('case.operations.resettle.Operation');
var DefenseOperation = require('case.operations.defense.Operation');
var ScoutOperation = require('case.operations.scout.Operation');
var Traveler = require('Traveler');

// REQUIRE: prototype class extensions - they don't need to be named
require('prototype.Creep');
require('prototype.RoomVisual');
require('prototype.StructureController');
require('prototype.Source');
require('prototype.Mineral');
require('prototype.RoomPosition');
require('prototype.Room');
require('prototype.Tower');

_.assign(global,
{
    CreepBody: require('case.util.CreepBody'),
});

myCPU['require'] = Game.cpu.getUsed() - a;

var a = Game.cpu.getUsed();
_.assign(global,Constants);
_.assign(global,Functions);
_.assign(global,
{
    Visualizer: new Visualization(),
    Log: (level,msg) => new Logging(level,msg),
    Mem: new MemoryManager(),
    Cache: new GlobalCache(),
});

myCPU['assignConstants'] = Game.cpu.getUsed() - a;


var a = Game.cpu.getUsed();
var aNode = new ServerNode(module,(isReset) => Cache.makeCache(isReset));
//var aNode = new ServerNode(module);
myCPU['serverNode'] = Game.cpu.getUsed() - a;

var aHeavy = [];
if (aNode.mNode > 4)
{
    var a = Game.cpu.getUsed();
    // for (let x=0;x<50;x=x+1)
    // {
    //     for (let y=0;y<50;y=y+1)
    //     {
    //         //Game.map.getTerrainAt(x,y,_.find(Game.rooms).name);
    //         //Game.map.getTerrainAt(x,y,_.find(Game.rooms).name);
    //         aHeavy.push(Game.map.getTerrainAt(x,y,_.find(Game.rooms).name));
    //     }
    // }
    myCPU['heavyWork'] = Game.time + ' '+ (Game.cpu.getUsed() - a);
}



// TODO: think about this again - this is because the objects here are using stuff from the above assign
// not sure if the classes are initialized properly there
_.assign(global,
{
    GameMan: new GlobalGameManager(),
})



module.exports.loop = function ()
{
    var start = Game.cpu.getUsed();

    var a = Game.cpu.getUsed();
    Cache.updateCache();
    GameMan.init();
    var b = Game.cpu.getUsed();
    Log(WARN,'PROFILE: cache update - '+(b-a));

    var aDefenseOperation = new DefenseOperation();
    aDefenseOperation.processOperation(true);

    var aRespawnOperation = new ResettleOperation();
    aRespawnOperation.processOperation();

    var aCacheAge = Game.time - Cache.mLastUpdate;
    var aCount = {}
    //_.each(Cache.mCache,(aValue,aKey) => aCount[aKey] = aValue.length);
    Log(undefined, 'GAME['+aNode.mNode+'] TICK['+Game.time+']: (cache) - '+aCacheAge+' '+Cache.mCache.length);


    // var derp = {
    //     a: 100,
    //     b: 'derp',
    // }
    //
    // var aRoom = _.find(Game.rooms);
    // var aEnergy = RCL_ENERGY(aRoom.controller.level);
    // var aCreepBody = new CreepBody();
    // var aSearch =
    // {
    //     name: CARRY,
    //     max: _.bind(getCarryMax,aRoom,aRoom.find(FIND_SOURCES)),    //({derp}) => getCarryMax(arguments[0]),
    // };
    // var aBodyOptions =
    // {
    //     hasRoads: true,
    //     moveBoost: '',
    // };
    // var aBody =
    // {
    //     [WORK]:
    //     {
    //         count: () => getWorkCount(),
    //     },
    // };
    //
    // var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);
    // Log(undefined,JS(aResult));

    var end = Game.cpu.getUsed();
    Log(WARN,'GAME: [ '+start.toFixed(2)+' | '+(end-start).toFixed(2)+' | '+end.toFixed(2)+' ] BUCKET: '+Game.cpu.bucket);
};

getCarryMax = function(a)
{
    Log(undefined,'CARRY CALLBACK ......');
    Log(undefined,JS(a));
    Log(undefined,JS(this));
    return 10;
}

getWorkCount = function(a,b)
{
    Log(undefined,'WORK CALLBACK ......');
    return 4;
}

derp = function()
{
    console.log('DERP');
}
