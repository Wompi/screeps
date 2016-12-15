var mySpawnCenter = require('case.SpawnCenter');

class MineralHaulerSpawn extends require('spawn.creep.AbstractSpawn')
{
    constructor(roleName)
    {
        super(roleName)
    }

    isSpawnActive()
    {
        return false;
    }

    processSpawn(pSpawn)
    {
        logDEBUG('MINERAL HAULER SPAWN PROCESSED.....');
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


        if (hasEmergency)
        {
            // no minaralhauler when in emergency mode
        }
        else
        {
            // TODO: implement a real miner spawn here
            this.spawnNormalCreep(pSpawn);
        }
    }

    spawnNormalCreep(pSpawn)
    {
        var aRoom = pSpawn.room;
        if (_.isUndefined(aRoom.storage)) return;

        var myRoomContainers = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.container);
        var myMineralBoxes = _.filter(myRoomContainers, (aBox) => { return aBox.hasMinerals();});

        if (myMineralBoxes.length == 0) return;

        // TODO: the hauler should be configured for the amount of minarals avaialable in the room
        // so if you have a couple of thousands  yu should make a bigger hauler

        var aBody = undefined;
        if (pSpawn.room.energyAvailable >= 150)
        {
            aBody = [CARRY,CARRY,MOVE];
        }

        if (!_.isUndefined(aBody))
        {
            var result = pSpawn.createCreep(aBody,undefined,{ role: 'mineral hauler'});
            if (typeof result === 'string')
            {
                logWARN('MINERAL HAULER '+result+' is spawning .. '+ErrorSting(result));
                Game.creeps[result].init();
            }
            else
            {
                logERROR('MINERAL HAULER something fishy with creep creation .. ');
            }
        }
    }
}
module.exports = MineralHaulerSpawn;
