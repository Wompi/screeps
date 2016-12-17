var mySpawnCenter = require('case.SpawnCenter');

class RemoteMinerSpawn extends require('spawn.creep.AbstractSpawn')
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

        logDEBUG('REMOTE MINER SPAWN PROCESSED.....');
        if (!this.isSpawnValid(pSpawn)) return;

        var myFlagNames = _.filter(Game.flags,Flag.FLAG_COLOR.remote.miner.filter);
        if (myFlagNames.length == 0 )
        {
            logDEBUG('REMOTE SPAWN: no remote construction flags ...');
            return;
        }
        var myRole = new CREEP_ROLE[this.myName].role(this.myName);
        var myCreeps = _.filter(Game.creeps,(a) => { return a.myRole.myName == myRole.myName});

        if (myCreeps.length >= myFlagNames.length)
        {
            return;
        }

        var aFlag = myFlagNames[0];

        var hasEmergency =  pSpawn.room.hasEmergencyState();
        if (hasEmergency)
        {
            return;
        }

        // TODO: implement a real miner spawn here
        this.spawnNormalCreep(pSpawn);
    }

    spawnNormalCreep(pSpawn)
    {
        var aBody = undefined;
        if (pSpawn.room.energyAvailable >= 800)
        {
            aBody = [WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE];
        }

        if (!_.isUndefined(aBody))
        {
            var result = pSpawn.createCreep(aBody,undefined,{ role: 'remote miner'});
            if (typeof result === 'string')
            {
                logWARN('REMOTE MINER '+result+' is spawning .. '+ErrorSting(result));
                Game.creeps[result].init();
            }
            else
            {
                logERROR('REMOTE MINER something fishy with creep creation .. ');
            }
        }
    }
}
module.exports = RemoteMinerSpawn
