



console.log('-------------------------- RESTART '+Game.time+'------------------ C -----------------');



// REQUIRE: debug related classes
var Visualization = require('case.debug.Visualization');
var Logging = require('case.admin.Logging');
var Profiler = require('case.admin.Profiler');

// REQUIRE: design related classes
_.assign(global,
{
    MemoryManager:      require('case.design.MemoryManager'),
    ProxyCacheMapper:   require('case.design.ProxyCacheMapper'),
    ProxyCache:         require('case.design.ProxyCache'),
    PathManager:        require('case.design.PathManager'),
    RoadManager:        require('case.design.RoadManager'),
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
    LinkOperation:      require('case.operations.link.Operation'),
    FixerOperation:     require('case.operations.fixer.Operation'),
    ReserveOperation:   require('case.operations.reserve.Operation'),
    UpgraderOperation:  require('case.operations.upgrader.Operation'),
    BuilderOperation:   require('case.operations.builder.Operation'),
    HaulerOperation:    require('case.operations.hauler.Operation'),
    Traveler:           require('Traveler'),
    Market:             require('case.Market'),
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
    RMan: new RoadManager(),
    M: new Market(),
});

PCache.makeCache(SNode.mReset);
RMan.makeNetwork();

module.exports.loop = function ()
{
    //return;
    var start = Game.cpu.getUsed();

    Pro.register( () =>
    {
        SNode.updateNode();
        PCache.updateCache();
    },'cache update')



    Pro.register( () =>
    {
        let myOperations  = [
                () => [new DefenseOperation()],
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
                () =>
                {
                    let myHaulerOps = [];
                    let myStorages = PCache.getFriendlyEntityCache(ENTITY_TYPES.storage);
                    _.each(myStorages, (aS) =>
                    {
                        myHaulerOps.push(new HaulerOperation(aS));
                        //myHaulerOps.push(new HaulerOperation(aS));
                    });
                    return myHaulerOps;
                },
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
            //    () => [new ResettleOperation(true)], // TODO: stop spawning should be set when the collony has reached a certain level
                () => [new FixerOperation()],
                () =>
                {
                    let myLinks = {};
                    _.each(PCache.getFriendlyEntityCache(ENTITY_TYPES.link), (aProxy) => _.set(myLinks,[aProxy.room.name,aProxy.id],aProxy));

                    let myLinkOps = [];
                    _.each(myLinks, (aProxyMap, aRoomName) =>
                    {
                        myLinkOps.push(new LinkOperation(PCache.getFriendlyEntityCacheByID(aRoomName),_.map(aProxyMap)));
                    });
                    return myLinkOps;
                },
                () => [new ClaimOperation('Scarlett',['W48N84'])],     ///[','W48N84'] 'W48N84'
                () => [new ClaimOperation('Herbert',['W47N83'])],     ///[','W48N84'] 'W48N84'
                () => [new ReserveOperation(['A','B'],['W46N83'])],
                () => [new UpgraderOperation('W47N84','U1')],
                () => [new UpgraderOperation('W47N84','U2')],
                () => [new UpgraderOperation('W47N84','U3')],
                () => [new UpgraderOperation('W47N84','U4')],
                () => [new UpgraderOperation('W47N84','U5')],
                () => [new BuilderOperation(0)],
                () => [new BuilderOperation(1)],
                () => [new BuilderOperation(2)],
                () => [new BuilderOperation(3)],
                () => [new BuilderOperation(4)],
            ];

        myOperations = myOperations.reverse();
        _.each(myOperations, (aCall,aIndex) =>
        {
            //Log(undefined,'------------------------- START ---------------------------');
            var myCall = undefined;
            Pro.register( () =>
            {
                myCall = aCall();
            },'Call'+aIndex);

            _.each(myCall, (aOps) =>
            {
                Pro.register( () =>
                {
                    aOps.processOperation()
                },'Operation '+aIndex);
            });
            //Log(undefined,'------------------------- END ---------------------------');

        });
    },'operations all')

    _.each(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aS) =>
    {
        if (aS.spawning)
        {
            aS.room.visual.text(Game.creeps[aS.spawning.name].memory.role,aS.pos.x,aS.pos.y-4);
        }
    })



    Pro.register( () =>
    {
        let myEndpoints = RMan.getEndRoads();
        _.each(myEndpoints, (aE) =>
        {
            new RoomVisual(aE.roomName).circle( aE.x,aE.y,{fill: 'transparent', stroke: COLOR.red })
        })
        Log(LOG_LEVEL.debug,'END ROADS: '+myEndpoints.length);
    },'all roads');


    if (!_.isUndefined(Game.creeps['scout']))
    {
        if (Game.time % 30 < 15)
        {
            Game.creeps['scout'].moveTo(new RoomPosition(2,7,'W46N83'));
        }
        else
        {
            Game.creeps['scout'].moveTo(new RoomPosition(47,6,'W47N83'));
        }
    }

    let aCount = 0
    let aCost = 0;
    let myLive = [];
    _.each(Game.creeps,(aC) =>
    {
        if (!aC.spawning)
        {
            myLive.push({
                live: aC.ticksToLive,
                spawn: aC.spawnTime,
                tick: Game.time + aC.ticksToLive - (aC.getActiveBodyparts(CLAIM) ? CREEP_CLAIM_LIFE_TIME : CREEP_LIFE_TIME),
                energy: aC.cost,
            });
            aCount = aCount + aC.spawnTime;
            aCost = aCost + aC.cost;
        }
    });
    myLive = _.sortBy(myLive,'tick');
    let myDelta = []
    let myOFF = []
    _.each(myLive, (aS,i) =>
    {
        if (i > 0)
        {
            let a = myLive[i].tick - myLive[i-1].tick;
            myDelta.push(a);
            myOFF.push(a-aS.spawn);
        }
    })
    Log(LOG_LEVEL.debug,'CREEPS: current all spawntime - '+aCount+' cost - '+aCost+' live: '+JS(myLive));
    Log(LOG_LEVEL.debug,'DELTA: '+myDelta)
    Log(LOG_LEVEL.debug,'OFF: '+myOFF);

    //PMan.newTest();

    Pro.register( () =>
    {
        let derp = RMan.getRepairRoads();
        _.each(derp, (aR) =>
        {
            let aP = aR.hits/aR.hitsMax
            if (!_.isUndefined(aR.room) && aP < 0.8)
            {
                let aColor = COLOR.white;
                if (aP < 0.75) aColor = COLOR.red;
                else if (aP < 0.80) aColor = COLOR.yellow;

                aR.room.visual.text(aP.toFixed(2),aR.pos.x,aR.pos.y,{font: 0.4,opacity: 1, color: aColor});
            }
        })
    },'roads visual');

    let myExtractors = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.extractor), (aE) => !_.isUndefined(aE.mineral));
    _.each(myExtractors, (aE) =>
    {
        Visualizer.visualizeArea(aE.miningPositions, (args) =>
        {
            Log(LOG_LEVEL.debug,JS(args));
            new RoomVisual(aE.pos.roomName).circle(Number(args.x),Number(args.y));
        })
    });



    PCache.printStats();
    var end = Game.cpu.getUsed();
