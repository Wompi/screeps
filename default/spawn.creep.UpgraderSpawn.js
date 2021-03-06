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

        var hasEmergency = aRoom.hasEmergencyState();

        var myRoomContainers = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.container);
        if (myRoomContainers.length < 2 ) return;

        // if (myCreeps.length > 0)
        // {
        //     return;
        // }


        if (hasEmergency)
        {
            this.spawnEmergencyCreep(pSpawn);
            return
        }
        else if (aRoom.controller.level < 7)
        {
            this.spawnMultiCreep(pSpawn,aRoom,myCreeps);
        }
        else
        {
            // TODO: implement a real miner spawn here
            this.spawnNormalCreep(pSpawn,aRoom,myCreeps);
        }

        logDERP(' ---------------- UPGRADER SPAWN -----------------');
    }

    spawnMultiCreep(pSpawn,pRoom, pMyCreeps)
    {
        if (pSpawn.room.energyAvailable < 300) return;
        var aUpgraderConfig = Formula.calcUpgrader(pRoom);
        if (_.isUndefined(aUpgraderConfig)) return;


        if (pMyCreeps.length > _.min([2,aUpgraderConfig.aCount]))
        {
            return;
        }
        var workArr = new Array(aUpgraderConfig.work).fill(WORK);
        var carryArr = new Array(aUpgraderConfig.carry).fill(CARRY);
        var moveArr = new Array(aUpgraderConfig.move).fill(MOVE);


        var aBody = workArr.concat(carryArr).concat(moveArr);

        var result = pSpawn.createCreep(aBody,undefined,{ role: 'upgrader'});
        if (typeof result === 'string')
        {
            logWARN('UPGRADER '+result+' is spawning .. '+ErrorSting(result));
            Game.creeps[result].init();
        }
        else
        {
            logERROR('UPGRADER something fishy with creep creation .. '+ErrorSting(result));
        }
    }


    spawnNormalCreep(pSpawn,pRoom, pMyCreeps)
    {
        if (pSpawn.room.energyAvailable < 300) return;
        var aUpgraderConfig = Formula.calcUpgrader(pRoom);
        if (_.isUndefined(aUpgraderConfig)) return;


        if (pMyCreeps.length > _.min([0,aUpgraderConfig.aCount]))
        {
            return;
        }
        var workArr = new Array(aUpgraderConfig.work).fill(WORK);
        var carryArr = new Array(aUpgraderConfig.carry).fill(CARRY);
        var moveArr = new Array(aUpgraderConfig.move).fill(MOVE);


        var aBody = workArr.concat(carryArr).concat(moveArr);

        var result = pSpawn.createCreep(aBody,undefined,{ role: 'upgrader'});
        if (typeof result === 'string')
        {
            logWARN('UPGRADER '+result+' is spawning .. '+ErrorSting(result));
            Game.creeps[result].init();
        }
        else
        {
            logERROR('UPGRADER something fishy with creep creation .. '+ErrorSting(result));
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
