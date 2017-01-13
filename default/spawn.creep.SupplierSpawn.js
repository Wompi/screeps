var mySpawnCenter = require('case.SpawnCenter');

class SupplierSpawn extends require('spawn.creep.AbstractSpawn')
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

        logDEBUG('SUPPLIER SPAWN PROCESSED.....');
        if (!this.isSpawnValid(pSpawn)) return;

        var aRoom = pSpawn.room;

        var myRoomCreeps = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.creep);

        var myRole = new CREEP_ROLE[this.myName].role(this.myName);
        var myCreeps = _.filter(myRoomCreeps,(a) => { return a.myRole.myName == myRole.myName});


        var myRoomSources = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.source);


        if (myCreeps.length >= myRoomSources.length)
        {
            return;
        }
        var hasEmergency = aRoom.hasEmergencyState();

        var myRoomContainers = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.container);
        if (myRoomContainers.length < 2 ) return;



        if (hasEmergency)
        {
            this.spawnEmergencyCreep(pSpawn);
            return;
        }

        if (aRoom.controller.level < 6)
        {
            this.spawnCalculatedCreep(pSpawn,aRoom);
        }
        else
        {
            this.spawnNormalCreep(pSpawn);
        }
    }

    spawnCalculatedCreep(pSpawn,pRoom)
    {
        var aBody = undefined;
        if (pSpawn.room.energyAvailable < 300)
        {
            aBody = [CARRY,CARRY,MOVE];
        }
        // else if (pSpawn.room.energyAvailable >= 750)
        // {
        //     var aCarry = new Array(10).fill(CARRY);
        //     var aMove = new Array(5).fill(MOVE);
        //     aBody = aCarry.concat(aMove)
        // }
        else if (pSpawn.room.energyAvailable >= 300)
        {
            aBody = [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE];
        }

        if (!_.isUndefined(aBody))
        {
            var result = pSpawn.createCreep(aBody,undefined,{ role: 'supplier'});
            if (typeof result === 'string')
            {
                logWARN('SUPPLIER '+result+' is spawning .. '+ErrorSting(result));
                Game.creeps[result].init();
            }
            else
            {
                logERROR('SUPPLIER something fishy with creep creation .. ');
            }
        }
    }

    spawnNormalCreep(pSpawn)
    {
        var aBody = undefined;
        if (pSpawn.room.energyAvailable >= 750)
        {
            //aBody = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE];
            var aCarry = new Array(10).fill(CARRY);
            var aMove = new Array(5).fill(MOVE);
            aBody = aCarry.concat(aMove)
        }

        // if (pSpawn.room.energyAvailable >= 750)
        // {
        //     //aBody = [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE];
        //     aBody = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
        // }

        if (!_.isUndefined(aBody))
        {
            var result = pSpawn.createCreep(aBody,undefined,{ role: 'supplier'});
            if (typeof result === 'string')
            {
                logWARN('SUPPLIER '+result+' is spawning .. '+ErrorSting(result));
                Game.creeps[result].init();
            }
            else
            {
                logERROR('SUPPLIER something fishy with creep creation .. ');
            }
        }
    }

    spawnEmergencyCreep(pSpawn)
    {
        var aBody = undefined;
        if (pSpawn.room.energyAvailable >= 150)
        {
            aBody = [CARRY,CARRY,MOVE];
        }

        if (!_.isUndefined(aBody))
        {
            var result = pSpawn.createCreep(aBody,undefined,{ role: 'supplier'});
            if (typeof result === 'string')
            {
                logWARN('SUPPLIER '+result+' is spawning .. '+ErrorSting(result));
                Game.creeps[result].init();
            }
            else
            {
                logERROR('SUPPLIER something fishy with creep creation .. ');
            }
        }
    }


}
module.exports = SupplierSpawn;
