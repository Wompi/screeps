var mySpawnCenter = require('case.SpawnCenter');

class BrokerSpawn extends require('spawn.creep.AbstractSpawn')
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
        logDEBUG('BROKER SPAWN PROCESSED.....');
        if (!this.isSpawnValid(pSpawn)) return;

        var aRoom = pSpawn.room;

        var myRole = new CREEP_ROLE[this.myName].role(this.myName);
        var myCreeps = _.filter(Game.creeps,(a) => { return a.memory.role == 'broker'});

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
        var aTerminal = pSpawn.room.terminal;
        if (_.isUndefined(aTerminal)) return;

        var aNeed = aTerminal.getNeededResources();

        var aSum = _.sum(aNeed);

        if (aSum == 0 ) return ;
        // TODO: check if the resources are available

        var aStartPathLen = Util.getPath(pSpawn.pos,aTerminal.pos).path.length;

        var aCarry = _.min([4,_.ceil((aSum / (CREEP_LIFE_TIME - aStartPathLen) / 50) * 2)]); // max 4 should be more then enough
        var aMove = _.ceil(aCarry/2);

        var aCost = aCarry * BODYPART_COST[CARRY] + aMove * BODYPART_COST[MOVE];
        var aBody = undefined;

        if (pSpawn.room.energyCapacityAvailable >= aCost)
        {
            var aCarryArr = new Array(aCarry).fill(CARRY);
            var aMoveArr  = new Array(aMove).fill(MOVE);

            aBody = aCarryArr.concat(aMoveArr);
        }
        if (_.isUndefined(aBody)) return;

        var result = pSpawn.createCreep(aBody,undefined,{ role: 'broker' });
        //var result = undefined;
        if (typeof result === 'string')
        {
            logWARN('BROKER '+result+' is spawning .. ');
            Game.creeps[result].init();
        }
        else
        {
            logERROR('BROKER something fishy with creep creation .. '+ErrorSting(result));
        }
    }
}
module.exports = BrokerSpawn;
