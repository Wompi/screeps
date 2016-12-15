class BasicUpgraderRole extends require('role.creep.AbstractRole')
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
        logDEBUG('BASIC UPGRADER ROLE PROCESSED.....');
        if (!this.isRoleValid(pCreep)) return;

        var aRoom = pCreep.room;

        var myRoomContainers  = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.container);
        var myRoomSpawns  = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.spawn);
        var myRoomResources  = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.resource);

        var myControllerContainers = _.filter(myRoomContainers,(a) => { return (a.pos.inRangeTo(aRoom.controller,3));});
        var mySpawns = _.filter(myRoomSpawns,(a) => { return a.isEnergyNeeded()});
        var myResources = _.filter(myRoomResources, (a) => {return pCreep.pos.inRangeTo(a,1);})

        var aContainer = myControllerContainers[0];
        var aSpawn = (mySpawns.length == 0) ? undefined : mySpawns[0];
        var aResource = myResources.length == 0 ? undefined : myResources[0];

        var aPos = new RoomPosition(15,10,'E65N49');
        if (pCreep.pos.isEqualTo(aPos))
        {
            if (!_.isUndefined(aResource))
            {
                var result = pCreep.pickup(aResource);
                logDEBUG('BASIC UPGRADER '+pCreep.name+' grabs resource from ground  .. ' +ErrorSting(result));
            }
            else
            {

                // for godsake clean this up it was to late and Ihad tofinda quick solution
                if (_.keys(pCreep.carry).length > 1)
                {
                    for (var aID in pCreep.carry)
                    {
                        var result = pCreep.transfer(aContainer,aID);
                        logDEBUG('BASIC UPGRADER '+pCreep.name+' drop stupid resource  .. ' +ErrorSting(result));
                    }
                }
                else
                {
                    var result = pCreep.withdraw(aContainer,RESOURCE_ENERGY);
                    logDEBUG('BASIC UPGRADER '+pCreep.name+' withdraws from box  .. ' +ErrorSting(result));
                }
            }

            if (!_.isUndefined(aSpawn))
            {
                var result = pCreep.transfer(aSpawn,RESOURCE_ENERGY);
                logDEBUG('BASIC UPGRADER '+pCreep.name+' fills spawn  .. ' +ErrorSting(result));
            }
            result = pCreep.upgradeController(aRoom.controller);
            logDEBUG('BASIC UPGRADER '+pCreep.name+' upgrades controller  .. ' +ErrorSting(result));
        }
        else
        {
            var result = pCreep.moveTo(aPos);
            logDEBUG('BASIC UPGRADER '+pCreep.name+' moves to box  .. ' +ErrorSting(result));
        }
    }
}
module.exports = BasicUpgraderRole;
