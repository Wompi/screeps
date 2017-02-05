var mySpawnCenter = require('case.SpawnCenter');

class RemoteClaimerSpawn extends require('spawn.creep.AbstractSpawn')
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

        logDEBUG('REMOTE CLAIMER SPAWN PROCESSED.....');
        if (!this.isSpawnValid(pSpawn)) return;

        var aRoom = pSpawn.room;

        var myRole = new CREEP_ROLE[this.myName].role(this.myName);
        var myCreeps = _.filter(Game.creeps,(a) => { return a.memory.role== 'remote claimer'});

        if (myCreeps.length > 0)
        {
            return;
        }
        var hasEmergency = aRoom.hasEmergencyState();


        if (hasEmergency)
        {
            // no spawns at emergency
        }
        else
        {
            // TODO: implement a real miner spawn here
            this.spawnNormalCreep(pSpawn);
        }
    }

    spawnNormalCreep(pSpawn)
    {

        return;
        var myFlagNames = _.filter(Game.flags,Flag.FLAG_COLOR.pioneer.claim.filter);
        if (myFlagNames.length == 0 )
        {
            logDEBUG('REMOTE CLAIMER SPAWN: no remote construction flags ...');
            return;
        }
        var aFlag = myFlagNames[0];

        var aSpawn = Game.spawns['Derppool'];
        // for (var aID in Game.spawns)
        // {
        //     var spawn = Game.spawns[aID];
        //     if (aFlag.pos.getRangeTo(spawn) < aFlag.pos.getRangeTo(aSpawn))
        //     {
        //         aSpawn = spawn;
        //     }
        // }
        var aRoom = aSpawn.room;

        var aBody = undefined;
        if (aRoom.energyCapacityAvailable >= 1050)
        //if (aRoom.energyCapacityAvailable >= 700)
        {
            aBody = [CLAIM,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE];
            //aBody = [CLAIM,MOVE,MOVE];
        }
        if (_.isUndefined(aBody)) return;

        var result = aSpawn.createCreep(aBody,undefined,{ role: 'remote claimer' });
        //var result = undefined;
        if (typeof result === 'string')
        {
            logWARN('REMOTE CLAIMER '+result+' is spawning .. ');
            Game.creeps[result].init();
        }
        else
        {
            logERROR('REMOTE CLAIMER something fishy with creep creation .. '+ErrorSting(result));
        }
    }
}
module.exports = RemoteClaimerSpawn;
