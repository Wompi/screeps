



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
var ScoutOperation = require('case.operations.scout.Operation');
var AttackOperation = require('case.operations.attack.Operation');
var MineralOperation = require('case.operations.mineral.Operation');
var MiningOperation = require('case.operations.mining.Operation');
var LoadingOperation = require('case.operations.loading.Operation');
var LinkOperation = require('case.operations.link.Operation');
var HaulerOperation = require('case.operations.hauler.Operation');
var FixerOperation = require('case.operations.fixer.Operation');
var BuilderOperation = require('case.operations.builder.Operation');
var UpgraderOperation = require('case.operations.upgrader.Operation');
var ClaimOperation = require('case.operations.claim.Operation');
var Traveler = require('Traveler');
var Market = require('case.Market');

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
    M: new Market(),
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
            // () => [new DefenseOperation()],
            () => [new ResettleOperation()],
            //() => new ScoutOperation(),
            //() => [new AttackOperation('Wallaby')],
            // () => [new AttackOperation('Wombat')],
            // () => [new AttackOperation('Cooper')],
            // () => [new AttackOperation('Evan')],
        //    () => [new AttackOperation('Coogar')],
        //    () => [new AttackOperation('Cold')],
            // () =>
            // {
            //     let myMineralOps = [];
            //     _.each(PCache.getEntityCache(ENTITY_TYPES.extractor), (aExtractor) =>
            //     {
            //         myMineralOps.push(new MineralOperation(aExtractor));
            //     });
            //     return myMineralOps;
            // },
            // () =>
            // {
            //     let myMiningOps = [];
            //     _.each(PCache.getEntityCache(ENTITY_TYPES.source), (aSource) =>
            //     {
            //         if (aSource.isMine)
            //         {
            //             myMiningOps.push(new MiningOperation(aSource));
            //         }
            //     });
            //     return myMiningOps;
            // },
            // () =>
            // {
            //     let myLinks = {};
            //     _.each(PCache.getEntityCache(ENTITY_TYPES.link), (aProxy) => _.set(myLinks,[aProxy.room.name,aProxy.id],aProxy));
            //
            //     let myLinkOps = [];
            //     _.each(myLinks, (aProxyMap, aRoomName) =>
            //     {
            //         myLinkOps.push(new LinkOperation(PCache.getEntityProxyForType(ENTITY_TYPES.room,aRoomName),_.map(aProxyMap)));
            //     });
            //     return myLinkOps;
            // },
            // () =>
            // {
            //     let myLoadingOps = [];
            //     // TODO: change the flag to soemthing memory related
            //     let myBays = _.filter(PCache.getEntityCache(ENTITY_TYPES.flag),FLAG_TYPE.extensionBay);
            //     //Log(undefined,JS(myBays));
            //     _.each(myBays, (aFlag) =>
            //     {
            //         myLoadingOps.push(new LoadingOperation(aFlag.pos));
            //     });
            //     return myLoadingOps;
            // },
            // () =>
            // {
            //     let myHaulerOps = [];
            //     _.each(PCache.getEntityCache(ENTITY_TYPES.room), (aRoom) =>
            //     {
            //         // TODO: fix this this is ugly stuff
            //         let aStorage = _.find(PCache.getEntityCache(ENTITY_TYPES.storage), (aS) => aS.pos.roomName == aRoom.name);
            //         if (aRoom.isMine && !_.isUndefined(aStorage))
            //         {
            //             myHaulerOps.push(new HaulerOperation(aRoom));
            //         }
            //     });
            //
            //     return myHaulerOps;
            // },
            // () => [new FixerOperation()],
            // () => [new BuilderOperation()],
            // () => [new UpgraderOperation('W67S74','Lucy')],
            // () => [new UpgraderOperation('W67S74','Logan')],
            // () => [new ClaimOperation()],
        ];
        _.each(myOperations, (aCall) =>
        {
            _.each(aCall(), (aOps) =>
            {
                aOps.processOperation()
            });
        });
    },'operations')



    Pro.profile( () =>
    {
        _.each(PCache.getEntityCache(ENTITY_TYPES.controller), (aController) =>
        {
            Log(LOG_LEVEL.debug,'Controller '+aController.pos.toString()+' ticks: '+aController.ticksToDowngrade);
             aController.visualize();
        });
        _.each(PCache.getEntityCache(ENTITY_TYPES.source), (aSource) =>
        {
            Log(undefined,'source '+aSource.pos.toString()+' HomeSpawn: '+aSource.homeSpawn.name+' SpawnEnergy: '+aSource.homeSpawn.energy+' Spawning: '+JS(aSource.homeSpawn.spawning)+' isMine: '+aSource.isMine);
            aSource.visualize();

        });
        // _.each(PCache.getEntityCache(ENTITY_TYPES.flag), (aProxy) =>
        // {
        //     Log(undefined,'ID: '+aProxy.id+' PROXY: '+aProxy.entityType+' pos: '+aProxy.pos.toString());
        // });
        // _.each(PCache.getEntityCache(ENTITY_TYPES.room), (aRoom) => aRoom.id);
    },'proxy');
    //
    SNode.printStats();
    PCache.printStats();
    var end = Game.cpu.getUsed();
    Log(LOG_LEVEL.warn,'GAME['+Game.time+']: [ '+start.toFixed(2)+' | '+(end-start).toFixed(2)+' | '+end.toFixed(2)+' ] BUCKET: '+Game.cpu.bucket);

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
