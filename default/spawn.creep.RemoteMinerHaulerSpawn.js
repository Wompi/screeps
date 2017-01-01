var mySpawnCenter = require('case.SpawnCenter');

class RemoteMinerhauler extends require('spawn.creep.AbstractSpawn')
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

        logDEBUG('REMOTE MINER HAULER SPAWN PROCESSED.....');
        if (!this.isSpawnValid(pSpawn)) return;

        var aRoom = pSpawn.room;

        var myRole = new CREEP_ROLE[this.myName].role(this.myName);
        var myCreeps = _.filter(Game.creeps,(a) => { return a.memory.role == 'not implemented'});

        if (myCreeps.length > 0)
        {
            return;
        }

        var myFlagNames = _.filter(Game.flags,Flag.FLAG_COLOR.remote.claim.filter);
        if (myFlagNames.length == 0 )
        {
            logDEBUG('REMOTE MINER HAULER SPAWN: no remote construction flags ...');
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
        if (pSpawn.room.energyCapacityAvailable >= 1500)
        {
            var aCarry = new Array(20).fill(CARRY);
            var aMove = new Array(10).fill(MOVE);

            aBody = aCarry.concat(aMove);
        }
        if (_.isUndefined(aBody)) return;

        var result = pSpawn.createCreep(aBody,undefined,{ role: 'remote miner hauler', home: pSpawn.id });
        //var result = undefined;
        if (typeof result === 'string')
        {
            logWARN('REMOTE MINER HAULER '+result+' is spawning .. ');
            Game.creeps[result].init();
        }
        else
        {
            logERROR('REMOTE MINER HAULER something fishy with creep creation .. '+ErrorSting(result));
        }
    }
}
module.exports = RemoteMinerhauler;
