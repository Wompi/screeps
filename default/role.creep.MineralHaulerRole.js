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
            aTarget:
            {
                aGrabTarget: undefined,
                aDropTarget: undefined,
            },

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

        if (!_.isUndefined(myTask.aMove))
        {
            var result = pCreep.moveTo(myTask.aMove,{ignoreCreeps: true});
            logDERP('MINERAL HAULER '+myTask.aCreep.name+' moves to pos ['+myTask.aMove.pos.x+' '+myTask.aMove.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aWithdraw.aTarget))
        {
            var result = myTask.aCreep.withdraw(myTask.aWithdraw.aTarget,maxCarryResourceType(myTask.aWithdraw.aTarget.store),myTask.aWithdraw.aAmount);
            //logDERP(' carry = '+_.sum(myTask.aCreep.carry)+' target amount = '+myTask.aWithdraw.aAmount+' withdraw amount = '+aPickupAmount);
            logDERP('MINERAL HAULER '+myTask.aCreep.name+' withdraws ['+myTask.aWithdraw.aAmount+'] from ['+myTask.aWithdraw.aTarget.pos.x+' '+myTask.aWithdraw.aTarget.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aTransfer.aTarget))
        {
            var result = myTask.aCreep.transfer(myTask.aTransfer.aTarget,maxCarryResourceType(myTask.aCreep.carry),myTask.aTransfer.aAmount);
            logDERP('MINERAL HAULER '+myTask.aCreep.name+' transfer ['+myTask.aTransfer.aAmount+'] from ['+myTask.aTransfer.aTarget.pos.x+' '+myTask.aTransfer.aTarget.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aPickup.aTarget))
        {
            var aPickupAmount = _.min([ myTask.aPickup.aAmount , myTask.aCreep.carry.energyCapacity - myTask.aCreep.carry.energy ]);
            var result = myTask.aCreep.pickup(myTask.aPickup.aTarget,aPickupAmount);
            //logDERP(' carry = '+_.sum(myTask.aCreep.carry)+' target amount = '+myTask.aPickup.aAmount+' withdraw amount = '+aPickupAmount);
            logDERP('MINERAL HAULER '+myTask.aCreep.name+' pickup ['+aPickupAmount+'] from ['+myTask.aPickup.aTarget.pos.x+' '+myTask.aPickup.aTarget.pos.y+'] .. '+ErrorSting(result));
        }
        logDERP(' ------------------- MINERAL HAULER  ---------------   --------');
    }

    assignPickupTarget(pTask)
    {
        return pTask;
    }

    assignTarget(pTask)
    {
        if (!_.isUndefined(pTask.aPickup.aTarget))
        {
            logDERP(' ------- target null pickup --------');
            return pTask;
        }
        var aStorage = pTask.aRoom.storage;
        if (_.isUndefined(aStorage)) return pTask;

        if (pTask.aCreep.isFull || (pTask.aCreep.pos.inRangeTo(aStorage,6) && _.sum(pTask.aCreep.store) > 0))
        {
            var aTarget = aStorage;
            pTask.aTarget = aTarget;
            logDERP(' ------- target storage --------');
        }
        else
        {
            var myRoomContainers = pTask.aRoom.getRoomObjects(ROOM_OBJECT_TYPE.container);
            var myMineralBoxes = _.filter(myRoomContainers, (aBox) => { return aBox.hasMinerals();});

            // TODO: if there are no mineral boxes we should set the target to something like parking/recycle position
            // otherwise the creep is stuck at the current position
            if (myMineralBoxes.length == 0) return pTask;
            var aTarget = _.max(myMineralBoxes, (aBox) => { return _.sum(aBox.store); });
            pTask.aTarget = aTarget;
            logDERP(' ------- target container --------');

        }
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
                logDERP(' ------- move pickup --------');

            }
        }
        else if (!_.isUndefined(pTask.aTarget))
        {
            if (!pTask.aCreep.pos.isNearTo(pTask.aTarget))
            {
                pTask.aMove = pTask.aTarget;
                logDERP(' ------- move target --------');
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
        if (!_.isUndefined(pTask.aPickup.aTarget)) return pTask;

        if (_.sum(pTask.aCreep.carry) > 0)
        {
            pTask.aTransfer.aTarget = pTask.aTarget;

            var aDelta = pTask.aTarget.storeCapacity - _.sum(pTask.aTarget.store);

            var aMaxResourceType = maxCarryResourceType(pTask.aCreep.carry);

            logDERP(' aMaxResourceType = '+aMaxResourceType+' aDelta = '+aDelta);
            pTask.aTransfer.aAmount = _.min([aDelta,pTask.aCreep.carry[aMaxResourceType]]);
            logDERP(' ------- transfer --------');
        }
        return pTask;
    }

    assignWithdrawTarget(pTask)
    {
        // TODO: think about some sort of opportunities grabbing something while on the move - but for non-walkable
        // we only handle the target
        // we are still moving so no pickup
        if (!_.isUndefined(pTask.aMove)) return pTask;
        if (!_.isUndefined(pTask.aPickup.aTarget)) return pTask;

        if (!_.isUndefined(pTask.aTransfer.aTarget)) return pTask;

        logDERP(JSON.stringify(pTask.aTarget));
        var aMineral = pTask.aTarget.getStoredMineral();
        logDERP(' aMineral =' +JSON.stringify(aMineral));

        if (!pTask.aCreep.isFull && aMineral.mineralAmount > 0)
        {
            pTask.aWithdraw.aTarget = pTask.aTarget;

            var aDelta = pTask.aCreep.carryCapacity - _.sum(pTask.aCreep.carry);

            pTask.aWithdraw.aAmount = _.min([aDelta,aMineral.mineralAmount]);

            logDERP(' ------- withdraw --------');
        }
        return pTask;
    }
}
module.exports = MineralHaulerRole
