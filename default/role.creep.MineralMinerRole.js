class MineralMinerRole extends require('role.creep.AbstractRole')
{
    constructor(roleName)
    {
        super(roleName)
    }

    isRoleActive()
    {
        return true;
    }

    processRole(pCreep)
    {
        logDEBUG('MINERAL MINER ROLE PROCESSED.....');
        if (!this.isRoleValid(pCreep)) return;

        var aRoom = pCreep.room;

        var myRoomMineralSources = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.mineral);
        if (myRoomMineralSources.length == 0 )
        {
            logERROR('MINERAL MINER '+pCreep.name+' has no mineral source! No need for a MINERAL_MINER!');
            return;
        }
        var aMineralSource = myRoomMineralSources[0];

        if (!aMineralSource.hasExtractor)
        {
            logERROR('MINERAL MINER '+pCreep.name+' needs an EXTRACTOR to harvest the mineral!' );
            return;
        }

        var aExtractor = aMineralSource.myExtractor[0];

        var aStorage = aRoom.storage;
        if (_.isUndefined(aStorage))
        {
            logERROR('MINERAL MINER '+room.name+' has no storage build .. this is needed for mineral mining!');
            return;
        }

        if (aMineralSource.mineralAmount == 0)
        {
            logWARN('MINERAL MINER '+pCreep.name+' source is exausted .. cooldown: '+aMineralSource.ticksToRegeneration+' consider recycling the miner!');
            return;
        }

        var aMiningBox = aMineralSource.hasMiningBox ? aMineralSource.myMiningBoxes[0] : undefined;

        if (_.isUndefined(aMiningBox))
        {
            logWARN('MINERAL MINER '+pCreep.name+' the mineral source has no mining box - not supported!');
            return;
        }

        if (_.sum(pCreep.carry) == 0 && !pCreep.pos.isEqualTo(aMiningBox))
        {
            var result = pCreep.moveTo(aMiningBox,{ignoreCreeps: true});
            logDEBUG('MINERAL MINER '+pCreep.name+' moves to mineral source .. '+ErrorSting(result));
        }

        var aMiningAmount = pCreep.getActiveBodyparts(WORK);

        if (_.sum(pCreep.carry) == 0
                && aExtractor.cooldown == 0
                && pCreep.pos.isEqualTo(aMiningBox)
                && (_.sum(aMiningBox.store) + aMiningAmount)  < aMiningBox.storeCapacity
            )
        {
            var result = pCreep.harvest(aMineralSource);
            logDEBUG('MINERAL MINER '+pCreep.name+' harvests mineral source .. '+ErrorSting(result));
        }
        else if (aExtractor.cooldown > 0)
        {
            logDEBUG('MINERAL MINER '+pCreep.name+' extractor is on cooldown '+aExtractor.cooldown);
        }
        else
        {
            logDEBUG('MINERAL MINER '+pCreep.name+' has nothing to do IDLE!');
        }
        //logDERP(' -------------------------- MINERAL MINER ----------------------');

    }
}
module.exports = MineralMinerRole;
