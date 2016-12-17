var mySpawnCenter = require('case.SpawnCenter');

class RemoteReserveSpawn extends require('spawn.creep.AbstractSpawn')
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

        logDEBUG('REMOTE RESERVE SPAWN PROCESSED.....');
        if (!this.isSpawnValid(pSpawn)) return;

        var aRoom = pSpawn.room;

        var myRole = new CREEP_ROLE[this.myName].role(this.myName);
        var myCreeps = _.filter(Game.creeps,(a) => { return a.myRole.myName == myRole.myName});

        if (myCreeps.length > 0)
        {
            return;
        }

        var myFlagNames = _.filter(Game.flags,Flag.FLAG_COLOR.remote.claim.filter);
        if (myFlagNames.length == 0 )
        {
            logDEBUG('REMOTE RESERVE SPAWN: no remote construction flags ...');
            return;
        }
        var aFlag = myFlagNames[0];

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


        var aBody = undefined;
        if (pSpawn.room.energyCapacityAvailable >= 1250)
        {
            aBody = [CLAIM,CLAIM,MOVE];
        }
        if (_.isUndefined(aBody)) return;

        var result = pSpawn.createCreep(aBody,undefined,{ role: 'remote reserve' });
        //var result = undefined;
        if (typeof result === 'string')
        {
            logWARN('REMOTE RESERVE '+result+' is spawning .. ');
            Game.creeps[result].init();
        }
        else
        {
            logERROR('REMOTE RESERVE something fishy with creep creation .. '+ErrorSting(result));
        }
    }
}
module.exports = RemoteReserveSpawn;
