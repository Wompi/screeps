
var GameManager = require('case.controller.GameManager');
var RoomManager = require('case.controller.RoomManager');
var RoomTraderManager = require('case.controller.RoomTraderManager');
var RemoteManager = require('case.controller.RemoteManager');

var TimeLine = require('case.main.TimeLine');

// test stuff
var MemoryManager = require('case.MemoryManager');


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

    var endCPU = Game.cpu.getUsed();
    console.log(
            'CPU START: '+startCPU.toFixed(2)
            +'\t\tDELTA: '+(endCPU-startCPU).toFixed(2)
            +'\tALL: '+endCPU.toFixed(2)
            +'\tBUCKET: '+Game.cpu.bucket
            +'\tTICK: '+Game.time
    );

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
        var aBody = Formula.calcUpgrader(aRoom);
        logDERP('U:('+aRoom.name+') '+JSON.stringify(aBody));
    });

    // _.forEach(Game.rooms, (aRoom) =>
    // {
    //     var aBody = Formula.calcBuilder(aRoom);
    //     //logDERP('U: '+JSON.stringify(aBody));
    // });


    var aRoom = Game.rooms['E64N49'];
    Formula.calcHauler(aRoom);


    var derp = require('helam.consolebuttons.CreepConsoleButton');

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


    spawnSourceRelations()
    //minerSummary()
    //pointSourceRelations();

    //runBrawler();
    //runScout();
    //runOxygenHauler();  // run this when the oxygen room has finished his oxygen mining
    //runOxygenTransfer(); // run this when youhvae transfered the oxygen to the lab room
    runLabHauler(); // run this when oxygen is available in the lab room
    //mineralRelations();
    //runUltriumOxideTransfer();
    //runUOBoostLabHauler();
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
        mySources = mySources.concat(aRoom.getRoomObjects(ROOM_OBJECT_TYPE.source));
        mySpawns = mySpawns.concat(aRoom.getRoomObjects(ROOM_OBJECT_TYPE.spawn));
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
                   var aPath = Util.getPath(aSource.pos,aSpawn.getSpawnPos());
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


runUOBoostLabHauler = function()
{
    var myBoostHauler = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == 'uo boost hauler' })
    var aTerminal = Game.rooms['E65N49'].terminal;
    var aSpawn = Game.spawns['Nexus Outpost'];
    var L1_boost = Game.getObjectById('586c4b1463d011e1364344ae');

    if (_.isUndefined(aTerminal.store[RESOURCE_UTRIUM_OXIDE]) && L1_boost.mineralAmount == L1_boost.mineralCapacity && !_.isUndefined(myBoostHauler) && _.sum(myBoostHauler.carry) == 0)
    {
        logDERP('No UtriumOxyde in terminal ...');
        if (!_.isUndefined(myBoostHauler))
        {
            myUOTransfer.suicide();
        }
        return;
    }

    if (_.isUndefined(myBoostHauler))
    {
        // 2200 = A * 75
        var aCarry = 1;
        var aMove = 1;

        var aC = new Array(aCarry).fill(CARRY);
        var aM = new Array(aMove).fill(MOVE);
        aBody = aC.concat(aM);

        var aCost = aCarry * 50 + aMove * 50;

        var result = aSpawn.createCreep(aBody,'UO Boost Hauler',{role: 'uo boost hauler'});
        logDERP('C:('+aSpawn.name+') '+aCost+' aCarry = '+aCarry+' aMove = '+aMove+' result = '+ErrorSting(result));
        return;
    }
    else
    {
        logDERP('UO boost hauler active ......');
    }
    if (myBoostHauler.spawning) return;

    if (_.sum(myBoostHauler.carry) == 0)
    {
        if (myBoostHauler.ticksToLive < 10) return; // don't grab anything befor dying

        var aDelta = L1_boost.mineralCapacity - L1_boost.mineralAmount;
        if (myBoostHauler.withdraw(aTerminal,RESOURCE_UTRIUM_OXIDE,_.min([aDelta,myBoostHauler.carryCapacity])) == ERR_NOT_IN_RANGE)
        {
            myBoostHauler.moveTo(aTerminal);
        }
    }
    else
    {
        if (myBoostHauler.transfer(L1_boost,RESOURCE_UTRIUM_OXIDE) == ERR_NOT_IN_RANGE)
        {
            myBoostHauler.moveTo(L1_boost);
        }
    }
}


