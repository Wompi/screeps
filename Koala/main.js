



console.log('-------------------------- RESTART '+Game.time+'------------------ C -----------------');



// REQUIRE: debug related classes
var Visualization = require('case.debug.Visualization');
var Logging = require('case.admin.Logging');
var Profiler = require('case.admin.Profiler');

// REQUIRE: design related classes
var MemoryManager = require('case.design.MemoryManager');
var ProxyCache = require('case.design.ProxyCache');


// REQUIRE: admin related classes
require('case.admin.Constants');
_.assign(global,require('case.admin.Functions'));
_.assign(global,
{
    Visualizer: new Visualization(),
    Log: (level,msg) => new Logging(level,msg),
    Mem: new MemoryManager(),
    Pro: new Profiler(),
});

var RespawnOperation = require('case.operations.respawn.Operation');
var aRespawnOperation = new RespawnOperation();
aRespawnOperation.processOperation();

var ServerNode = require('case.admin.ServerNode');  // needs Log and Constants



// REQUIRE: operation related classes
var ResettleOperation = require('case.operations.resettle.Operation');
var DefenseOperation = require('case.operations.defense.Operation');
var ClaimOperation = require('case.operations.claim.Operation');
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


// TODO: think about this again - this is because the objects here are using stuff from the above assign
// not sure if the classes are initialized properly there
_.assign(global,
{
    CreepBody: require('case.util.CreepBody'),
    PCache: new ProxyCache(),
    SNode: new ServerNode(module),
});

PCache.makeCache(SNode.mReset);

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

    Pro.profile( () =>
    {
        SNode.updateNode();
        PCache.updateCache();
    },'cache update')



    Pro.profile( () =>
    {
        let myOperations = [
            //() => [new DefenseOperation()],
            () => [new ResettleOperation()],
            //() => [new ClaimOperation()],
        ];
        _.each(myOperations, (aCall) =>
        {
            _.each(aCall(), (aOps) =>
            {
                aOps.processOperation()
            });
        });
    },'operations')

    PCache.printStats();
    var end = Game.cpu.getUsed();
    Log(LOG_LEVEL.warn,'GAME['+Game.time+']: [ '+start.toFixed(2)+' | '+(end-start).toFixed(2)+' | '+end.toFixed(2)+' ] BUCKET: '+Game.cpu.bucket+' '+SNode.printStats(false));

    // ------- TEST ME ----------------
    //testCreepBody();
};



// -------------------------------------- TEST FUNCTIONS -------------------------------------------------------

testCreepBody = function()
{
    var aRoom = _.find(Game.rooms);
    var aEnergy = RCL_ENERGY(aRoom.controller.level);
    var aCreepBody = new CreepBody();
    var aSearch =
    {
        name: WORK,
        //max:  10,//_.bind(getCarryMax,aRoom,aRoom.find(FIND_SOURCES)),    //({derp}) => getCarryMax(arguments[0]),
    };
    var aBodyOptions =
    {
        hasRoads: true,
        //moveBoost: '',
    };
    var aBody =
    {
        // [WORK]:
        // {
        //     count: () => getWorkCount(),
        // },
    };

    var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);
    Log(undefined,JS(_.countBy(aResult.body)));
}

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
