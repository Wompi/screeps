
var GameManager = require('case.controller.GameManager');
var RoomManager = require('case.controller.RoomManager');
var RoomTraderManager = require('case.controller.RoomTraderManager');
var RemoteManager = require('case.controller.RemoteManager');

var TimeLine = require('case.main.TimeLine');


var StorageOperation = require('case.operations.storage.Operation');
var ReactionsHaulerOperation = require('case.operations.reactions.hauler.Operation');
var RemoteMinerOperation = require('case.operations.remote.mining.Operation');
var ReactionsProduceOperation = require('case.operations.reactions.produce.Operation');


var FixerOperation = require('case.operations.fixer.Operation');
var EnergyTransferOperation = require('case.operations.energytransfer.Operation');

// test stuff
var MemoryManager = require('case.MemoryManager');

var Traveler = require('Traveler');

module.exports.loop = function ()
{
    var startCPU = Game.cpu.getUsed();
    var a0 = Game.cpu.getUsed();
    require('case.globals').init(require('case.parameters'));
    require('case.extensions').extend();
    var b01 = Game.cpu.getUsed();

    // clean memory
    var a01 = Game.cpu.getUsed();
    for(var name in Memory.creeps)
    {
        if (Game.creeps[name] == undefined)
        {
            delete Memory.creeps[name];
        }
    }
    var b0 = Game.cpu.getUsed();

    var a1 = Game.cpu.getUsed();
    var aGameManager = new GameManager();
    aGameManager.init();
    var b1 = Game.cpu.getUsed();

    var a2 = Game.cpu.getUsed();
    var aLoop = (aRoom) =>
    {
        console.log('------------------------ ROOM - '+aRoom.name+' ----------------------------------------------');
        //aGameManager.printStats(aRoom.name);
        var aRoomManager = new RoomManager(aRoom);
        //aRoomManager.printRoomStats();
        aRoomManager.process();
    };
    _.forEach(Game.rooms,aLoop);
    var b2 = Game.cpu.getUsed();


    console.log('------------------------ ROOM TRADER ----------------------------------------------');
    var aRoomTraderManager = new RoomTraderManager();
    aRoomTraderManager.process();

    console.log('------------------------ REMOTE MANAGER ----------------------------------------------');
    var aRemoteManagerManager = new RemoteManager();
    aRemoteManagerManager.process();



    logWARN('PROFILE SCRIPT INIT: '+(b0-a0).toFixed(2)+' '+(b01-a0).toFixed(2)+' '+(b0-a01).toFixed(2));
    logWARN('PROFILE GAME INIT: '+(b1-a1).toFixed(2));
    logWARN('PROFILE ROOM LOOP: '+(b2-a2).toFixed(2));


    // TEST Stuff
    var a = Game.cpu.getUsed();
    _.forEach(Game.rooms, (a) => { logDERP('['+a.name+'] Maintenance costs: '+a.myMaintenanceCost) });
    var b = Game.cpu.getUsed();
    logWARN('PROFILE MAINTENANCE: '+(b-a));


    //logDERP(`<progress style='width: 1000px;' value='75' max='100'/>`);

    // Test Stuff
    // var a = Game.cpu.getUsed();
    // var oFixer = aGameManager.mFixerOperation;
    // _.forEach(aGameManager.mCreepManager.getCreepsForRole('fixer'), (aFixer) =>
    // {
    //     oFixer.registerEntity(aFixer,ROOM_OBJECT_TYPE.creep);
    // })
    // oFixer.processOperation();
    // var b = Game.cpu.getUsed();
    // logWARN('PROFILE: operations fixer - '+(b-a));


    Util.getMineralStorage();



    // var a = Game.cpu.getUsed();
    // var aTimeLine = new TimeLine();
    // aTimeLine.populateCreeps();
    // var b = Game.cpu.getUsed();
    // logWARN('PROFILE: timeline processing - '+(b-a));


    _.forEach(Game.rooms, (aRoom) =>
    {
        if (aRoom.my)
        {
            var aBody = Formula.calcUpgrader(aRoom);
            logDERP('U:('+aRoom.name+') '+JSON.stringify(aBody));
        }
    });

    // _.forEach(Game.rooms, (aRoom) =>
    // {
    //     var aBody = Formula.calcBuilder(aRoom);
    //     //logDERP('U: '+JSON.stringify(aBody));
    // });


    var aRoom = Game.rooms['E64N49'];
    Formula.calcHauler(aRoom);

//     var UpgraderOperation = require('case.operations.upgrader.Operation');
// //    var aRoom = Game.rooms['E64N49'];
//
//     _.forEach(Game.rooms, (aRoom) =>
//     {
//         var aOperation = new UpgraderOperation(aRoom);
//         aOperation.init();
//         aOperation.processOperation();
//     })

    // var aT1 = Game.rooms['E66N49'].storage;
    // var aT2 = Game.rooms['E66N48'].storage;
    //
    // var aPath = Util.getPath(aT1.pos,aT2.pos);
    // logDERP('PATH: '+aPath.path.length);


    //spawnSourceRelations()
    //minerSummary()
    //pointSourceRelations();

    //runBrawler();
    //runScout();

    var a = Game.cpu.getUsed();
    var aStorageOperation = new StorageOperation();
    aStorageOperation.processOperation();
    var b = Game.cpu.getUsed();
    logWARN('PROFILE STORAGE OPERATION: '+(b-a));

    var a = Game.cpu.getUsed();
    var aRMO_E65N48 = new RemoteMinerOperation(); // a remote mining operation
    aRMO_E65N48.processOperation();
    var b = Game.cpu.getUsed();
    logWARN('PROFILE REMOTE MINING OPERATION: '+(b-a));

    var a = Game.cpu.getUsed();
    var aRHO_E65N49 = new ReactionsHaulerOperation();
    aRHO_E65N49.processOperation();
    var b = Game.cpu.getUsed();
    logWARN('PROFILE REACTION HAULER OPERATION: '+(b-a));


    var a = Game.cpu.getUsed();
    var aRPO_E66N49 = new ReactionsProduceOperation();
    aRPO_E66N49.processOperation();
    var b = Game.cpu.getUsed();
    logWARN('PROFILE LAB PRODUCTION OPERATION: '+(b-a));


    //mineralRelations();


    // if (!_.isUndefined(aCreep) && !aCreep.spawning)
    // {
    //     if (_.isUndefined(Memory.moveTest))
    //     {
    //         Memory.moveTest = {};
    //         Memory.moveTest.index = 0;
    //     }
    //
    //     var a = Game.cpu.getUsed();
    //     //           655555654566766666667777777776
    //     var aDerp = '655555654566766666667777777776'; // 655555614566766666667777777776
    //
    //     if (!_.isUndefined(Memory.moveTest.pos) && !aCreep.pos.isEqualTo(Memory.moveTest.pos.x,Memory.moveTest.pos.y))
    //     {
    //         Memory.moveTest.index += 1;
    //         logDERP('Adjust index ...... '+Memory.moveTest.index);
    //     }
    //     if (!_.isUndefined(aDerp[Memory.moveTest.index]))
    //     {
    //         var result = aCreep.move(aDerp[Memory.moveTest.index]);
    //         logDERP('MOVE INDEX: '+Memory.moveTest.index+' direction = '+aDerp[Memory.moveTest.index]);
    //     }
    //     else
    //     {
    //         logDERP('Destination reached ....');
    //     }
    //
    //     var b = Game.cpu.getUsed();
    //     logWARN('PROFILE DERP PATHING: '+(b-a));
    //     Memory.moveTest.pos = aCreep.pos;
    // }
    // else
    // {
    //     delete Memory.moveTest;
    // }

    // var aStart = new RoomPosition(32,26,'E65N49');
    // var aEnd = new RoomPosition(22,16,'E63N47');
    // var aPath = Util.getPath(aStart,aEnd);
    //
    // var aLen = aPath.path.length;
    // _.forEach(aPath.path,(aPathPos) =>
    // {
    //     var aRoom = Game.rooms[aPathPos.roomName];
    //
    //     //logDERP('DERP: '+JSON.stringify(aRoom));
    //     if (_.isUndefined(aRoom))
    //     {
    //         logDERP('DERP: '+aPathPos.roomName)
    //         Game.getObjectById('5888b31e71305b7e590223a0').observeRoom(aPathPos.roomName);
    //         return false;
    //     }
    //     else
    //     {
    //         var aLook = aRoom.lookForAt(LOOK_FLAGS,aPathPos.x,aPathPos.y);
    //         //logDERP('DERP: '+JSON.stringify(aPathPos)+' len = '+aLook.length)
    //         if (aLook.length == 0)
    //         {
    //             //logDERP('aLook = '+JSON.stringify(aLook));
    //             aRoom.createFlag(aPathPos.x,aPathPos.y,undefined,COLOR_YELLOW,COLOR_YELLOW);
    //         }
    //     }
    //
    // })


    // aPath.path = [];
    // logDERP('PATH: ('+aLen+') '+JSON.stringify(aPath));

    _.forEach(Game.rooms, (aRoom) =>
    {
        if (aRoom.my)
        {
            Formula.calcBuilder(aRoom);
        }

    })

    //cleanTerminal();
    derpUpgrader();


    var a = Game.cpu.getUsed();
    var aFixerOperation = new FixerOperation();
    aFixerOperation.processOperation();
    var b = Game.cpu.getUsed();
    logWARN('PROFILE FIXER OPERATION: '+(b-a));



    var aEnergyTransferOperation = new EnergyTransferOperation();
    aEnergyTransferOperation.processOperation();



    var endCPU = Game.cpu.getUsed();
    console.log(
            'CPU START: '+startCPU.toFixed(2)
            +'\t\tDELTA: '+(endCPU-startCPU).toFixed(2)
            +'\tALL: '+endCPU.toFixed(2)
            +'\tBUCKET: '+Game.cpu.bucket
            +'\tTICK: '+Game.time
    );
};



