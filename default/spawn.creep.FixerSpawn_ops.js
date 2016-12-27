var mySpawnCenter = require('case.SpawnCenter');

class FixerSpawn extends require('spawn.creep.AbstractSpawn')
{
    constructor(roleName)
    {
        super(roleName)
    }

    isSpawnActive()
    {
        return false;
    }

    processSpawn(pOperation)
    {
        logDEBUG('FIXER SPAWN PROCESSED.....');
        if (!this.isSpawnValid(pSpawn)) return;

        var myCreeps = pOperation.getEntities(ROOM_OBJECT_TYPE.creep);
        if (myCreeps.length > 0) return;

        // TODO: implement a real miner spawn here
        this.spawnNormalCreep(pOperation);
    }

    spawnNormalCreep(pOperation)
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
}
module.exports = FixerSpawn;
