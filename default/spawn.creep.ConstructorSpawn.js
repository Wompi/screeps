var mySpawnCenter = require('case.SpawnCenter');

class ConstructorSpawn extends require('spawn.creep.AbstractSpawn')
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
        logDEBUG('CONSTRUCTOR SPAWN PROCESSED.....');
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


        var myRoomConstructionSites = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.constructionSite);
        if (myRoomConstructionSites.length == 0) return;

        var myFlagNames = (Flag.findName(Flag.FLAG_COLOR.construction.primaryConstruction,aRoom));
        var myAllFlags = myFlagNames.concat(Flag.findName(Flag.FLAG_COLOR.construction,aRoom));
        if (myAllFlags.length == 0 )
        {
            logERROR('CONSTRUCTOR SPAWN '+aRoom.name+' has construction sites but NO FLAGS .. place some to start!');
            return;
        }

        if (hasEmergency)
        {
            this.spawnEmergencyCreep(pSpawn);
            return;
        }

        if(pSpawn.room.controller.level < 6)
        {
            this.spawnCalculatedCreep(pSpawn);
        }
        else
        {
            // TODO: implement a real miner spawn here
            this.spawnNormalCreep(pSpawn);
        }
    }

    spawnCalculatedCreep(pSpawn)
    {
        if (pSpawn.room.energyAvailable < 550) return;
        var aBody = undefined;
        // if (pSpawn.room.energyAvailable >= 550)
        // {
        //     aBody = [WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE];
        // }
        if (pSpawn.room.energyAvailable >= 550)
        {
            aBody = [WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE];
        }
        if (_.isUndefined(aBody)) return;

        var result = pSpawn.createCreep(aBody,undefined,{ role: 'builder'});
        if (typeof result === 'string')
        {
            logWARN('New CONSTRUCTOR Creep '+result+' .. '+ErrorSting(result));
            Game.creeps[result].init();
        }
        else
        {
            logERROR('Something fishy with CONSTRUCTOR creep creation .. ');
        }
    }

    spawnNormalCreep(pSpawn)
    {
        var aBody = undefined;
        if (pSpawn.room.energyAvailable >= 1050)
        {
            aBody = [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
        }
        if (_.isUndefined(aBody)) return;

        var result = pSpawn.createCreep(aBody,undefined,{ role: 'builder'});
        if (typeof result === 'string')
        {
            logWARN('New CONSTRUCTOR Creep '+result+' .. '+ErrorSting(result));
            Game.creeps[result].init();
        }
        else
        {
            logERROR('Something fishy with CONSTRUCTOR creep creation .. ');
        }
    }

    spawnEmergencyCreep(pSpawn)
    {
        // TODO: no contructors when emergency ....
    }
}
module.exports = ConstructorSpawn;