minerSummary = function()
{
    var aMinerSum = {};
    _.forEach(Game.creeps, (aCreep) =>
    {
        if (aCreep.memory.role == 'miner')
        {
            var aCount = _.countBy(aCreep.body,'type');
            logDERP('Miner: '+aCreep.name+' '+JSON.stringify(aCount));
            aMinerSum = sumHashTables(aMinerSum,aCount);
        }
    })
    var aCost = _.reduce(aMinerSum, (res,a,b)  => res += BODYPART_COST[b] * a,0);
    logDERP('Miner sum = '+JSON.stringify(aMinerSum)+' cost = '+aCost);
}


mineralRelations = function()
{
    /// wow very nice delayed spawn -> source dist caclulation
    var mineralTest = MemoryManager.ensure(Memory,'mineralTest');

    var myExtractors = _.filter(Game.structures, (aStructure) =>
    {
        return aStructure.structureType == STRUCTURE_EXTRACTOR;
    });

    _.forEach(myExtractors, (aExtractor) =>
    {
        //var aExtractorMemory = MemoryManager.ensure(mineralTest,aExtractor.id);
        MemoryManager.ensure(mineralTest,aExtractor.id, () => myExtractors);
    });

    for (var i=0; i<myExtractors.length;i++)
    {
        var aExtractor = myExtractors[i];
        for (var j=0; j<myExtractors.length;j++)
        {
            var bExtractor = myExtractors[j];
            var aMod = (Game.time + (i*myExtractors.length + j)) % (myExtractors.length*myExtractors.length);
            if ( aMod == 0)
            {
               var aPath = Util.getPath(aExtractor.pos,bExtractor.pos);
               logDERP('Spawn: ['+i+' '+j+']'+'['+aExtractor.pos.x+' '+aExtractor.pos.y+'] - '+aPath.path.length+' incomplete='+aPath.incomplete);
               Memory.mineralTest[aExtractor.id][j].derp = aPath.path.length;
            }
        }
    }
    //var aSum  = _.sum(Memory.pointTest);
    //logDERP('POINT: sum = '+aSum);
}


