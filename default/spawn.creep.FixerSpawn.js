var mySpawnCenter = require('case.SpawnCenter');

class FixerSpawn extends require('spawn.creep.AbstractSpawn')
{
    constructor(roleName)
    {
        super(roleName)
    }

    isSpawnActive()
    {
        return true;
    }

    isSpawnValid(pSpawn)
    {
        var derp = super.isSpawnValid(pSpawn);
        return derp;
    }

    processSpawn(pSpawn)
    {
        logDEBUG('FIXER SPAWN PROCESSED.....');
        if (!this.isSpawnValid(pSpawn)) return;
    
        var aRoom = pSpawn.room;

        var myRoomCreeps = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.creep);

        var myRole = new CREEP_ROLE[this.myName].role(this.myName);
        var myCreeps = _.filter(myRoomCreeps,(a) => { return a.myRole.myName == myRole.myName});

        //logERROR('SPAWN FIXER CREEPS: '+myCreeps.length);

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
            this.spawnNormalCreep(pSpawn);
        }
    }

    spawnNormalCreep(pSpawn)
    {
        var aBody = undefined;
        if (pSpawn.room.energyAvailable >= 400)
        {
            aBody = [WORK,WORK,CARRY,CARRY,MOVE,MOVE];
        }
        if (_.isUndefined(aBody)) return;


        var roomGraph = Room.FIXER_GRAPH[pSpawn.room.name];
        if (_.isUndefined(roomGraph))
        {
            logERROR(' ROOM '+this.room.name+' HAS NO FIXER_GRAPH ENTRY .. can not spawn a fixer!')
            return;
        }
        var aMem =
        {
            role: 'fixer',
            target: roomGraph[0],
        };

        var result = pSpawn.createCreep(aBody,'Fixer '+pSpawn.room.name,aMem);
        if (typeof result === 'string')
        {
            logWARN('New FIXER Creep '+result+' .. '+ErrorSting(result));
            Game.creeps[result].init();
        }
        else
        {
            logERROR('Something is fishy with FIXER spawn in room '+pSpawn.room.name+' .. ');
        }
    }

    spawnEmergencyCreep(pSpawn)
    {
        var aBody = undefined;
        if (pSpawn.room.energyAvailable >= 300)
        {
            aBody = [WORK,CARRY,CARRY,MOVE,MOVE];
        }
        if (_.isUndefined(aBody)) return;


        var roomGraph = Room.FIXER_GRAPH[pSpawn.room.name];
        if (_.isUndefined(roomGraph))
        {
            logERROR(' ROOM '+this.room.name+' HAS NO FIXER_GRAPH ENTRY .. can not spawn a fixer!')
            return;
        }
        var aMem =
        {
            role: 'fixer',
            target: roomGraph[0],
        };

        var result = pSpawn.createCreep(aBody,'Fixer '+pSpawn.room.name,aMem);
        if (typeof result === 'string')
        {
            logWARN('New FIXER Creep '+result+' .. '+ErrorSting(result));
            Game.creeps[result].init();
        }
        else
        {
            logERROR('Something is fishy with FIXER spawn in room '+pSpawn.room.name+' .. ');
        }
    }

    getBody(pEnergyAvailable,pEnergyCapacity)
    {
        var result = undefined;
        if (pEnergyCapacity >= 400 && pEnergyAvailable >= 400)
        {
            result = [WORK,WORK,CARRY,CARRY,MOVE,MOVE];
        }
        else if (pEnergyCapacity >= 200 && pEnergyAvailable >= 200)
        {
            result = [WORK,CARRY,CARRY,MOVE,MOVE];
        }
        return result;
    }
}
module.exports = FixerSpawn;
