class SupplierRole extends require('role.creep.AbstractRole')
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
        logDEBUG('SUPPLIER ROLE PROCESSED.....');
        if (!this.isRoleValid(pCreep)) return;

        var myTask =
        {
            aCreep: pCreep,
            aRoom: pCreep.room,
            aTarget: undefined,

            aMove: undefined,
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
        }

        myTask = this.assignPickupTarget(myTask);
        myTask = this.assignTarget(myTask);
        myTask = this.assignMoveTarget(myTask);
        myTask = this.assignTransferTarget(myTask);
        myTask = this.assignWithdrawTarget(myTask);
    }

    assignMoveTarget(pTask)
    {
        if (!_.isUndefined(pTask.aPickup.aTarget))
        {
            if (pTask.aCreep.pos.isNearTo(pTask.aPickup.aTarget))
            {
                pTask.aMove = pTask.aPickup.aTarget;
                return pTask;
            }
            else
            {
                return pTask;
            }
        }


        return pTask;
    }

    assignTarget(pTask)
    {
        if (!_.isUndefined(pTask.aPickup.aTarget))
        {
            pTask.aTarget = pTask.aPickup.aTarget;
            return pTask;
        }

        var aDeltaCarry = pTask.aCreep.carryCapacity - _.sum(pTask.aCreep.carry);
        if (aDeltaCarry == 0 )
        {
            var aDropTarget = this.findDropTarget(pTask);
        }

        return pTask;
    }

    // TODO: docu
    //  - don't pickanything up if rhe cargo is full
    //  - look for resources in range
    //  - set the pickup target and amount
    assignPickupTarget(pTask)
    {
        var aDeltaCarry = pTask.aCreep.carryCapacity - _.sum(pTask.aCreep.carry);
        if (aDeltaCarry == 0) return pTask;

        var myRoomResources = pTask.aRoom.getRoomObjects(ROOM_OBJECT_TYPE.resource);
        var myResources = _.filter(myRoomResources, (aRes) =>
        {
            return pTask.aCreep.pos.inRangeTo(aRes,HAULER_PICKUP_RANGE);
        });
        if (myResources.length == 0 ) return pTask;


        // TODO: this is not very good - the filter should search for rare resources and after all
        // it should contain a check if the hauler can actually reach the resource before it expires and if it
        // is even worse to go there (amount)
        _.forEach(myResources, (aRes) =>
        {
            // pickup the resource with the least amount (highly probable that these are rare drops)
            if (_.isUndefined(pTask.aPickup.aTarget) || pTask.aPickup.aAmount > aRes.amount)
            {
                pTask.aPickup.aTarget = aRes;
                pTask.aPickup.aAmount = _.min([aDelta,aRes.amount]);
            }
        });
        return pTask;
    }




    /// ---------------------- helper functions ---------------------------------------

    // TODO: this should be handled by some sort of logistic management
    //  - should contain a logic for sendinf only the needed amount of creeps to the target
    findDropTarget(pTask)
    {
        var result = undefined;
        var myRoomContainers = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.container);
        var myRoomTerminals = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.terminal);
        var myRoomLinks = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.link);

        var myIN = _.filter(myRoomContainers, (a) => { return a.isIN() });
        var myOUT = _.filter(myRoomContainers, (a) => { return a.isOUT()});

        var myRoomController = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.controller);

        myOUT = myOUT.concat(_.filter(myRoomLinks, (aLink) =>
        {
            var result = true;
            if (aLink.isReceiver())
            {
                _.forEach(myRoomController, (aController) =>
                {
                    if (aController.pos.inRangeTo(aLink,3))
                    {
                        result = false;
                    }
                });
            }
            else
            {
                result = false;
            }
            return result;
        }));

        _.forEach(myOUT, (a) =>
        {
            var d1 = _.sum(a.store) * 100 / a.storeCapacity;
            var d2 = _.sum(a.store)+'/'+a.storeCapacity;
            //logDERP('OUT at ['+a.pos.x+' '+a.pos.y+'] - '+a.structureType+' ['+d2+'] ['+d1+']');
        });

        _.forEach(myIN, (a) =>
        {
            var d1 = _.sum(a.store) * 100 / a.storeCapacity;
            var d2 = _.sum(a.store)+'/'+a.storeCapacity;
            //logDERP('IN at ['+a.pos.x+' '+a.pos.y+'] - '+a.structureType+' ['+d2+'] ['+d1+']');
        });

        return  {
                    aIN: myIN,
                    aOUT: myOUT,
                };
        return result;
    }
};
module.exports = SupplierRole;