pointSourceRelations = function()
{
    /// wow very nice delayed spawn -> source dist caclulation
    var pointTest = MemoryManager.ensure(Memory,'pointTest');
    var aPos = new RoomPosition(32,26,'E65N49');
    _.forEach(Game.rooms, (aRoom) =>
    {
        _.forEach(aRoom.getRoomObjects(ROOM_OBJECT_TYPE.source), (aSource) =>
        {
            MemoryManager.ensure(pointTest,aSource.id, () => 0);
        })
    })

    var mySources = [];
    _.forEach(Game.rooms, (aRoom) =>
    {
        mySources = mySources.concat(aRoom.getRoomObjects(ROOM_OBJECT_TYPE.source));
    })
    for (var j=0; j<mySources.length;j++)
    {
        var aSource = mySources[j];
        var aMod = (Game.time + j) % (mySources.length);
        if ( aMod == 0)
        {
           var aPath = Util.getPath(aSource.pos,aPos);
           logDERP('Spawn: ['+j+'][derp] '+'['+aSource.pos.x+' '+aSource.pos.y+'] - '+aPath.path.length+' incomplete='+aPath.incomplete);
           Memory.pointTest[aSource.id] = aPath.path.length;
        }
    }

    var aSum  = _.sum(Memory.pointTest);
    logDERP('POINT: sum = '+aSum);
}


