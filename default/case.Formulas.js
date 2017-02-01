class Formulas
{
    constructor()
    {

    }

    // formula:
    // - B = A/2 (roads)
    // - C = A * 50 + B * 50
    // - C = A * 50 + A * 25
    // - C = A * 75  ->     A = C/75
    //
    // - CREEP_LIFE_TIME = 1500
    //
    // - T = CREEP_LIFE_TIME - startLength
    // - C = CREEP_LIFE_TIME - startLength / 2 * aTravelLength
    // - check if C is more than hauler lifeTime
    calcMineralHauler()
    {
        var aRoom = Game.rooms['E65N49'];
        var mySpawns = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.spawn);
        if (mySpawns.length == 0) return;

        var aStorage = aRoom.storage;
        if (_.isUndefined(aStorage)) return;

        var aSpawn = _.min(mySpawns, (aSpawn) =>
        {
            var aPos = aSpawn.getSpawnPos();
            var aStartLength = Util.getPath(aPos,aStorage.pos).path.length;
            return aStartLength;
        });


        var bStorage = Game.rooms['E66N49'].storage;
        var aTravelLength = Util.getPath(aStorage.pos,bStorage.pos).path.length;


        var MY_ENERGY = aRoom.energyCapacityAvailable;
        var aMineralStore = aStorage.getStoredMineral();
        logDERP('aMineralStore = '+JSON.stringify(aMineralStore));


        //var aA_wanted = _.ceil(CREEP_LIFE_TIME - aStartLength / 2 * aTravelLength)
        var aA_possible = _.floor(_.min([50 / 1.5  ,MY_ENERGY / 75]));

        logDERP(' Init Spawn: '+aSpawn.name+' Travel: '+aTravelLength+' aA_possible: '+aA_possible);

    }

    // B = 2*A;
    // C = (A+B) / 2
    // E = A * 100 * B * 50 + C * 50;
    calcBuilder(pRoom)
    {
        var MY_ENERGY = pRoom.energyCapacityAvailable;
        var aMax = ( 50 * 2 ) / 9
        var aWork = _.floor(_.min([aMax,MY_ENERGY / 275]));
        var aCarry = 2*aWork;
        var aMove = _.ceil((aWork+aCarry)/2);

        var aW = new Array(aWork).fill(WORK);
        var aC = new Array(aCarry).fill(CARRY);
        var aM = new Array(aMove).fill(MOVE);

        var aBody = aW.concat(aC).concat(aM);

        logDERP('BUILDER:('+pRoom.name+') work = '+aWork+' carry = '+aCarry+' move = '+aMove);
        return aBody;
    }

    // formula:
    // - B = A/2 (roads)
    // - C = A * 100 + B * 50
    // - A = C / 125
    //
    // - Mining capacity:
    // - HARVEST_MINERAL_POWER = 1
    // - EXTRACTOR_COOLDOWN = 5
    // - CREEP_LIFE_TIME = 1500
    //
    // - T = CREEP_LIFE_TIME - startLength
    // - C = T * (A * HARVEST_MINERAL_POWER / EXTRACTOR_COOLDOWN )
    // - check if C is more than hauler lifeTime
    calcMineralMiner(pSpawn)
    {
        var aSpawnPos = pSpawn.getSpawnPos();
        if (_.isUndefined(aSpawnPos)) return;

        var aRoom = pSpawn.room;
        var myExtractors = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.extractor);
        if (myExtractors.length == 0) return;
        var aExtractor = myExtractors[0];
        if (!aExtractor.hasMiningBox) return;
        var myMineralSources = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.mineral);
        if (myMineralSources.length == 0) return;
        var aMineral = myMineralSources[0];

        var aMineralAmount = aMineral.mineralAmount;
        var aMineralTicks = aMineral.ticksToRegeneration;

        var aEndPos = aExtractor.myMiningBoxes[0].pos;
        var MY_ENERGY = aRoom.energyCapacityAvailable;
        var aStartPath = Util.getPath(aSpawnPos,aEndPos);
        var aStartLength = aStartPath.path.length;

        var aT = CREEP_LIFE_TIME - aStartLength;
        // ceil for wanted because we need one more to make sure we get all resources
        // - otherwise there will be a rest at the end of the lifetime of the creep
        // floor for possible - well we can not use more than we have
        var aA_wanted = _.ceil((aMineralAmount / aT ) * (EXTRACTOR_COOLDOWN+1) / HARVEST_MINERAL_POWER);
        // we only can build creeps with 50 body parts so we have to restrict the result to )50 / 1.5) (50 = A + A/2)
        var aA_possible = _.floor(_.min([ 50 / 1.5, MY_ENERGY / (BODYPART_COST[WORK] + BODYPART_COST[MOVE]/2)]));

        var aA = _.min([aA_wanted,aA_possible])
        var aB = _.ceil(aA/2);

        var aWork = new Array(aA).fill(WORK);
        var aMove = new Array(aB).fill(MOVE);
        var aBody = aWork.concat(aMove);

        var aCost = aWork.length * 100 + aMove.length * 50;

        logDERP('aStartPath: '+aStartLength+' aT = '+aT+' aA_wanted = '+aA_wanted+' aA_possible = '+aA_possible+' aA = '+aA+' aBody = '+JSON.stringify(_.countBy(aBody)));
        logDERP('enrgyCap: '+MY_ENERGY+' aCost: = '+aCost);
        return aBody;
    }


    // formula:
    // - B = A/2 (roads)
    // - C = A * 50 + B * 50
    // - C = A * 50 + A * 25
    // - C = A * 75  ->     A = C/75
    // A = aTravelPath.path.length * 2 * aSourceHarvest / 50
    // E = A * 50 + A/2 * 50 = A * 75
    calcHauler(pRoom)
    {
        var myRoomSources = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.source);
        var myRoomSpawns = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.spawn);
        var aController = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.controller)[0];

        var aBox = aController.myUpgraderBoxes[0];
        var myExtensionBays = pRoom.myExtensionBays;


        var MY_ENERGY = pRoom.energyCapacityAvailable;

        _.forEach(myRoomSources, (aSource) =>
        {
            var aTravelPath = Util.getPath(aSource.pos,aBox.pos);

            var aSourceHarvest = 10 ; // 10 per ticks
            var aHaulCap_needed = aTravelPath.path.length * 2 * aSourceHarvest;


            var aA_possible = _.floor(_.min([50 / 1.5  ,MY_ENERGY / 75]));

            var aA_wanted = _.floor(_.min([50 / 1.5  ,_.ceil(aHaulCap_needed/50)]));
            logDERP('aTravelPath: '+aTravelPath.path.length+' aHaulCap_needed = '+aHaulCap_needed+' aA_possible = '+aA_possible+' aA_wanted = '+aA_wanted);
        })

    }

    // - C = A/2 (roads)
    // - B = 1
    // - E = A * 100 + B * 50 + C * 50
    //
    // - A = (E- 75) / 125
    calcUpgrader(pRoom)
    {
        var MY_ENERGY = pRoom.energyCapacityAvailable;

        var myRoomMiningSources = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.source);
        var myRoomController = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.controller);
        var aStorage = pRoom.storage;
        if (myRoomController.length == 0) return undefined;

        var aController = myRoomController[0];
        var aControllerLevel = aController.level;
        var isCloseToSpawn = aController.isCloseToSpawn;

        var aCarry_possible = 1;
        var aWork_possible = _.floor(_.min([ (50 - aCarry_possible)/ 1.5,(MY_ENERGY - 75 ) / 125]));

        if (aControllerLevel == 8)
        {
            aWork_possible = CONTROLLER_MAX_UPGRADE_PER_TICK;
        }

        var aMove_possible = isCloseToSpawn ? 1 : _.ceil((aWork_possible) / 2);

        var aMaintenceCost = pRoom.myMaintenanceCost;
        var aStorageOverflow = _.isUndefined(aStorage) ? 0 : _.max([0,aStorage.store[RESOURCE_ENERGY] - 50000]);
        //logDERP('aStorageOverflow = '+aStorageOverflow);
        var aWork_wanted = _.max([1,_.ceil((15000 * myRoomMiningSources.length + aStorageOverflow - aMaintenceCost)/ 1500)]); // we maintain at least one workpart for the upgraders

        var aCarry_wanted = 1;

        aWork_wanted = _.floor(_.min([ (50 - aCarry_wanted)/ 1.5,aWork_wanted]));

        if (aControllerLevel == 8)
        {
            aWork_wanted = CONTROLLER_MAX_UPGRADE_PER_TICK;
        }

        var aMove_wanted = isCloseToSpawn ? 1 : _.ceil((aWork_wanted) / 2);

        var aCount = _.floor(aWork_wanted/aWork_possible);

        if (aControllerLevel == 8)
        {
            aCount = 0;
        }
        //logDERP('UPGRADER:('+pRoom.name+') work = '+aWork_possible+'/'+aWork_wanted+' carry = '+aCarry_possible+'/'+aCarry_wanted+' move = '+aMove_possible+'/'+aMove_wanted);
        //logDERP('COUNT: '+aCount);

        var aWork = _.min([aWork_possible,aWork_wanted]);
        var aCarry = _.min([aCarry_possible,aCarry_wanted]);
        var aMove = _.min([aMove_possible,aMove_wanted]);

        var aCost = aWork * BODYPART_COST[WORK] + aCarry * BODYPART_COST[CARRY] + aMove * BODYPART_COST[MOVE];

        return {work: aWork, carry: aCarry, move: aMove, cost: aCost, aCount: aCount};
    }


    // This function calculates the optimal remoteminer when we need to carry as well
    //
    // BASE FORMULA:
    //  - a = [1...20];
    //  - c = (a+b)/2 (roads) (a+b) (no roads)
    //  - b = calculated
    //  - 2100 = a*100 + b*50 +c*50
    //
    // TODO: there is for sure a solution without the loop for aWork - look for it
    //
    calcMiner(hasRoads)
    {
        if (!_.isUndefined(Memory.minerTest))
        {
            delete Memory.minerTest;
        }

        var myFlags = _.filter(Game.flags,Flag.FLAG_COLOR.remote.miner.filter);
        if (myFlags.length == 0) return;
        var aFlag = myFlags[0];



        var aSpawn = _.min(Game.spawns, (a) =>
        {

            var aPath = Util.getPath(a.pos,aFlag.pos);
            return aPath.path.length;
        })      ;
        logDERP('Closest Spawn: '+aSpawn.name);



        var aStorage = Game.rooms['E65N49'].storage;

        var aStartPath = Util.getPath(aSpawn.pos,aFlag.pos);
        var aTravelPath = Util.getPath(aFlag.pos,aStorage.pos);

        logDERP(' aStartPath: '+aStartPath.path.length);
        logDERP(' aTravelPath: '+aTravelPath.path.length);

        var aAll = [];

        var MY_ENERGY = aSpawn.room.energyCapacityAvailable;

        for (var j=50; j<=MY_ENERGY;j = j + 50)
        {
            for (var i=1; i<50; i++)
            {
                var aWork = 0;
                var aCarry = 0;
                var aMove = 0;

                if (hasRoads)
                {
                    aWork = i
                    aCarry = _.floor((j - aWork * 125)/75)
                    aMove = _.ceil((aWork+aCarry)/2)
                }
                else
                {
                    aWork = i
                    aCarry = _.floor((j - aWork * 150)/100)
                    aMove = _.ceil((aWork+aCarry))
                }
                var aCost = aWork*BODYPART_COST[WORK] + aCarry*BODYPART_COST[CARRY] + aMove*BODYPART_COST[MOVE];
                if (aCost > j || aCarry <= 0)
                {
                    break;
                }
                var aCargo = (aCarry*50);
                var aTick = _.floor(aCargo / (aWork*HARVEST_POWER));
                var aTime = _.floor((CREEP_LIFE_TIME - aStartPath.path.length)/(2*aTravelPath.path.length+aTick));
                var aMargin =   (aTime * aCargo) - aCost;
                var aQuantity = i + aCarry + aMove;
                //logDERP(' W:\t'+i+'\tC: '+aCarry+'\tM: '+aMove+'\tQ: '+aQuantity+'\tC: '+aCargo+'\tT: '+aTick+'\tH:'+aTime+'\tM:'+aMargin+'\tcost: '+aCost);

                if (aQuantity <= 50)
                {
                    var aBody =
                    {
                        startPath: aStartPath.path.length,
                        travelPath: aTravelPath.path.length,
                        energyAvailable: j,
                        workParts: i,
                        carryParts: aCarry,
                        moveParts: aMove,
                        bodyCount: aQuantity,
                        cargo: aCargo,
                        ticks: aTick,
                        time: aTime,
                        margin: aMargin,
                        cost: aCost,
                    }
                    aAll.push(aBody);
                }
            }
        }

        Memory.minerTest = aAll;
        var aMaxMargin = _.max(aAll, (a) => { return a.margin});
        logDERP(' Check Memory.minerTest .....');
        logDERP(JSON.stringify(aMaxMargin));
        //{"startPath":20,"travelPath":43,"energyAvailable":3000,"workParts":10,"carryParts":15,"moveParts":25,"bodyCount":50,"cargo":750,"ticks":37,"time":12,"margin":6000,"cost":3000}
    }

    // calcMineralCreep()
    // {
    //     var aAmount = 57000;
    //     var harvestTicks = aAmount/EXTRACTOR_COOLDOWN;
    //
    //     for (var i=1; i<20; i++)
    //     {
    //         var moveParts = _.ceil((i)/2);
    //         var bodyCost = moveParts*50  + i * 100;
    //         var ticksToClear = (56500/i ) * 5;
    //         var allCost = (ticksToClear/1500) * bodyCost;
    //         if (bodyCost > 2300) break;
    //         logERROR('BODY: ['+i+'|0|'+moveParts+'] BC: '+bodyCost.toFixed(2)+' TTC: '+ticksToClear.toFixed(2)+' AC: '+allCost.toFixed(2));
    //     }
    // }

    // gravityTest(pRoomName)
    // {
    //     var aRoom = Game.rooms[pRoomName];
    //     if (_.isUndefined(pRoomName)) return;
    //
    //     var myRoomContainers = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.container);
    //     var myRoomCreeps = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.creep);
    //
    //     var myCreeps = _.filter(myRoomCreeps, (a) => { return a.memory.role == 'supplier'});
    //     if (myCreeps.length == 0 ) return;
    //
    //     var aCreep = myCreeps[0];
    //
    //
    //     var derp = [];
    //
    //     _.forEach(myRoomContainers, (a) =>
    //     {
    //         var aPath = aCreep.pos.findPathTo(a,{ignoreCreeps: true, range: 1});
    //         var aG = 10;
    //         var aM1 = _.max([1,_.sum(a.store)]);
    //         var aM2 = _.max([1,_.sum(aCreep.carry)]);
    //         var aR = _.max([1,aPath.length]);
    //         var aF = aG * (aM1 * aM2)/ (aR * aR);
    //
    //         if (aM2 == 1)
    //         {
    //             if (a.isOUT())
    //             {
    //                 logDERP('OUT ['+a.pos.x+' '+a.pos.y+'] aF:'+aF.toFixed(2)+'    \taM1: '+aM1+'\t   aM2:'+aM2+'\taR: '+aR);
    //             }
    //         }
    //         else
    //         {
    //             if (a.isIN())
    //             {
    //                 logDERP(' IN ['+a.pos.x+' '+a.pos.y+'] aF:'+aF.toFixed(2)+'    \taM1: '+aM1+'\t   aM2:'+aM2+'\taR: '+aR);
    //             }
    //         }
    //
    //
    //
    //     })

    // calcMiner()
    // {
    //     var ENERGY = 3000;
    //
    //     var aEnergy = Game.rooms['E66N49'].energyAvailable;
    //
    //     var MAX_CARRY_MODULES = 1
    //     var MAX_WORK_MODULE = _.floor((aEnergy-MAX_CARRY_MODULES*BODYPART_COST[CARRY])/BODYPART_COST[WORK]);
    //     var MAX_MOVE_MODULE = _.floor((aEnergy-MAX_CARRY_MODULES*BODYPART_COST[CARRY])/BODYPART_COST[MOVE]);
    //
    //     logERROR('TEST MINER CARRY: '+MAX_CARRY_MODULES+' WORK: '+MAX_WORK_MODULE+' MOVE: '+MAX_MOVE_MODULE);
    //     var myBodys = [];
    //     for (var myWork=1; myWork < (MAX_WORK_MODULE+1); myWork++)
    //     {
    //         var aBody = [{"type":CARRY}];
    //         var aBodyCost = BODYPART_COST[CARRY];
    //         for (var i=0; i<myWork ; i++)
    //         {
    //             // aBody.push({"type":WORK});
    //             // aBody.push({"type":MOVE});
    //             // aBodyCost = aBodyCost + BODYPART_COST[MOVE] + BODYPART_COST[WORK];
    //             aBody.push({"type":WORK});
    //             //aBody.push({"type":MOVE});
    //             aBodyCost = aBodyCost + BODYPART_COST[WORK];
    //
    //         }
    //
    //         if (aBodyCost > aEnergy) break;
    //         myBodys.push(aBody);
    //     }
    //
    //     _.forEach(myBodys, (a) =>
    //     {
    //         logERROR('TEST MINER: '+JSON.stringify(_.countBy(a,'type')));
    //     });
    //
    //     var minBody = undefined;
    //     var minDeltaRepair = 10000000;
    //     for (var aBody of myBodys)
    //     {
    //         var myParts = _.countBy(aBody,'type');
    //         //logERROR('DERP '+JSON.stringify(myParts));
    //         var aHarvestAmount = myParts.work * HARVEST_POWER;
    //         var aRepairAmount = myParts.work * UPGRADE_CONTROLLER_POWER; //BUILD_POWER;
    //         var aCapacity = SOURCE_ENERGY_CAPACITY;
    //
    //         var aTicks = _.floor(aCapacity/aHarvestAmount);
    //         var aRepair = (ENERGY_REGEN_TIME - _.min([aTicks,ENERGY_REGEN_TIME])) * aRepairAmount;
    //
    //         var delta = SOURCE_ENERGY_CAPACITY - aRepair;
    //         if (delta < 0) delta = delta * (-1);
    //         if ( minDeltaRepair > delta)
    //         {
    //             minDeltaRepair = delta;
    //             minBody = aBody;
    //         }
    //
    //
    //         logERROR('HARVEST TICKS ['+myParts.work+']: '+aTicks+' REST: '+(aCapacity-(aTicks*aHarvestAmount))+' BUILD: '+aRepair);
    //
    //     }
    //
    //     var aBodyCount = _.countBy(minBody,'type');
    //     var aBodyCost = 0
    //     for (var aID in aBodyCount)
    //     {
    //         aBodyCost = aBodyCost + BODYPART_COST[aID] * aBodyCount[aID];
    //     }
    //
    //     logERROR('HARVEST '+JSON.stringify(aBodyCount)+' COST: '+aBodyCost);
    // }
}
module.exports = Formulas;
