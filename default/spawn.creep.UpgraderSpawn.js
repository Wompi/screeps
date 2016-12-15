var mySpawnCenter = require('case.SpawnCenter');

class UpgraderSpawn extends require('spawn.creep.AbstractSpawn')
{
    constructor(roleName)
    {
        super(roleName)
    }

    isSpawnActive()
    {
        return true;
    }

    processSpawn(pSpawn)
    {
        logDEBUG('UPGRADER SPAWN PROCESSED.....');
        if (!this.isSpawnValid(pSpawn)) return;

        var aRoom = pSpawn.room;

        var myRoomCreeps = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.creep);

        var myRole = new CREEP_ROLE[this.myName].role(this.myName);
        var myCreeps = _.filter(myRoomCreeps,(a) => { return a.myRole.myName == myRole.myName});

        if (myCreeps.length > 0)
        {
            return;
        }

        var hasEmergency = aRoom.hasEmergencyState();

        if (hasEmergency)
        {
            this.spawnEmergencyCreep(pSpawn);
        }
        else
        {
            // TODO: implement a real miner spawn here
            this.spawnNormalCreep(pSpawn,aRoom);
        }

        logDERP(' ---------------- UPGRADER SPAWN -----------------');
    }

    spawnNormalCreep(pSpawn,pRoom)
    {
        var aBody = undefined;
        var myRoomMiningSources = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.source);
        var myRoomController = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.controller);
        if (myRoomController.length == 0) return;

        var aController = myRoomController[0];
        var aMaintenceCost = pRoom.myMaintenanceCost;

        // TODO: if we ever use remote mining - count in here the resources for this
        var aWorkParts = _.max([1,_.ceil((15000 * myRoomMiningSources.length - aMaintenceCost)/ 1500)]); // we maintain at least one workpart for the upgraders
        var workArr = new Array(aWorkParts).fill(WORK);
        var carryArr = new Array(1).fill(CARRY);
        var moveArr = new Array(1).fill(MOVE);

        if (!aController.isCloseToSpawn)
        {
            var aM = _.ceil((workArr.length+carryArr.length)/2);
            moveArr = new Array(aM).fill(MOVE);
        }

        var aCost = workArr.length * BODYPART_COST[WORK] + carryArr.length * BODYPART_COST[CARRY] + moveArr.length * BODYPART_COST[MOVE];

        //logDERP(' aCost = '+aCost+' aBody = '+JSON.stringify(aBody)+' available = '+pSpawn.room.energyCapacityAvailable);

        if (pSpawn.room.energyAvailable >= aCost)
        {
            //aBody = [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
            aBody = workArr.concat(carryArr).concat(moveArr);
        }

        //logDERP(' aBody = '+JSON.stringify(aBody));

        if (!_.isUndefined(aBody))
        {
            var result = pSpawn.createCreep(aBody,undefined,{ role: 'upgrader'});
            if (typeof result === 'string')
            {
                logWARN('UPGRADER '+result+' is spawning .. '+ErrorSting(result));
                Game.creeps[result].init();
            }
            else
            {
                logERROR('UPGRADER something fishy with creep creation .. ');
            }
        }
    }
    spawnEmergencyCreep(pSpawn)
    {
        var aBody = undefined;
        if (pSpawn.room.energyAvailable >= 300)
        {
            aBody = [WORK,WORK,CARRY,MOVE];
        }

        if (!_.isUndefined(aBody))
        {
            var result = pSpawn.createCreep(aBody,undefined,{ role: 'upgrader'});
            if (typeof result === 'string')
            {
                logWARN('UPGRADER '+result+' is spawning .. '+ErrorSting(result));
                Game.creeps[result].init();
            }
            else
            {
                logERROR('UPGRADER something fishy with creep creation .. ');
            }
        }
    }
}
module.exports = UpgraderSpawn;
