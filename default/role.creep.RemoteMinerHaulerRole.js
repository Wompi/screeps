class RemoteMinerHaulerRole extends require('role.creep.AbstractRole')
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
        logDERP('REMOTE MINER HAULER ROLE PROCESSED.....');
        if (!this.isRoleValid(pCreep)) return;

        var myFlagNames = _.filter(Game.flags,Flag.FLAG_COLOR.remote.miner.filter);
        if (myFlagNames.length == 0 )
        {
            // TODO: if nothing is to do consider moving to recycle position
            return;
        }
        var myFlag = _.min(myFlagNames, (a) => { return a.pos.getRangeTo(pCreep)});

        var myTask =
        {
            aCreep: pCreep,
            aRoom: pCreep.room,
            aFlag: myFlag,

            aMove: undefined,
            aWithdraw:
            {
                aTarget: undefined,
                aAmount: 0,
            },
            aTransfer:
            {
                aTarget: undefined,
                aAmount: 0,
            }

        }
        myTask = this.assignMoveTarget(myTask);
        myTask = this.assignWithdrawTarget(myTask);
        myTask = this.assignTransferTarget(myTask);

        // moveTask
        if (!_.isUndefined(myTask.aMove))
        {
            var result = pCreep.moveTo(myTask.aMove,{ignoreCreeps: true});
            logDERP('REMOTE MINER HAULER '+myTask.aCreep.name+' moves to source ['+myTask.aMove.pos.x+' '+myTask.aMove.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aWithdraw.aTarget))
        {
            var result = myTask.aCreep.withdraw(myTask.aWithdraw.aTarget,RESOURCE_ENERGY,myTask.aWithdraw.aAmount);
            logDEBUG('UPGRADER '+myTask.aCreep.name+' withdraws ['+myTask.aWithdraw.aAmount+'] from ['+myTask.aWithdraw.aTarget.pos.x+' '+myTask.aWithdraw.aTarget.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aTransfer.aTarget))
        {
            var result = myTask.aCreep.transfer(myTask.aTransfer.aTarget,RESOURCE_ENERGY,myTask.aTransfer.aAmount);
            logDERP('UPGRADER '+myTask.aCreep.name+' transfers ['+myTask.aTransfer.aAmount+'] from ['+myTask.aTransfer.aTarget.pos.x+' '+myTask.aTransfer.aTarget.pos.y+'] .. '+ErrorSting(result));
        }

        logDERP(' -------------------------- REMOTE MINER HAULER ----------------------');
    }

    assignMoveTarget(pTask)
    {
        var isRemote = (pTask.aFlag.pos.roomName == pTask.aCreep.room.name);

        if (_.sum(pTask.aCreep.carry) == pTask.aCreep.carryCapacity)
        {
            // move back to start room
            if (isRemote)
            {
                var aHome = pTask.aCreep.memory.home;
                var aDerp = Game.getObjectById(aHome);
                if (!_.isNull(aDerp))
                {
                    pTask.aMove = aDerp;
                }
                else
                {
                    logERROR('REMOTE MINER HAULER HAS NO HOME saved .... fix this!');
                }
            }
            else
            {
                var aStorage = pTask.aCreep.room.storage;
                if (!pTask.aCreep.pos.isNearTo(aStorage))
                {
                    pTask.aMove = aStorage;
                }
            }
        }
        else
        {
            if (!pTask.aCreep.pos.inRangeTo(pTask.aFlag,1))
            {
                pTask.aMove = pTask.aFlag;
            }
        }
        return pTask;
    }

    assignWithdrawTarget(pTask)
    {
        if (pTask.aCreep.pos.inRangeTo(pTask.aFlag,2))
        {
            var myBox = pTask.aRoom.find(FIND_STRUCTURES,
            {
                filter: (a) =>
                {
                    return     a.structureType == STRUCTURE_CONTAINER
                            && pTask.aCreep.pos.isNearTo(a)
                }
            });
            if (myBox.length == 0) return pTask;

            var myDelta = pTask.aCreep.carryCapacity - _.sum(pTask.aCreep.carry);
            pTask.aWithdraw.aTarget = myBox[0];
            pTask.aWithdraw.aAmount = _.min([myDelta,myBox[0].store.energy]);
        }
        return pTask;
    }

    assignTransferTarget(pTask)
    {
        var aStorage = pTask.aCreep.room.storage;
        if (_.isUndefined(aStorage)) return pTask;

        if (pTask.aCreep.pos.isNearTo(aStorage))
        {
            pTask.aTransfer.aTarget = aStorage;
            pTask.aTransfer.aAmount = pTask.aCreep.carry.energy;
        }
        return pTask;
    }
}
module.exports = RemoteMinerHaulerRole
