class SpecialMinerRole extends require('role.creep.AbstractRole')
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
        logDEBUG('SPECIAL MINER ROLE PROCESSED.....');
        if (!this.isRoleValid(pCreep)) return;

        var aRoom = pCreep.room;

        var myRoomSources = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.source);

        var mySources = _.filter(myRoomSources,(a) => { return (a.energy > 0);});
        if (mySources.length == 0)
        {
            mySources = _.sortBy(myRoomSources, (a) => { return a.ticksToRegeneration});
        }

        var aSource = mySources[0];

        // var myContainers = _.filter(room.myContainers,(a) =>
        // {
        //     return (_.sum(a.store) < a.storeCapacity) && aCreep.pos.isEqualTo(a);
        // });
        if (pCreep.pos.isNearTo(aSource))
        {
            //if (myContainers.length > 0)
            {
                var result = pCreep.harvest(aSource);
                logDEBUG('SPECIAL MINER '+pCreep.name+' moves to source ['+aSource.pos.x+' '+aSource.pos.y+'] .. ' +ErrorSting(result));
            }
            //else
            {
            //    logDEBUG('SPECIAL MINER '+aCreep.name+' box full ['+aSource.pos.x+' '+aSource.pos.y+'] .. ');

            }
        }
        else
        {
                var result = pCreep.moveTo(aSource,{ignoreCreeps: true});
                logDEBUG('SPECIAL MINER '+pCreep.name+' harvests source ['+aSource.pos.x+' '+aSource.pos.y+'] .. ' +ErrorSting(result));
        }
    }
}
module.exports = SpecialMinerRole;
