var mySpawnCenter = require('case.SpawnCenter');

class RemoteBuilderSpawn extends require('spawn.creep.AbstractSpawn')
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

        logDERP('REMOTE BUILDER SPAWN PROCESSED.....');
        if (!this.isSpawnValid(pSpawn)) return;

        var aRoom = pSpawn.room;

        var myRole = new CREEP_ROLE[this.myName].role(this.myName);
        var myCreeps = _.filter(Game.creeps,(a) => { return a.memory.role == 'remote builder'});

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
        var myFlagNames = _.filter(Game.flags,Flag.FLAG_COLOR.pioneer.construction.filter);
        if (myFlagNames.length == 0 )
        {
            logDEBUG('REMOTE SPAWN: no remote construction flags ...');
            return;
        }
        var aFlag = myFlagNames[0];

        var aSpawn = pSpawn;
        for (var aID in Game.spawns)
        {
            var spawn = Game.spawns[aID];
            if (spawn.room.energyCapacityAvailable < 2650) continue;
            if (aFlag.pos.getRangeTo(spawn) < aFlag.pos.getRangeTo(aSpawn))
            {
                aSpawn = spawn;
            }
        }
        var aRoom = aSpawn.room;
        logDERP('DERP: '+aRoom.name);

        var aBody = undefined;

        if (aRoom.energyCapacityAvailable >= 2650)
        {
            var aWork  = new Array(3).fill(WORK);
            var aCarry = new Array(30).fill(CARRY);
            var aMove  = new Array(17).fill(MOVE);

            aBody = aWork.concat(aCarry).concat(aMove);
        }
        if (_.isUndefined(aBody)) return;

        var result = aSpawn.createCreep(aBody,undefined,{ role: 'remote builder', home: (aSpawn.id) });
        //var result = undefined;
        if (typeof result === 'string')
        {
            logWARN('REMOTE BUILDER '+result+' is spawning .. ');
            Game.creeps[result].init();
        }
        else
        {
            logERROR('REMOTE BUILDER something fishy with creep creation');
        }
    }
}
module.exports = RemoteBuilderSpawn;
