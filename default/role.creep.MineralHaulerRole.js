class MineralHaulerRole extends require('role.creep.AbstractRole')
{
    constructor(roleName)
    {
        super(roleName)
    }

    isRoleActive()
    {
        return false;
    }

    processRole(pCreep)
    {
        logDEBUG('MINERAL HAULER ROLE PROCESSED.....');
        if (!this.isRoleValid(pCreep)) return;

        var myTask =
        {
            aCreep: pCreep,
            aRoom: pCreep.room,
            aTarget: undefined,

            aPickup:
            {
                aTarget: undefined,
                aAmount: 0,
            },
            aWithdraw:
            {
                aTarget: undefined,
                aAmount: 0,
            },
            aTransfer:
            {
                aTarget: undefined,
                aAmount: 0,
            },
            aMove: undefined,
        }

        myTask = this.assignPickupTarget(myTask);
        myTask = this.assignTarget(myTask);
        myTask = this.assignMoveTarget(myTask);
        myTask = this.assignTransferTarget(myTask);
        myTask = this.assignWithdrawTarget(myTask);

    }

    assignPickupTarget(pTask)
    {
        return pTask;
    }

    assignTarget(pTask)
    {
        if (!_.isUndefined(aTask.aPickup.aTarget)) return pTask;
        var aStorage = pTask.aRoom.storage;
        if (_.isUndefined(aStorage)) return pTask;

        var myRoomContainers = pTask.aRoom.getRoomObjects(ROOM_OBJECT_TYPE.container);
        var myMineralBoxes = _.filter(myRoomContainers, (aBox) => { return aBox.hasMinerals();});

        // TODO: if there are no mineral boxes we should set the target to something like parking/recycle position
        // otherwise the creep is stuck at the current position
        if (myMineralBoxes.length == 0) return pTask;
        var aTarget = _.max(myMineralBoxes, (aBox) => { return _.sum(aBox.store); });


        // TODO ASAP: aTarget should be a drop box when full 

        pTask.aTarget = aTarget;
        return pTask;
    }

    assignMoveTarget(pTask)
    {
        // TODO: here we need a return to spawn when livetime critical - or better a unload to closest boxes
        // then recycle or suicide - so a new hauler can spawn

        if (!_.isUndefined(pTask.aPickup.aTarget))
        {
            if (!pTask.aCreep.pos.isNearTo(pTask.aPickup.aTarget))
            {
                pTask.aMove = pTask.aPickup.aTarget;
            }
        }
        else if (!_.isUndefined(pTask.aTarget))
        {
            if (!pTask.aCreep.pos.isNearTo(pTask.aTarget))
            {
                pTask.aMove = pTask.aTarget;
            }
        }
        return pTask;
    }

    assignTransferTarget(pTask)
    {
        // TODO: think about some sort of opportunities grabbing something while on the move - but for non-walkable
        // we only handle the target
        // we are still moving so no pickup
        if (!_.isUndefined(pTask.aMove)) return pTask;

        var aDelta = pTask.aCreep.carryCapacity - _.sum(pTask.aCreep.carry);
        if (aDelta == 0 ) return pTask;


        return pTask;
    }

    assignWithdrawTarget(pTask)
    {
        // TODO: think about some sort of opportunities grabbing something while on the move - but for non-walkable
        // we only handle the target
        // we are still moving so no pickup
        if (!_.isUndefined(pTask.aMove)) return pTask;
        return pTask;
    }
}
module.exports = MineralHaulerRole