runLabHauler = function()
{
    var myLabHauler = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == 'lab hauler' })

    var aStorage = Game.rooms['E66N49'].storage;
    var aSpawn = Game.spawns['Casepool'];

    if (_.isUndefined(myLabHauler))
    {
        // 2200 = A * 75
        var aCarry = 1;
        var aMove = 1;

        var aC = new Array(aCarry).fill(CARRY);
        var aM = new Array(aMove).fill(MOVE);
        aBody = aC.concat(aM);

        var aCost = aCarry * 50 + aMove * 50;

        var result = aSpawn.createCreep(aBody,'Lab Hauler',{role: 'lab hauler'});
        logDERP('C:('+aSpawn.name+') '+aCost+' aCarry = '+aCarry+' aMove = '+aMove+' result = '+ErrorSting(result));
        return;
    }
    else
    {
        logDERP('Lab hauler active ......');
    }
    if (myLabHauler.spawning) return;

    var aMovePos = new RoomPosition(40,6,'E66N49');
    var L1 = Game.getObjectById('5867921d862806344b052a98');
    var L2 = Game.getObjectById('584ddf9dc45664f473ab147a');
    var L3 = Game.getObjectById('58670e6d0c5eca9113b48bcb');

    if (_.sum(myLabHauler.carry) == 0)
    {
        if (myLabHauler.ticksToLive < 3) return; // don't grab anything befor dying


        if (L1.mineralAmount < L2.mineralAmount)
        {
            var aDelta = _.min([L1.mineralCapacity - L1.mineralAmount,myLabHauler.carryCapacity]);
            if (myLabHauler.withdraw(aStorage,RESOURCE_OXYGEN,aDelta) == ERR_NOT_IN_RANGE)
            {
                myLabHauler.moveTo(aMovePos);
            }
            if (aDelta == 0)
            {
                var result = myLabHauler.cancelOrder('withdraw');
                logDERP('myLabHauler L1 withdraw - '+ErrorSting(result));
            }
        }
        else if (L2.mineralAmount < L2.mineralCapacity)
        {
            var aDelta = _.min([L2.mineralCapacity - L2.mineralAmount,myLabHauler.carryCapacity]);
            if (myLabHauler.withdraw(aStorage,RESOURCE_UTRIUM,aDelta) == ERR_NOT_IN_RANGE)
            {
                myLabHauler.moveTo(aMovePos);
            }
            if (aDelta == 0)
            {
                var result = myLabHauler.cancelOrder('withdraw');
                logDERP('myLabHauler L2 withdraw - '+ErrorSting(result));
            }
        }
        else
        {
            logDERP('Lab transfer IDLE ......');
            if (L3.mineralAmount > 0)
            {
                myLabHauler.withdraw(L3,L3.mineralType);
            }
        }
    }
    else
    {
        if (!_.isUndefined(myLabHauler.carry[RESOURCE_UTRIUM]))
        {
            if (myLabHauler.transfer(L2,RESOURCE_UTRIUM) == ERR_NOT_IN_RANGE)
            {
                myLabHauler.moveTo(aMovePos);
            }
        }
        else if (!_.isUndefined(myLabHauler.carry[RESOURCE_OXYGEN]))
        {
            if (myLabHauler.transfer(L1,RESOURCE_OXYGEN) == ERR_NOT_IN_RANGE)
            {
                myLabHauler.moveTo(aMovePos);
            }
        }
        else
        {
            var aReactionType = REACTIONS[L1.mineralType][L2.mineralType];


            var result = myLabHauler.transfer(aStorage,aReactionType);
            logDERP('Lab hauler storage ('+aReactionType+') - '+ErrorSting(result));
        }
    }


    // run lab reaction
    var result = L3.runReaction(L1,L2);
    logDERP('LAB REACTION: '+ErrorSting(result));

}


