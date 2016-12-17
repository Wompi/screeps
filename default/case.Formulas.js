class Formulas
{
    constructore()
    {
        
    }

    calcUpgrader(pRoom)
    {
        var aBody = undefined;
        var myRoomMiningSources = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.source);
        var myRoomController = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.controller);
        if (myRoomController.length == 0) return undefined;

        var aController = myRoomController[0];
        var aMaintenceCost = pRoom.myMaintenanceCost;
        var isCloseToSpawn = aController.isCloseToSpawn;
        var MY_ENERGY = pRoom.energyAvailable;
        // TODO: if we ever use remote mining - count in here the resources for this
        var aWorkParts = _.max([1,_.ceil((15000 * myRoomMiningSources.length - aMaintenceCost)/ 1500)]); // we maintain at least one workpart for the upgraders

        // a = [1...20]
        // b = 1
        // c - (close to spawn) 1 (else) (a+b)/2
        // energy = a*100 + b*50 + c*50
        var aWork = 0;
        var aCarry = 0;
        var aMove = 0;
        var aCost = 0;

        for (var i=1; i<20; i++)
        {
            if (isCloseToSpawn)
            {
                aWork = _.min([i,aWorkParts]);
                aCarry = 1;
                aMove = 1;
            }
            else
            {
                aWork = _.min([i,aWorkParts]);
                aCarry = 1;
                aMove = _.ceil((aWork+aCarry)/2)
            }
            aCost = aWork*BODYPART_COST[WORK] + aCarry*BODYPART_COST[CARRY] + aMove*BODYPART_COST[MOVE];
            if (aCost > MY_ENERGY || aCarry <= 0)
            {
                if (isCloseToSpawn)
                {
                    aWork = _.min([i-1,aWorkParts]);
                    aCarry = 1;
                    aMove = 1;
                }
                else
                {
                    aWork = _.min([i-1,aWorkParts]);
                    aCarry = 1;
                    aMove = _.ceil((aWork+aCarry)/2)
                }
                aCost = aWork*BODYPART_COST[WORK] + aCarry*BODYPART_COST[CARRY] + aMove*BODYPART_COST[MOVE];
                break;
            }
        }
        if (aWork == 0 || aCarry == 0 || aMove == 0) return undefined;


        logDERP('aWorkParts = '+aWorkParts+' aWork = '+aWork+' aCarry = '+aCarry+' aMove = '+aMove+' aCost = '+aCost);

        return {work: aWork, carry: aCarry, move: aMove, cost: aCost};
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
        var myFlags = _.filter(Game.flags,Flag.FLAG_COLOR.remote.miner.filter);
        if (myFlags.length == 0) return;

        var aSpawn = Game.spawns['Nexuspool'];
        var aStorage = Game.rooms['E65N49'].storage;
        var aFlag = myFlags[0];

        var aStartPath = Util.getPath(aSpawn.pos,aFlag.pos);
        var aTravelPath = Util.getPath(aFlag.pos,aStorage.pos);

        logDERP(' aStartPath: '+aStartPath.path.length);
        logDERP(' aTravelPath: '+aTravelPath.path.length);

        var MY_ENERGY = 2100;
        for (var i=1; i<20; i++)
        {
            var aWork = 0;
            var aCarry = 0;
            var aMove = 0;

            if (hasRoads)
            {
                aWork = i
                aCarry = _.floor((MY_ENERGY - aWork * 125)/75)
                aMove = _.ceil((aWork+aCarry)/2)
            }
            else
            {
                aWork = i
                aCarry = _.floor((MY_ENERGY - aWork * 150)/100)
                aMove = _.ceil((aWork+aCarry))
            }
            var aCost = aWork*BODYPART_COST[WORK] + aCarry*BODYPART_COST[CARRY] + aMove*BODYPART_COST[MOVE];
            if (aCost > MY_ENERGY || aCarry <= 0)
            {
                break;
            }
            var aCargo = (aCarry*50);
            var aTick = _.floor(aCargo / (aWork*HARVEST_POWER));
            var aTime = _.floor((CREEP_LIFE_TIME - aStartPath.path.length)/(2*aTravelPath.path.length+aTick));
            var aMargin =   (aTime * aCargo) - aCost;

            logDERP(' W:\t'+i+'\tC: '+aCarry+'\tM: '+aMove+'\tC: '+aCargo+'\tT: '+aTick+'\tH:'+aTime+'\tM:'+aMargin+'\tcost: '+aCost);
        }
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
