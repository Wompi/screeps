var mySpawnCenter = require('case.SpawnCenter');

class MineralMinerSpawn extends require('spawn.creep.AbstractSpawn')
{
    constructor(roleName)
    {
        super(roleName)
    }

    isSpawnActive()
    {
        return false;
    }

    isSpawnValid(pSpawn)
    {
        var derp = super.isSpawnValid(pSpawn);
        return derp;
    }

    processSpawn(pSpawn)
    {

        logDEBUG('MINERAL MINER SPAWN PROCESSED.....');
        if (!this.isSpawnValid(pSpawn)) return;
        var aRoom = pSpawn.room;

        var myRoomExtractors = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.extractor);
        if (myRoomExtractors.length == 0) return;
        var myRoomMineralSources = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.mineral);
        var myRoomCreeps = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.creep);

        var aExtractor = myRoomExtractors[0];
        var aMineralSource = myRoomMineralSources[0];
        if (!_.isUndefined(aMineralSource.ticksToRegeneration)) return;

        var myRole = new CREEP_ROLE[this.myName].role(this.myName);
        var myCreeps = _.filter(myRoomCreeps,(a) => { return a.myRole.myName == myRole.myName});

        if (myCreeps.length > 0 )
        {
            //logDERP('creeps = '+myCreeps.length+' sources = '+myRoomSources.length);
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
        if (pSpawn.room.energyAvailable >= 1250)
        {
            aBody = [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE];
        }

        if (!_.isUndefined(aBody))
        {
            var result = pSpawn.createCreep(aBody,undefined,{ role: 'mineral miner'});
            if (typeof result === 'string')
            {
                logWARN('MINERAL MINER '+result+' is spawning .. '+ErrorSting(result));
                Game.creeps[result].init();
            }
            else
            {
                logERROR('MINERAL MINER something fishy with creep creation .. ');
            }
        }
    }

    spawnEmergencyCreep(pSpawn)
    {
        var aBody = undefined;
        if (pSpawn.room.energyAvailable >= 250)
        {
            aBody = [WORK,WORK,MOVE];
        }

        if (!_.isUndefined(aBody))
        {
            var result = pSpawn.createCreep(aBody,undefined,{ role: 'mineral miner'});
            if (typeof result === 'string')
            {
                logWARN('MINERAL MINER '+result+' is spawning .. '+ErrorSting(result));
                Game.creeps[result].init();
            }
            else
            {
                logERROR('MINERAL MINER something fishy with creep creation .. ');
            }
        }
    }

}
module.exports = MineralMinerSpawn;