runUltriumOxideTransfer = function()
{
    var myUOTransfer = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == 'uo transfer' })

    var aTerminal = Game.rooms['E66N49'].terminal;
    var aStorage = Game.rooms['E66N49'].storage;
    var aTransactionCost = Game.market.calcTransactionCost(aTerminal.store[RESOURCE_UTRIUM_OXIDE],'E66N49','E65N49')

    if (_.isUndefined(aStorage.store[RESOURCE_UTRIUM_OXIDE]) && aTerminal.store[RESOURCE_ENERGY] >= aTransactionCost && !_.isUndefined(myUOTransfer) && _.sum(myUOTransfer.carry) == 0)
    {
        logDERP('No UtriumOxyde in storage ...');
        if (!_.isUndefined(myUOTransfer))
        {
            myUOTransfer.suicide();
        }
        return;
    }
    var aSpawn = Game.spawns['Casepool'];
    if (_.isUndefined(myUOTransfer))
    {
        // 2200 = A * 75
        var aCarry = 4;
        var aMove = 2;


        var aC = new Array(aCarry).fill(CARRY);
        var aM = new Array(aMove).fill(MOVE);
        aBody = aC.concat(aM);

        var aCost = aCarry * 50 + aMove * 50;

        var result = aSpawn.createCreep(aBody,'UO Transfer',{role: 'uo transfer'});
        logDERP('C:(UO transfer)('+aSpawn.name+') '+aCost+' aCarry = '+aCarry+' aMove = '+aMove+' result = '+ErrorSting(result));
        return;
    }
    else
    {
        logDERP('Utrium Oxide transfer active ......');
    }
    if (myUOTransfer.spawning) return;

    logDERP('TERMINAL:('+aSpawn.name+') transactionCost = '+aTransactionCost);

    var aMovePos = new RoomPosition(38,7,'E66N49');
    if (_.sum(myUOTransfer.carry) == 0)
    {
        if (!_.isUndefined(aStorage.store[RESOURCE_UTRIUM_OXIDE]))
        {
            if (myUOTransfer.withdraw(aStorage,RESOURCE_UTRIUM_OXIDE) == ERR_NOT_IN_RANGE)
            {
                myUOTransfer.moveTo(aMovePos);
            }
        }
        else if (aTerminal.store[RESOURCE_ENERGY] < aTransactionCost)
        {
            var aLink = _.filter(aSpawn.room.getRoomObjects(ROOM_OBJECT_TYPE.link), (aLink) =>
            {
                return aLink.energy > 0 && aLink.isNearTo(myUOTransfer);
            });
            var aTarget = aLink.length == 0 ? aStorage : aLink[0];

            if (myUOTransfer.withdraw(aTarget,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            {
                myUOTransfer.moveTo(aStorage);
            }
        }
    }
    else
    {
        if (!_.isUndefined(myUOTransfer.carry[RESOURCE_UTRIUM_OXIDE]))
        {
            if ((myUOTransfer.transfer(aTerminal,RESOURCE_UTRIUM_OXIDE) == ERR_NOT_IN_RANGE) || !myUOTransfer.pos.isEqualTo(aMovePos))
            {
                myUOTransfer.moveTo(aMovePos);
            }
        }
        else if (myUOTransfer.carry[RESOURCE_ENERGY] > 0)
        {
            if (myUOTransfer.transfer(aTerminal,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            {
                myUOTransfer.moveTo(aTerminal);
            }
        }
    }
}



runOxygenTransfer = function()
{
    var myOxygenTransfer = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == 'oxygen transfer' })

    var aTerminal = Game.rooms['E66N49'].terminal;
    var aStorage = Game.rooms['E66N49'].storage;

    if (_.isUndefined(aTerminal.store[RESOURCE_OXYGEN]) && !_.isUndefined(myOxygenTransfer) && _.sum(myOxygenTransfer.carry) == 0)
    {
        logDERP('No Oxygen in terminal ...');
        if (!_.isUndefined(myOxygenTransfer))
        {
            myOxygenTransfer.suicide();
        }
        return;
    }
    var aSpawn = Game.spawns['Casepool'];
    if (_.isUndefined(myOxygenTransfer))
    {
        // 2200 = A * 75

        var aC = new Array(6).fill(CARRY);
        var aM = new Array(3).fill(MOVE);
        aBody = aC.concat(aM);

        var aCost = 6 * 50 + 3 * 50;

        var result = aSpawn.createCreep(aBody,'Oxygen Transfer',{role: 'oxygen transfer'});
        logDERP('C:('+aSpawn.name+') '+aCost+' aCarry = '+6+' aMove = '+3+' result = '+ErrorSting(result));
        return;
    }
    else
    {
        logDERP('Oxygen transfer active ......');
    }
    if (myOxygenTransfer.spawning) return;

    var aMovePos = new RoomPosition(38,7,'E66N49');
    if (_.sum(myOxygenTransfer.carry) == 0)
    {
        if (!_.isUndefined(aTerminal.store[RESOURCE_OXYGEN]))
        {
            if (myOxygenTransfer.withdraw(aTerminal,RESOURCE_OXYGEN) == ERR_NOT_IN_RANGE)
            {
                myOxygenTransfer.moveTo(aMovePos);
            }
        }
    }
    else
    {
        if (!_.isUndefined(myOxygenTransfer.carry[RESOURCE_OXYGEN]))
        {
            if ((myOxygenTransfer.transfer(aStorage,RESOURCE_OXYGEN) == ERR_NOT_IN_RANGE) || !myOxygenTransfer.pos.isEqualTo(aMovePos))
            {
                myOxygenTransfer.moveTo(aMovePos);
            }
        }
    }
}


runOxygenHauler = function()
{

    var myOxygenHauler = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == 'oxygen hauler' })

    var aStorage = Game.rooms['E66N48'].storage;
    var aTerminal = Game.rooms['E66N48'].terminal;
    var aTransactionCost = Game.market.calcTransactionCost(aTerminal.store[RESOURCE_OXYGEN],'E66N48','E66N49')

    if (_.isUndefined(aStorage.store[RESOURCE_OXYGEN]) && aTerminal.store[RESOURCE_ENERGY] >= aTransactionCost)
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
        aCarry = _.floor(MY_ENERGY / 75)
        aMove = _.ceil(aCarry/2);

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
