class BrokerRoler extends require('role.creep.AbstractRole')
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
        logDERP('BROKER ROLE PROCESSED.....');
        if (!this.isRoleValid(pCreep)) return;
        var myTask =
        {
            aCreep: pCreep,
            aRoom: pCreep.room,
            aWithdraw:
            {
                aTarget: undefined,
                aAmount: 0,
                aKey: undefined,
            },
            aTransfer:
            {
                aTarget: undefined,
                aAmount: 0,
                aKey: undefined,
            },
            aMove: undefined,
        };
        myTask = this.assignMoveTarget(myTask);
        myTask = this.assignTransferTarget(myTask);
        myTask = this.assignWithdrawTarget(myTask);

        if (!_.isUndefined(myTask.aMove))
        {
            var result = pCreep.moveTo(myTask.aMove,{ignoreCreeps: true});
            logDERP('BROKER '+myTask.aCreep.name+' moves to pos ['+myTask.aMove.pos.x+' '+myTask.aMove.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aTransfer.aTarget))
        {
            var result = myTask.aCreep.transfer(myTask.aTransfer.aTarget,myTask.aTransfer.aKey,myTask.aTransfer.aAmount);
            logDERP('BROKER '+myTask.aCreep.name+' transfer ['+myTask.aTransfer.aKey+']['+myTask.aTransfer.aAmount+'] to ['+myTask.aTransfer.aTarget.pos.x+' '+myTask.aTransfer.aTarget.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aWithdraw.aTarget))
        {
            var result = myTask.aCreep.withdraw(myTask.aWithdraw.aTarget,myTask.aWithdraw.aKey,myTask.aWithdraw.aAmount);
            logDERP('BROKER '+myTask.aCreep.name+' withdraw ['+myTask.aWithdraw.aKey+']['+myTask.aWithdraw.aAmount+'] from ['+myTask.aWithdraw.aTarget.pos.x+' '+myTask.aWithdraw.aTarget.pos.y+'] .. '+ErrorSting(result));
        }

        logDERP('---------------- BROKER --------------------');
    }

    assignMoveTarget(pTask)
    {
        var aTerminal = pTask.aRoom.terminal;
        var aStorage = pTask.aRoom.storage;

        if (_.isUndefined(aTerminal)) return pTask;
        if (_.isUndefined(aStorage)) return pTask;

        if (_.sum(pTask.aCreep.carry) == 0)
        {
            if (!pTask.aCreep.pos.isNearTo(aStorage))
            {
                pTask.aMove = aStorage;
            }
            else
            {
                var myLinks = pTask.aRoom.getRoomObjects(ROOM_OBJECT_TYPE.link)
                if (myLinks.length > 0)
                {
                    var aLinks = _.filter(myLinks, (a) =>
                    {
                        return (a.pos.inRangeTo(aStorage,1));
                    });
                    var aLink = aLinks[0];
                    if (!_.isUndefined(aLink))
                    {
                        if (!aLink.pos.isNearTo(pTask.aCreep))
                        {
                            pTask.aMove = aLink;
                        }
                    }
                }
            }
        }
        else
        {
            if (!pTask.aCreep.pos.isNearTo(aTerminal))
            {
                pTask.aMove = aTerminal;
            }
        }
        return pTask;
    }

    assignTransferTarget(pTask)
    {
        var aTerminal = pTask.aRoom.terminal;
        if (_.isUndefined(aTerminal)) return pTask;
        if (!aTerminal.needResources()) return pTask;

        if (_.sum(pTask.aCreep.carry) > 0)
        {
            if (pTask.aCreep.pos.isNearTo(aTerminal))
            {
                var aKey = maxCarryResourceType(pTask.aCreep.carry);
                pTask.aTransfer.aTarget = aTerminal;
                pTask.aTransfer.aAmount = pTask.aCreep.carry[aKey];
                pTask.aTransfer.aKey = aKey;
            }
        }
        return pTask;
    }

    assignWithdrawTarget(pTask)
    {
        if (pTask.aCreep.ticksToLive < 2) return pTask;

        var aTerminal = pTask.aRoom.terminal;
        if (_.isUndefined(aTerminal)) return pTask;
        if (!aTerminal.needResources()) return pTask;

        var aStorage = pTask.aRoom.storage;
        if (_.isUndefined(aStorage)) return pTask;

        if (_.sum(pTask.aCreep.carry) == 0)
        {
            if (pTask.aCreep.pos.isNearTo(aStorage))
            {
                var aNeed = aTerminal.getNeededResources();

                if (aNeed[RESOURCE_ENERGY] > 0)
                {
                    var myLinks = pTask.aRoom.getRoomObjects(ROOM_OBJECT_TYPE.link)
                    if (myLinks.length > 0)
                    {
                        var aLinks = _.filter(myLinks, (a) =>
                        {
                            return (a.pos.inRangeTo(aStorage,1));
                        });
                        var aLink = aLinks[0];
                        if (!_.isUndefined(aLink))
                        {
                            if (aLink.pos.isNearTo(pTask.aCreep) && aLink.energy > 0)
                            {
                                var aDelta = pTask.aCreep.carryCapacity - _.sum(pTask.aCreep.carry);
                                pTask.aWithdraw.aTarget = aLink;
                                pTask.aWithdraw.aAmount = _.min([aDelta,aLink.energy]);
                                pTask.aWithdraw.aKey = RESOURCE_ENERGY;
                                return pTask;
                            }
                        }
                    }
                }

                pTask.aWithdraw.aTarget = aStorage;

                _.forEach(aNeed, (aValue,aKey) =>
                {
                    var aStoreAmount = aStorage.store[aKey];
                    if (aStoreAmount == 0)
                    {
                        delete aNeed[aKey];
                    }
                })
                if (_.keys(aNeed).length == 0) return pTask;

                var aKey = _.keys(aNeed)[0];

                var aMount = aNeed[aKey];
                var aDelta = pTask.aCreep.carryCapacity - _.sum(pTask.aCreep.carry);
                pTask.aWithdraw.aAmount = _.min([aDelta,aStorage.store[aKey]]);
                pTask.aWithdraw.aKey = aKey;
            }
        }
        return pTask;
    }

};
module.exports = BrokerRoler;