//    Pro.printRegister();
    Log(LOG_LEVEL.warn,'GAME['+Game.time+']: [ '+start.toFixed(2)+' | '+(end-start).toFixed(2)+' | '+end.toFixed(2)+' ] BUCKET: '+Game.cpu.bucket+' '+SNode.printStats(false));


    // var ROOM_NAME = 'W48N84'; // left
    //
    // //var ROOM_NAME = 'W47N84';  // home
    // //let aPos = new RoomPosition(8,32,ROOM_NAME)
    // let aPos = new RoomPosition(21,33,ROOM_NAME)
    //
    // var aCreep = Game.creeps['harp'];
    // if (_.isUndefined(aCreep))
    // {
    //     var aSpawn = Game.spawns['Koala'];
    //     var aCreepBody = new CreepBody();
    //
    //     var aSearch =
    //     {
    //         name: ATTACK,
    //     };
    //     var aBodyOptions =
    //     {
    //         hasRoads: false,
    //         moveBoost: '',
    //     };
    //     var aEnergy = aSpawn.room.energyCapacityAvailable;
    //     var aBody =
    //     {
    //         [HEAL]:
    //         {
    //             count: 1,
    //         }
    //     };
    //     var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);
    //
    //     let res = aSpawn.createCreep(aResult.body,'harp')
    //     Log(LOG_LEVEL.info,'ATTACK:  createCreep - '+ErrorString(res));
    // }
    // else if (!_.isUndefined(aCreep) && !aCreep.spawning)
    // {
    //     let myHostiles = _.filter(aCreep.room.find(FIND_HOSTILE_CREEPS), (aC) =>
    //     {
    //         return aC.getActiveBodyparts(ATTACK) > 0;
    //     });
    //     if (myHostiles.length > 0)
    //     {
    //         let aHostile = _.min(myHostiles,(aC) => aC.pos.getRangeTo(aCreep));
    //         aCreep.moveTo(aHostile,{range: 1, resusePath: 0, ignoreCreeps: true});
    //         let res = aCreep.attack(aHostile);
    //         Log(LOG_LEVEL.debug,'ATTACK HOSTILE RES : '+ErrorString(res));
    //
    //         if (res != OK)
    //         {
    //             if (aCreep.hits < aCreep.hitsMax)
    //             {
    //                 res = aCreep.heal(aCreep);
    //                 Log(LOG_LEVEL.info,aCreep.name+' TIME TO HEAL WHILE HOSTILES ARE AROUND!');
    //             }
    //         }
    //     }
    //     else
    //     {
    //         if (aCreep.pos.roomName != ROOM_NAME)
    //         {
    //             let aPos = new RoomPosition(25,25,ROOM_NAME)
    //             aCreep.moveTo(aPos,{reusePath: false});
    //         }
    //         else
    //         {
    //             if (ROOM_NAME == 'W47N84')
    //             {
    //                 aCreep.moveTo(aPos,{range: 0, reusePath: 0});
    //             }
    //             else
    //             {
    //                 let aSpawn = _.find(aCreep.room.find(FIND_STRUCTURES),(aS) => aS.structureType == STRUCTURE_SPAWN && !aS.my);
    //                 if (!_.isUndefined(aSpawn))
    //                 {
    //                     let res = aCreep.moveTo(aSpawn,{range: 1, resusePath: 0});
    //                     Log(LOG_LEVEL.debug,'MOVING RES : '+ErrorString(res));
    //
    //                     res = aCreep.attack(aSpawn);
    //                     Log(LOG_LEVEL.debug,'ATTACK SPAWN RES : '+ErrorString(res));
    //
    //                     if (res != OK)
    //                     {
    //                         if (aCreep.hits < aCreep.hitsMax)
    //                         {
    //                             res = aCreep.heal(aCreep);
    //                             Log(LOG_LEVEL.info,aCreep.name+' TIME TO HEAL WHILE SPAWN IS AROUND!');
    //                         }
    //                     }
    //                 }
    //
    //             }
    //         }
    //     }
    // }
    // //
    // var aCreep = Game.creeps['derp'];
    // if (_.isUndefined(aCreep) && Game.time > (17888362 + 19955))
    // {
    //    _.find(Game.spawns).createCreep([MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK],'derp');
    // }
    // else if (!_.isUndefined(aCreep) && !aCreep.spawning)
    // {
    //     if (aCreep.pos.roomName != ROOM_NAME)
    //     {
    //         aCreep.moveTo(aPos,{reusePath: 0});
    //     }
    //     else
    //     {
    //         if (ROOM_NAME == 'W47N84')
    //         {
    //             aCreep.moveTo(aPos,{range: 0, reusePath: 0});
    //         }
    //         else
    //         {
    //             let aSpawn = _.find(aCreep.room.find(FIND_STRUCTURES),(aS) => aS.structureType == STRUCTURE_SPAWN && !aS.my);
    //             if (!_.isUndefined(aSpawn))
    //             {
    //                 let res = aCreep.moveTo(aSpawn,{range: 1, resusePath: 0});
    //                 Log(LOG_LEVEL.debug,'MOVING RES : '+ErrorString(res));
    //
    //                 res = aCreep.dismantle(aSpawn);
    //                 Log(LOG_LEVEL.debug,'DISMANTLE RES : '+ErrorString(res));
    //             }
    //         }
    //     }
    // }







    // ------- TEST ME ----------------
//    testCreepBody();


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
    //     let myLVL = 5;
    //     let aBuild = _.reduce(CONTROLLER_STRUCTURES, (res,aLevel,aKey) =>
    //     {
    //         if (aLevel[aIndex] > 0) _.set(res,aKey,aLevel[aIndex]);
    //         return res;
    //     },{});
    //     Log(LOG_LEVEL.debug,'LEVEL['+aIndex+']: '+JS(aBuild,true));
    // });

};



// -------------------------------------- TEST FUNCTIONS -------------------------------------------------------

testCreepBody = function()
{
    var aRoom = _.find(Game.rooms,(aR) => aR.name == 'W47N84');
    var aEnergy = RCL_ENERGY(aRoom.controller.level);
    var aCreepBody = new CreepBody();
    var aSearch =
    {
        name: ATTACK,
        //max:  10,//_.bind(getCarryMax,aRoom,aRoom.find(FIND_SOURCES)),    //({derp}) => getCarryMax(arguments[0]),
    };
    var aBodyOptions =
    {
        hasRoads: false,
        //moveBoost: '',
    };
    var aBody =
    {
        [HEAL]:
        {
            count: () => 1,///getWorkCount(),
        },
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
