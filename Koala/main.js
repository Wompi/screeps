



console.log('-------------------------- RESTART '+Game.time+'------------------ C -----------------');



// REQUIRE: debug related classes
var Visualization = require('case.debug.Visualization');
var Logging = require('case.admin.Logging');
var Profiler = require('case.admin.Profiler');

// REQUIRE: design related classes
_.assign(global,
{
    MemoryManager:  require('case.design.MemoryManager'),
    ProxyCache:     require('case.design.ProxyCache'),
    PathManager:    require('case.design.PathManager'),
});


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
_.assign(global,
{
    ResettleOperation:  require('case.operations.resettle.Operation'),
    ResettleVisual:     require('case.operations.resettle.Visual'),
    DefenseOperation:   require('case.operations.defense.Operation'),
    ClaimOperation:     require('case.operations.claim.Operation'),
    MiningOperation:    require('case.operations.mining.Operation'),
    LoadingOperation:   require('case.operations.loading.Operation'),
    Traveler:           require('Traveler'),
});

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
    PMan: new PathManager(),
});

PCache.makeCache(SNode.mReset);

module.exports.loop = function ()
{
    var start = Game.cpu.getUsed();

    Pro.profile( () =>
    {
        SNode.updateNode();
        PCache.updateCache();
    },'cache update')



    Pro.profile( () =>
    {
        let myOperations = [
            () => [new ResettleOperation()],
            () =>
            {
                let myMiningOps = [];
                _.each(PCache.getFriendlyEntityCache(ENTITY_TYPES.source), (aSource) =>
                {
                    // TODO: fix this for other rooms when you have the haulers for it
                    if (aSource.isMy)//&& aSource.pos.roomName == 'W47N84')
                    {
                        myMiningOps.push(new MiningOperation(aSource));
                    }
                });
                return myMiningOps;
            },
            () =>
            {
                let myLoadingOps = [];
                // TODO: change the flag to something memory related
                let myBays = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.flag),FLAG_TYPE.extensionBay);
                //Log(undefined,JS(myBays));
                _.each(myBays, (aFlag) =>
                {
                    myLoadingOps.push(new LoadingOperation(aFlag.pos));
                });
                return myLoadingOps;
            },
            () => [new ClaimOperation('Scarlett',['W47N83'])],     ///[','W48N84'] 'W48N84'
            () => [new DefenseOperation()],

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


    //var ROOM_NAME = 'W48N84'; // left

    var ROOM_NAME = 'W47N84';  // home
    //let aPos = new RoomPosition(8,32,ROOM_NAME)
    let aPos = new RoomPosition(21,33,ROOM_NAME)

    var aCreep = Game.creeps['harp'];
    if (_.isUndefined(aCreep) && Game.time > (17888362 + 19955))
    {
        _.find(Game.spawns).createCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],'harp');
    }
    else if (!_.isUndefined(aCreep) && !aCreep.spawning)
    {
        let myHostiles = _.filter(aCreep.room.find(FIND_HOSTILE_CREEPS), (aC) =>
        {
            return aC.getActiveBodyparts(ATTACK) > 0;
        });
        if (myHostiles.length > 0)
        {
            let aHostile = _.min(myHostiles,(aC) => aC.pos.getRangeTo(aCreep));
            aCreep.moveTo(aHostile,{range: 1, resusePath: 0, ignoreCreeps: true});
            aCreep.attack(aHostile);
        }
        else
        {
            if (aCreep.pos.roomName != ROOM_NAME)
            {
                let aPos = new RoomPosition(25,25,ROOM_NAME)
                aCreep.moveTo(aPos,{reusePath: false});
            }
            else
            {
                if (ROOM_NAME == 'W47N84')
                {
                    aCreep.moveTo(aPos,{range: 0, reusePath: 0});
                }
                else
                {
                    let aSpawn = _.find(aCreep.room.find(FIND_STRUCTURES),(aS) => aS.structureType == STRUCTURE_SPAWN && !aS.my);
                    if (!_.isUndefined(aSpawn))
                    {
                        let res = aCreep.moveTo(aSpawn,{range: 1, resusePath: 0});
                        Log(LOG_LEVEL.debug,'MOVING RES : '+ErrorString(res));

                        res = aCreep.attack(aSpawn);
                        Log(LOG_LEVEL.debug,'ATTACK RES : '+ErrorString(res));
                    }
                }
            }
        }
    }

    var aCreep = Game.creeps['derp'];
    if (_.isUndefined(aCreep) && Game.time > (17888362 + 19955))
    {
       _.find(Game.spawns).createCreep([MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK],'derp');
    }
    else if (!_.isUndefined(aCreep) && !aCreep.spawning)
    {
        if (aCreep.pos.roomName != ROOM_NAME)
        {
            aCreep.moveTo(aPos,{reusePath: 0});
        }
        else
        {
            if (ROOM_NAME == 'W47N84')
            {
                aCreep.moveTo(aPos,{range: 0, reusePath: 0});
            }
            else
            {
                let aSpawn = _.find(aCreep.room.find(FIND_STRUCTURES),(aS) => aS.structureType == STRUCTURE_SPAWN && !aS.my);
                if (!_.isUndefined(aSpawn))
                {
                    let res = aCreep.moveTo(aSpawn,{range: 1, resusePath: 0});
                    Log(LOG_LEVEL.debug,'MOVING RES : '+ErrorString(res));

                    res = aCreep.dismantle(aSpawn);
                    Log(LOG_LEVEL.debug,'DISMANTLE RES : '+ErrorString(res));
                }
            }
        }
    }







    // ------- TEST ME ----------------
    //testCreepBody();

    // _.each(PCache.getFriendlyEntityCache(ENTITY_TYPES.tower), (aT) =>
    // {
    //     if (aT.pos.roomName == 'W47N83')
    //     {
    //         let aPos = new RoomPosition(44,24,'W47N83');
    //         //let aPos = new RoomPosition(2,22,'W47N83');
    //         aT.calculateDamageTillBorder(aPos,undefined);
    //     }
    // })

    // Visualizer.visalizeRange(new RoomPosition(48,33,'W47N84'),2,false);
    // Visualizer.visalizeRange(new RoomPosition(3,33,'W47N84'),2,false);
    // Visualizer.visalizeRange(new RoomPosition(1,48,'W47N84'),2,false);
    // Visualizer.visalizeRange(new RoomPosition(48,48,'W47N84'),2,false);
    // Visualizer.visalizeRange(new RoomPosition(1,1,'W47N84'),2,false);
    // Visualizer.visalizeRange(new RoomPosition(48,1,'W47N84'),2,false);
    // Visualizer.visalizeRange(new RoomPosition(21,33,'W47N84'),2,false);
    // Visualizer.visalizeRange(new RoomPosition(37,36,'W47N84'),3,false);

    //let aM = PMan.getClosedRoomMatrix();
    //Visualizer.visualizeCostMatrix(aM,_.find(Game.rooms));

    // let aSource = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.source));
    // let aSpawn = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn));
    // let aSwampPos = new RoomPosition(3,32,'W47N84');
    //
    // // let aPath = PMan.getPath(aSpawn.pos,aSwampPos);
    // let aPath = PMan.getPath(aSpawn.pos,aSource.pos);
    // let aP = aPath.path;
    // Visualizer.visualizePath(aP);
    // aPath.path = [];
    // Log(LOG_LEVEL.debug,JS(aPath)+' len: '+aP.length);
    //
    // _.each(Game.creeps, (aCreep) =>
    // {
    //     aCreep.getFatigueCost();
    // });




    /// build
    // let aController = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.controller));
    //
    // let aBuildNext = {};
    // let aRank = aController.level + 1;
    //
    // _.times(9,(aIndex) =>
    // {
    //     let aBuild = _.reduce(CONTROLLER_STRUCTURES, (res,aLevel,aKey) =>
    //     {
    //         let aCount = aLevel[aIndex];
    //         if (aCount > 0 && aCount != 2500) _.set(res,aKey,aLevel[aIndex]);
    //         return res;
    //     },{});
    //     Log(LOG_LEVEL.debug,'LEVEL['+aIndex+']: '+JS(aBuild,true));
    // });

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
        hasRoads: false,
        //moveBoost: '',
    };
    var aBody =
    {
        // [HEAL]:
        // {
        //     count: () => 1,///getWorkCount(),
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
