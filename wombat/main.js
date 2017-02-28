



console.log('-------------------------- RESTART '+Game.time+'------------------ C -----------------');


// REQUIRE: debug related classes
var Visualization = require('case.debug.Visualization');
var Logging = require('case.admin.Logging');

// REQUIRE: design related classes
var MemoryManager = require('case.design.MemoryManager');
var GlobalCache = require('case.design.GlobalCache');
var ProxyCache = require('case.design.ProxyCache');


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

_.assign(global,
{
    CreepBody: require('case.util.CreepBody'),
});


var aNode = new ServerNode(module,(isReset) => Cache.makeCache(isReset));


// TODO: think about this again - this is because the objects here are using stuff from the above assign
// not sure if the classes are initialized properly there
_.assign(global,
{
    PCache: new ProxyCache(),
});

PCache.initProxyCache();


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



    var a = Game.cpu.getUsed();
    _.each(PCache.getCache()[ENTITY_TYPES.controller], (aController) => aController.visualize());
    _.each(PCache.getCache()[ENTITY_TYPES.source], (aSource) =>
    {
        Log(undefined,'Derp: source '+aSource.id+' HomeSpawn: '+aSource.homeSpawn.name+' SpawnEnergy: '+aSource.homeSpawn.energy+' Spawning: '+JS(aSource.homeSpawn.spawning));
        aSource.visualize();

    });
    var b = Game.cpu.getUsed();
    Log(WARN,'PROFILE: proxy - '+(b-a).toFixed(4) +' keys: '+JS(_.keys(PCache.getCache())));

    // var aController = aTestCache[ENTITY_TYPES.controller][aController.id];
    //
    // Log(undefined,'TEST: cache: '+aTestCache[aController.id].progress+' tick: '+aController.progress);

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




    var aDefender = Game.creeps['Wallaby'];

    if (!_.isUndefined(aDefender))
    {
        if (!aDefender.spawning)
        {
            var aSpawn = Game.getObjectById('58b222d59019b0f04abbe79a');
            var aExtension = _.find(aDefender.room.find(FIND_STRUCTURES), (aStucture) => aStucture.structureType == STRUCTURE_EXTENSION);
            var aCivCreep = _.find(aDefender.room.find(FIND_HOSTILE_CREEPS), (aCreep) => true);
            var aContainer = _.find(aDefender.room.find(FIND_STRUCTURES), (aBox) => aBox.structureType == STRUCTURE_CONTAINER);
            var myRoads = _.filter(aDefender.room.find(FIND_STRUCTURES), (aStruct) => aStruct.structureType == STRUCTURE_ROAD);
            var aRoad = _.min(myRoads,(aRoad) => aRoad.pos.getRangeTo(aDefender));

            if (aSpawn != null)
            {
                var aDerp = _.find(aDefender.room.find(FIND_HOSTILE_CREEPS), (aCreep) => aCreep.getActiveBodyparts(ATTACK) > 0);

                if (!_.isUndefined(aDerp))
                {
                    var res = aDefender.moveTo(aDerp);
                    aDefender.attack(aDerp);
                    Log(undefined,'DERP defend: '+ErrorString(res));

                }
                else
                {
                    var res = aDefender.moveTo(aSpawn);
                    aDefender.attack(aSpawn);
                    Log(undefined,'DERP derp: '+ErrorString(res));
                }
            }
            else if (!_.isUndefined(aExtension))
            {
                var res = aDefender.moveTo(aExtension);
                aDefender.attack(aExtension);
                Log(undefined,'DERP extension: '+ErrorString(res));

            }
            else if (!_.isUndefined(aCivCreep))
            {
                var res = aDefender.moveTo(aCivCreep);
                aDefender.attack(aCivCreep);
                Log(undefined,'DERP civ creep: '+ErrorString(res));

            }
            else if (!_.isUndefined(aContainer))
            {
                var res = aDefender.moveTo(aContainer);
                aDefender.attack(aContainer);
                Log(undefined,'DERP box: '+ErrorString(res));

            }
            else if (!_.isUndefined(aRoad))
            {
                var res = aDefender.moveTo(aRoad);
                aDefender.attack(aRoad);
                Log(undefined,'DERP road: '+ErrorString(res));

            }
            else
            {
                var res = aDefender.moveTo(new RoomPosition(23,26,'W68S76'));
                Log(undefined,'DERP: '+ErrorString(res));
            }

        }
    }
    else
    {
        // var aRoom = _.find(Game.rooms);
        // var aEnergy = RCL_ENERGY(aRoom.controller.level);
        // var aCreepBody = new CreepBody();
        // var aSearch =
        // {
        //     name: CARRY,
        //     //max:  10,//_.bind(getCarryMax,aRoom,aRoom.find(FIND_SOURCES)),    //({derp}) => getCarryMax(arguments[0]),
        // };
        // var aBodyOptions =
        // {
        //     hasRoads: true,
        //     //moveBoost: '',
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
        // Log(undefined,JS(_.countBy(aResult.body)));
        // var res = _.find(Game.spawns).createCreep(aResult.body,'Wallaby');
        // Log(undefined,'WAR: '+ErrorString(res));

    }

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
    return 10;
}

derp = function()
{
    console.log('DERP');
}