spawnSourceRelations = function()
{
    /// wow very nice delayed spawn -> source dist caclulation
    var spawnTest = MemoryManager.ensure(Memory,'spawnTest');
    _.forEach(Game.spawns, (aSpawn) =>
    {
        var aSpawnMemory = MemoryManager.ensure(spawnTest, aSpawn.name);
        _.forEach(Game.rooms, (aRoom) =>
        {
            _.forEach(aRoom.getRoomObjects(ROOM_OBJECT_TYPE.source), (aSource) =>
            {
                MemoryManager.ensure(aSpawnMemory,aSource.id, () => 0);
            })
        })
    })

    var mySpawns = [];
    var mySources = [];
    _.forEach(Game.rooms, (aRoom) =>
    {
        if (aRoom.my)
        {
            mySources = mySources.concat(aRoom.getRoomObjects(ROOM_OBJECT_TYPE.source));
            mySpawns = mySpawns.concat(aRoom.getRoomObjects(ROOM_OBJECT_TYPE.spawn));
        }
    })
    for (var i=0; i<mySpawns.length;i++)
    {
            var aSpawn = mySpawns[i];
            for (var j=0; j<mySources.length;j++)
            {
                var aSource = mySources[j];
                var aMod = (Game.time + (i*mySources.length + j)) % (mySpawns.length*mySources.length);
                if ( aMod == 0)
                {
                    var aSpawnPos = aSpawn.getSpawnPos();
                    var aPath = Util.getPath(aSource.pos,(_.isUndefined(aSpawnPos) ? aSpawn.pos : aSpawnPos));
                    logDERP('Spawn: ['+i+' '+j+']['+aSpawn.name+'] '+'['+aSource.pos.x+' '+aSource.pos.y+'] - '+aPath.path.length+' incomplete='+aPath.incomplete);
                    Memory.spawnTest[aSpawn.name][aSource.id] = aPath.path.length;
                }
            }
    }

    _.forEach(Memory.spawnTest, (aSpawn,key) =>
    {
        var aSum  = _.sum(aSpawn);
        logDERP('SPAWN: '+JSON.stringify(key)+' sum = '+aSum);
    })

}


sumHashTables = function(pSum,pStore)
{
    return _.reduce(pStore, (res,a,b) =>
    {
        res[b] = _.isUndefined(res[b]) ? a : res[b] + a;
        return res;
    },pSum);
}

runScout = function()
{
    var myScout = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == 'scout'})
    if (_.isUndefined(myScout)) return;

    myScout.moveTo(new RoomPosition(25,25,'E64N49'));
}

derpUpgrader = function()
{

    var myUpgrader = _.filter(Game.creeps, (a) =>
    {
        return a.memory.role == 'upgrader' && !a.spawning && a.pos.roomName == 'E63N47';
    })

    _.forEach(myUpgrader, (aCreep) =>
    {
        if (aCreep.pos.isEqualTo(31,27))
        {
            if (Game.time % 2 == 0)
            {
                aCreep.moveTo(new RoomPosition(31,26,'E63N47'))
            }
            else
            {
                aCreep.moveTo(new RoomPosition(33,25,'E63N47'))
            }
        }
    })
}


