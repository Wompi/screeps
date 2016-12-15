var mySpawnCenter = require('case.SpawnCenter');

class RoomTraderSpawn extends require('spawn.creep.AbstractSpawn')
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
        logDEBUG('ROOM TRADER SPAWN PROCESSED.....');
        if (!this.isSpawnValid(pSpawn)) return;

        var aRoom = pSpawn.room;


        var myRole = new CREEP_ROLE[this.myName].role(this.myName);
        var myCreeps = _.filter(Game.creeps,(a) =>
        {
            return !a.spawning && a.myRole.myName == myRole.myName
        });

        if (myCreeps.length > 0)
        {
            return;
        }
        var hasEmergency = aRoom.hasEmergencyState();


        if (hasEmergency)
        {
        }
        else
        {
            // TODO: implement a real miner spawn here
            this.spawnNormalCreep(pSpawn);
        }
    }

    spawnNormalCreep(pSpawn)
    {


        var aEndRoom = Game.rooms['E66N49'];
        var aStartRoom = Game.rooms['E65N49'];
        if (_.isUndefined(aStartRoom)) return;
        if (_.isUndefined(aEndRoom)) return;


        // only spawn a hauler when the mineral source is on cooldown
        var myRoomExtractors = aStartRoom.getRoomObjects(ROOM_OBJECT_TYPE.extractor);
        if (myRoomExtractors.length == 0) return;
        var myRoomMineralSources = aStartRoom.getRoomObjects(ROOM_OBJECT_TYPE.mineral);

        var aExtractor = myRoomExtractors[0];
        var aMineralSource = myRoomMineralSources[0];
        if (_.isUndefined(aMineralSource.ticksToRegeneration)) return;

        var aGrabStorage = aStartRoom.storage;
        if (_.isUndefined(aGrabStorage)) return;

        var aDropStorage = aEndRoom.storage;
        if (_.isUndefined(aDropStorage)) return;

        if (!aGrabStorage.hasMinerals) return;

        var aMineralAmount = aGrabStorage.getStoredMineral();
        var canStore = (aDropStorage.storeCapacity - _.sum(aDropStorage.store)) > aMineralAmount.mineralAmount;

        if (!canStore) return;

        // the big hauler can carry 9 x 1400 for one live time - we only spawn a hauler when he can use his full
        // live time to carry stuff
        if (aMineralAmount.mineralAmount < 12600) return;


        var aBody = undefined;
        if (pSpawn.room.energyAvailable >= 2100)
        {
            // TODO: adjust this to the current amount
            // the trader has 79 moves for one trip and can travel 9 times back and forth
            // so do the math
            var aCarry = new Array(28).fill(CARRY);
            var aMove = new Array(14).fill(MOVE);

            aBody = aCarry.concat(aMove);
        }

        if (!_.isUndefined(aBody))
        {
            var result = pSpawn.createCreep(aBody,undefined,{ role: 'room trader'});
            if (typeof result === 'string')
            {
                logWARN('ROOM TRADER '+result+' is spawning .. '+ErrorSting(result));
                Game.creeps[result].init();
            }
            else
            {
                logERROR('ROOM TRADER something fishy with creep creation .. ');
            }
        }
    }
}
module.exports = RoomTraderSpawn;
