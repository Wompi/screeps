
console.log('-------------------------- RESTART '+Game.time+'------------------ C -----------------');


// REQUIRE: debug related classes
var Visualization = require('case.debug.Visualization');
var Logging = require('case.admin.Logging');

// REQUIRE: design related classes
var MemoryManager = require('case.design.MemoryManager');
var GlobalCache = require('case.design.GlobalCache');


// REQUIRE: admin related classes
require('case.admin.Constants');
_.assign(global,require('case.admin.Functions'));
_.assign(global,
{
    Visualizer: new Visualization(),
    Log: (level,msg) => new Logging(level,msg),
    Mem: new MemoryManager(),
    Cache: new GlobalCache(),
});

var ServerNode = require('case.admin.ServerNode');


// REQUIRE: operation related classes
var RespawnOperation = require('case.operations.respawn.Operation');
var ResettleOperation = require('case.operations.resettle.Operation');
var DefenseOperation = require('case.operations.defense.Operation');
var ScoutOperation = require('case.operations.scout.Operation');
var Traveler = require('Traveler');

// REQUIRE: prototype class extensions - they don't need to be named
require('prototype.base.Room');
require('prototype.base.RoomPosition');
require('prototype.base.RoomVisual');
require('prototype.base.RoomObject');
require('prototype.roomobject.ConstructionSite');
require('prototype.roomobject.Creep');
require('prototype.roomobject.Flag')
require('prototype.roomobject.Mineral');
require('prototype.roomobject.Nuke');
require('prototype.roomobject.Resource');
require('prototype.roomobject.Source');
require('prototype.base.Structure');
require('prototype.structure.Container');
require('prototype.structure.Portal');
require('prototype.structure.Road');
require('prototype.structure.Wall');
require('prototype.base.structure.OwnedStructure');
require('prototype.structure.owned.Controller');
require('prototype.structure.owned.Extension');
require('prototype.structure.owned.Extractor');
require('prototype.structure.owned.KeeperLair');
require('prototype.structure.owned.Lab');
require('prototype.structure.owned.Link');
require('prototype.structure.owned.Nuker');
require('prototype.structure.owned.Observer');
require('prototype.structure.owned.PowerBank');
require('prototype.structure.owned.PowerSpawn');
require('prototype.structure.owned.Rampart');
require('prototype.structure.owned.Spawn');
require('prototype.structure.owned.Storage');
require('prototype.structure.owned.Terminal');
require('prototype.structure.owned.Tower');


var GlobalGameManager = require('case.design.GlobalGameManager');
_.assign(global,
{
    CreepBody: require('case.util.CreepBody'),
});


var aNode = new ServerNode(module,(isReset) => Cache.makeCache(isReset));


// TODO: think about this again - this is because the objects here are using stuff from the above assign
// not sure if the classes are initialized properly there
_.assign(global,
{
    GameMan: new GlobalGameManager(),
})

if (aNode.mNode > 4)
{
    Log(undefined,aNode.mNode+' ------------------------ BUG REMOVED ---------------------------');
}


module.exports.loop = function ()
{
    var start = Game.cpu.getUsed();

    // for(var name in Memory.creeps)
    // {
    //     if (Game.creeps[name] == undefined)
    //     {
    //         delete Memory.creeps[name];
    //     }
    // }

    var a = Game.cpu.getUsed();
    Cache.updateCache();
    GameMan.init();
    var b = Game.cpu.getUsed();
    Log(WARN,'PROFILE: cache update - '+(b-a));

    var aDefenseOperation = new DefenseOperation();
    aDefenseOperation.processOperation(false);

    var aRespawnOperation = new ResettleOperation();
    aRespawnOperation.processOperation();

    var aCacheAge = Game.time - Cache.mFirstTick;
    var aCacheDelta = Game.time - Cache.mLastUpdate;

    var aCount = {}
    //_.each(Cache.mCache,(aValue,aKey) => aCount[aKey] = aValue.length);
    Log(undefined, 'GAME['+aNode.mNode+'] TICK['+Game.time+']: (cache) - age: '+aCacheAge+' last: '+aCacheDelta+' length: '+Cache.mCache.length);

    Cache.mLastUpdate = Game.time;


    // var aScoutOperation = new ScoutOperation();
    // aScoutOperation.processOperation();

    // var derp = listAllProperties(PathFinder.CostMatrix);
    // Log(undefined,'PATHFINDER: '+JS(derp,false));

    // _.find(Game.rooms).visual.rect(1.5, 1.5, 1, 1);
    //
    //
    //
    // _.each(GameMan.getEntityForType('container'), (aSource) =>
    // {
    //     //Log(undefined,'SOURCE TYPE: '+aSource.entityType);
    //     Log(undefined,'SOURCE DERP: '+aSource.entityType);
    //     //Log(undefined,'SOURCE: '+aSource.getSourceType());
    // })
    //
    // Log(undefined,'COST: '+aCost.serialize());


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