cleanTerminal = function()
{
    var ROLE_NAME = 'terminal cleaner';
    var myCreep = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == ROLE_NAME })

    var aTerminal = Game.rooms['E66N48'].terminal;
    var aStorage = Game.rooms['E66N48'].storage;
    var aSpawn = Game.spawns['Brainpool'];

    if (_.sum(aTerminal.store) == 0 && (!_.isUndefined(myCreep) && _.sum(myCreep.carry) == 0))
    {
        // consider sucide ...
        return;
    }

    if (_.isUndefined(myCreep))
    {
        // 2200 = A * 75
        var aCarry = 10;
        var aMove = 5;


        var aC = new Array(aCarry).fill(CARRY);
        var aM = new Array(aMove).fill(MOVE);
        aBody = aC.concat(aM);

        var aCost = aCarry * 50 + aMove * 50;

        var result = aSpawn.createCreep(aBody,'T cleaner',{role: ROLE_NAME});
        logDERP('C:(T Cleaner)('+aSpawn.name+') '+aCost+' aCarry = '+aCarry+' aMove = '+aMove+' result = '+ErrorSting(result));
        return;
    }
    else
    {
        logDERP('Terminal cleaner active ......');
    }
    if (myCreep.spawning) return;


    if (_.sum(myCreep.carry) == 0)
    {
        if (myCreep.getLiveRenewTicks() > 3)
        {
            var aPos = new RoomPosition(30,20,'E66N48');
            myCreep.moveTo(aPos);
            return;
        }

        var aType = _.findKey(aTerminal.store, (a,b) =>
        {
            return a > 0;
        });
        if (!_.isUndefined(aType))
        {
            if (!myCreep.pos.isNearTo(aTerminal))
            {
                myCreep.travelTo(aTerminal);
            }
            else
            {
                myCreep.withdraw(aTerminal,aType);
            }
        }
    }
    else
    {
        var aType = _.findKey(myCreep.carry, (a,b) =>
        {
            return a > 0;
        });

        if (!myCreep.pos.isNearTo(aStorage))
        {
            myCreep.travelTo(aStorage);
        }
        else
        {
            myCreep.transfer(aStorage,aType);
        }
    }
}



