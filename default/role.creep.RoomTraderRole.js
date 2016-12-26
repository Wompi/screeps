class RoomTraderRole extends require('role.creep.AbstractRole')
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
        logDEBUG('ROOM TRADER ROLE PROCESSED.....');
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
        }
        myTask = this.assignMoveTarget(myTask);
        myTask = this.assignTransferTarget(myTask);
        myTask = this.assignWithdrawTarget(myTask);

        if (!_.isUndefined(myTask.aMove))
        {
            var result = pCreep.moveTo(myTask.aMove,{ignoreCreeps: true});
            logDERP('ROOM TRADER '+myTask.aCreep.name+' moves to pos ['+myTask.aMove.pos.x+' '+myTask.aMove.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aWithdraw.aTarget))
        {
            var result = myTask.aCreep.withdraw(myTask.aWithdraw.aTarget,myTask.aWithdraw.aKey,myTask.aWithdraw.aAmount);
            logDERP('UPGRADER '+myTask.aCreep.name+' withdraws ['+myTask.aWithdraw.aKey+']['+myTask.aWithdraw.aAmount+'] from ['+myTask.aWithdraw.aTarget.pos.x+' '+myTask.aWithdraw.aTarget.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aTransfer.aTarget))
        {
            var result = myTask.aCreep.transfer(myTask.aTransfer.aTarget,myTask.aTransfer.aKey,myTask.aTransfer.aAmount);
            logDERP('UPGRADER '+myTask.aCreep.name+' transfers ['+myTask.aTransfer.aKey+']['+myTask.aTransfer.aAmount+'] from ['+myTask.aTransfer.aTarget.pos.x+' '+myTask.aTransfer.aTarget.pos.y+'] .. '+ErrorSting(result));
        }

        logDERP('---------------- ROOM TRADER --------------------');
    }

    assignMoveTarget(pTask)
    {
        if (_.sum(pTask.aCreep.carry) == 0)
        {
            if (pTask.aCreep.ticksToLive < 150)
            {
                var aSpawn = _.min(Game.spawns, (aSpawn) =>
                {
                    return Util.getPath(pTask.aCreep.pos,aSpawn.pos).path.length;
                });
                if (pTask.aCreep.pos.isNearTo(aSpawn) && pTask.aCreep.getLiveRenewTicks() > 0)
                {
                    // wait till full repair
                    return pTask;
                }

                pTask.aMove = aSpawn;
            }
            else
            {
                var aStartRoom = Game.rooms['E65N49'];
                var aGrabStorage = aStartRoom.storage;
                if (!aGrabStorage.hasMinerals) return pTask;

                var aMineralAmount = aGrabStorage.getStoredMineral();

                if (!pTask.aCreep.pos.isNearTo(aGrabStorage))
                {
                    pTask.aMove = aGrabStorage;
                }
            }

        }
        else
        {
            var aEndRoom = Game.rooms['E66N49'];
            var aDropStorage = aEndRoom.storage;
            var canStore = (aDropStorage.storeCapacity - _.sum(aDropStorage.store)) > _.sum(pTask.aCreep.carry);
            if (!canStore) return pTask;

            if (!pTask.aCreep.pos.isNearTo(aDropStorage))
            {
                pTask.aMove = aDropStorage;
            }
        }
        return pTask;
    }

    assignTransferTarget(pTask)
    {
        var aEndRoom = Game.rooms['E66N49'];
        var aDropStorage = aEndRoom.storage;

        if (!pTask.aCreep.pos.isNearTo(aDropStorage)) return pTask;

        var aType =  maxCarryResourceType(pTask.aCreep.carry);

        pTask.aTransfer.aTarget = aDropStorage;
        pTask.aTransfer.aAmount = pTask.aCreep.carry[aType];
        pTask.aTransfer.aKey = aType;
        return pTask;
    }

    assignWithdrawTarget(pTask)
    {
        var aStartRoom = Game.rooms['E65N49'];
        var aGrabStorage = aStartRoom.storage;
        if (!aGrabStorage.hasMinerals) return pTask;

        var aMineral = aGrabStorage.getStoredMineral();

        if (!pTask.aCreep.pos.isNearTo(aGrabStorage)) return pTask;

        var myDelta = pTask.aCreep.carryCapacity - _.sum(pTask.aCreep.carry);

        pTask.aWithdraw.aTarget = aGrabStorage;
        pTask.aWithdraw.aAmount = _.min([myDelta,aMineral.mineralAmount]);
        pTask.aWithdraw.aKey = aMineral.mineralKey;
        return pTask;
    }
}
module.exports = RoomTraderRole;
