
console.log('-------------------------- RESTART '+Game.time+'------------------ C -----------------');


// REQUIRE: debug related classes
var Visualization = require('case.debug.Visualization');
var Logging = require('case.admin.Logging');

// REQUIRE: design related classes
var MemoryManager = require('case.design.MemoryManager');
var GlobalCache = require('case.design.GlobalCache');


// REQUIRE: admin related classes
_.assign(global,require('case.admin.Constants'));
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
require('prototype.RoomObject');
require('prototype.Creep');
require('prototype.RoomVisual');
require('prototype.StructureController');
require('prototype.Source');
require('prototype.Mineral');
require('prototype.RoomPosition');
require('prototype.Room');
require('prototype.Tower');


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

var aChachedRoad  = _.find(_.find(Game.rooms).find(FIND_STRUCTURES), (aStruct) => aStruct.structureType == STRUCTURE_ROAD);
var aChachedController  = _.find(Game.rooms).controller;


var aList = [aChachedRoad,aChachedController];

var aDerp = {};
_.each(aList, (aEntity,aIndex) =>
{
    var aType = aEntity.entityType;
    if (_.isUndefined(aDerp[aType]))
    {
        aDerp[aType] = [];
    }
    aDerp[aType].push(aIndex);
});

getDerp(aType)
{

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