runOxygenHauler = function()
{

    var myOxygenHauler = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == 'oxygen hauler' })

    var aStorage = Game.rooms['E66N48'].storage;
    var aTerminal = Game.rooms['E66N48'].terminal;
    var aTransactionCost = Game.market.calcTransactionCost(aTerminal.store[RESOURCE_OXYGEN],'E66N48','E64N49')

    if (_.isUndefined(aStorage.store[RESOURCE_OXYGEN]) && aTerminal.store[RESOURCE_ENERGY] >= aTransactionCost && !_.isUndefined(myOxygenHauler) && _.sum(myOxygenHauler.carry) == 0)
    {
        logDERP('Oxygen ready for transfer ...');
        return;
    }
    var aSpawn = Game.spawns['Brainpool'];
    if (_.isUndefined(myOxygenHauler))
    {
        var MY_ENERGY = aSpawn.room.energyCapacityAvailable - 300;

        logDERP('E:('+aSpawn.name+') '+MY_ENERGY+' e: '+aSpawn.room.energyAvailable);

        // 2200 = A * 75
        // aCarry = _.floor(MY_ENERGY / 75)
        // aMove = _.ceil(aCarry/2);
        var aCarry = 4
        var aMove = 2

        aC = new Array(aCarry).fill(CARRY);
        aM = new Array(aMove).fill(MOVE);
        aBody = aC.concat(aM);

        var aCost = aCarry * 50 + aMove * 50;

        var result = aSpawn.createCreep(aBody,'Oxygen',{role: 'oxygen hauler'});
        logDERP('C:('+aSpawn.name+') '+aCost+' aCarry = '+aCarry+' aMove = '+aMove+' result = '+ErrorSting(result));
        return;
    }
    else
    {
        logDERP('Oxygen hauler active ......');
    }
    if (myOxygenHauler.spawning) return;


    logDERP('TERMINAL:('+aSpawn.name+') transactionCost = '+aTransactionCost);

    if (_.sum(myOxygenHauler.carry) == 0)
    {
        if (!_.isUndefined(aStorage.store[RESOURCE_OXYGEN]))
        {
            if (myOxygenHauler.withdraw(aStorage,RESOURCE_OXYGEN) == ERR_NOT_IN_RANGE)
            {
                myOxygenHauler.moveTo(aStorage);
            }
        }
        else if (aTerminal.store[RESOURCE_ENERGY] < aTransactionCost)
        {
            if (myOxygenHauler.withdraw(aStorage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            {
                myOxygenHauler.moveTo(aStorage);
            }
        }
    }
    else
    {
        if (!_.isUndefined(myOxygenHauler.carry[RESOURCE_OXYGEN]))
        {
            if (myOxygenHauler.transfer(aTerminal,RESOURCE_OXYGEN) == ERR_NOT_IN_RANGE)
            {
                myOxygenHauler.moveTo(aTerminal);
            }
        }
        else if (myOxygenHauler.carry[RESOURCE_ENERGY] > 0)
        {
            if (myOxygenHauler.transfer(aTerminal,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            {
                myOxygenHauler.moveTo(aTerminal);
            }
        }

    }
}




runBrawler = function()
{
    var myCreeps = _.filter(Game.creeps, (a) => {return (a.memory.role == 'derp' && !a.spawning);});
    if (myCreeps.length == 0) return;
    // for starters we only handle one fixer
    var aCreep = myCreeps[0];

    logDERP('BLARK')

    var aRoom = aCreep.room;

    if (aRoom.name != 'E66N48')
    {
        var resultA = aCreep.moveTo(new RoomPosition(25,25,'E64N49'));
        return;
    }

    // if (aRoom.name != 'E65N48')
    // {
    //     var result = aCreep.moveTo(new RoomPosition(25,25,'E65N48'));
    //     logDERP(' BRAWLER moves to ... room .. '+ErrorSting(result));
    //     return;
    // }
    logDERP('DERP')
    var invaders = aRoom.find(FIND_HOSTILE_CREEPS);

    // var mySpawns = aRoom.find(FIND_STRUCTURES,
    // {
    //     filter: (a) =>
    //     {
    //         return a.structureType == STRUCTURE_SPAWN;
    //     }
    // });
    // var aSpawn = mySpawns[0]
    // if (_.isUndefined(aSpawn))
    // {
    //     if (invaders.length == 0)
    //     {
    //         var myExtensions = aRoom.find(FIND_STRUCTURES,
    //         {
    //             filter: (a) =>
    //             {
    //                 return a.structureType == STRUCTURE_EXTENSION;
    //             }
    //         });
    //         if (myExtensions.length == 0) return;
    //
    //         var aExtension = _.min(myExtensions, (a) => { return aCreep.pos.getRangeTo(a);});
    //         var resultA = aCreep.moveTo(aExtension);
    //         var resultB = aCreep.attack(aExtension);
    //
    //         logDERP(' BRAWLER =  '+ErrorSting(resultA)+' '+ErrorSting(resultB));
    //         return;
    //     }
    //     var aInvader = _.min(invaders, (a) => { return aCreep.pos.getRangeTo(a)});
    //
    //     if (!aCreep.pos.isNearTo(aInvader))
    //     {
    //         var result = aCreep.moveTo(aInvader)
    //         logDEBUG('Brawler engages .....'+ErrorSting(result));
    //     }
    //     var result = aCreep.attack(aInvader);
    //     logWARN('ATTACK: '+ErrorSting(result));
    //     return;
    // }

    var resultA = aCreep.moveTo(invaders[0]);
    var resultB = aCreep.attack(invaders[0]);

    logDERP(' BRAWLER =  '+ErrorSting(resultA)+' '+ErrorSting(resultB));
}
