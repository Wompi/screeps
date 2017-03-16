



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
    WorldPosition:      require('case.design.WorldPosition'),
    ReactionManager:    require('case.design.ReactionManager'),
    SpawnManager:       require('case.design.SpawnManager'),
    Operation:          require('case.design.Operation'),
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
    ResettleOperation:          require('case.operations.resettle.Operation'),
    ResettleVisual:             require('case.operations.resettle.Visual'),
    DefenseOperation:           require('case.operations.defense.Operation'),
    ClaimOperation:             require('case.operations.claim.Operation'),
    MiningOperation:            require('case.operations.mining.Operation'),
    LoadingOperation:           require('case.operations.loading.Operation'),
    LinkOperation:              require('case.operations.link.Operation'),
    FixerOperation:             require('case.operations.fixer.Operation'),
    ReserveOperation:           require('case.operations.reserve.Operation'),
    UpgraderOperation:          require('case.operations.upgrader.Operation'),
    BuilderOperation:           require('case.operations.builder.Operation'),
    HaulerOperation:            require('case.operations.hauler.Operation'),
    MineralOperation:           require('case.operations.mineral.Operation'),
    MineralHaulerOperation:     require('case.operations.hauler.mineral.Operation'),
    ReactionsHaulerOperation:   require('case.operations.hauler.reactions.Operation'),
    DefenseRemoteOperation:     require('case.operations.defense.remote.Operation'),
    Traveler:                   require('Traveler'),
    Market:                     require('case.Market'),
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
    ReactMan: new ReactionManager(),
    SpawnMan: new SpawnManager(),
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
                () => [new DefenseRemoteOperation('W46N83')],
                () => [new DefenseOperation()],
                () => [new ReactionsHaulerOperation(Game.rooms['W47N84'])],
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
                    let myMineralHaulerOps = [];
                    let myExtractors = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.extractor), (aE) => aE.isReady());
                    let aCount = 0;
                    _.each(myExtractors, (aE) =>
                    {
                        myMineralHaulerOps.push(new MineralHaulerOperation(PCache.getFriendlyEntityCacheByID(aE.room.id)));
                    });
                    return myMineralHaulerOps;
                },
                () => [new FixerOperation()],
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
                () =>
                {
                    let myMineralOps = [];
                    let myExtractors = PCache.getFriendlyEntityCache(ENTITY_TYPES.extractor);
                    let aCount = 0;
                    Log(LOG_LEVEL.debug,'MINERAL OPS: '+myExtractors.length)
                    _.each(myExtractors, (aE) =>
                    {

                        _.each(aE.miningPositions, (a,x) =>
                        {
                            _.each(a, (ia,y) =>
                            {
                                myMineralOps.push(new MineralOperation(aCount,aE));
                                aCount = aCount + 1;
                            });
                        });
                    });
                    return myMineralOps;
                },
            ];

        myOperations = myOperations.reverse();
        _.each(myOperations, (aCall,aIndex) =>
        {
            //Log(undefined,'------------------------- START ---------------------------');
            var myCall = undefined;
            Pro.register( () =>
            {
                myCall = aCall();
            },'Call');

            _.each(myCall, (aOps) =>
            {
                Pro.register( () =>
                {
                    aOps.processOperation()
                },'Operation '+aOps.getName());
            });
            //Log(undefined,'------------------------- END ---------------------------');

        });
    },'operations all')

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

    let aSum = ReactMan.getMineralStorage();
    // aSum['O'] = 3000;
    // aSum['OH'] = 3000;
    // aSum['LH'] = 3000;
    // aSum['LO'] = 3000;
    let myReactions = ReactMan.getPossibleReactions(aSum);
    Log(LOG_LEVEL.debug,'REACTIONS: '+JS(myReactions));

    let myResult =  ReactMan.getAttributesForReactions(myReactions);
    Log(LOG_LEVEL.debug,'ATTRIBUTES: '+JS(myResult));


    PCache.printStats();
    var end = Game.cpu.getUsed();

    // Pro.register( () =>
    // {
    //     M.fetchNextResource();
    //     M.printOrderMap();
    //
    // },'market fetch');

    Pro.printRegister();
    Log(LOG_LEVEL.warn,'GAME['+Game.time+']: [ '+start.toFixed(2)+' | '+(end-start).toFixed(2)+' | '+end.toFixed(2)+' ] BUCKET: '+Game.cpu.bucket+' '+SNode.printStats(false));


    // ------- TEST ME ----------------
    //PMan.newTest();
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
