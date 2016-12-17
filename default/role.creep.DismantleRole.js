class DismantleRole extends require('role.creep.AbstractRole')
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
        logDERP('DISMANTLE ROLE PROCESSED.....');
        if (!this.isRoleValid(pCreep)) return;

        var myFlagNames = _.filter(Game.flags,Flag.FLAG_COLOR.construction.dismantle.filter);
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
            aTarget: undefined,
            aFlag: myFlag,
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
            aDismantle: undefined,
        };

        myTask = this.assignMoveTarget(myTask);
        myTask = this.assignTransferTarget(myTask);
        myTask = this.assignDismantleTarget(myTask);

        if (!_.isUndefined(myTask.aMove))
        {
            var result = pCreep.moveTo(myTask.aMove,{ignoreCreeps: true});
            logDERP('DISMANTLE '+myTask.aCreep.name+' moves to pos ['+myTask.aMove.pos.x+' '+myTask.aMove.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aTransfer.aTarget))
        {
            var result = myTask.aCreep.transfer(myTask.aTransfer.aTarget,RESOURCE_ENERGY,myTask.aTransfer.aAmount);
            logDERP('DISMANTLE '+myTask.aCreep.name+' transfer ['+myTask.aTransfer.aAmount+'] from ['+myTask.aTransfer.aTarget.pos.x+' '+myTask.aTransfer.aTarget.pos.y+'] .. '+ErrorSting(result));
        }


        if (!_.isUndefined(myTask.aDismantle))
        {
            var result = myTask.aCreep.dismantle(myTask.aDismantle);
            logDERP('DISMANTLE '+myTask.aCreep.name+' dismantles['+myTask.aDismantle.pos.x+' '+myTask.aDismantle.pos.y+'] .. '+ErrorSting(result));
        }


        logDERP('---------------- DISMANTLE --------------------');
    }

    assignMoveTarget(pTask)
    {
        var isRemote = (pTask.aFlag.pos.roomName == pTask.aCreep.room.name);

        var aDelta = pTask.aCreep.carryCapacity - _.sum(pTask.aCreep.carry);

        if (aDelta == 0)
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
                    logERROR('DISMANTLE HAS NO HOME saved .... fix this!');
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
            if (!pTask.aCreep.pos.isNearTo(pTask.aFlag))
            {
                pTask.aMove = pTask.aFlag;
            }
        }
        return pTask;
    }

    assignTransferTarget(pTask)
    {
        var isRemote = (pTask.aFlag.pos.roomName == pTask.aCreep.room.name);
        if (isRemote) return pTask;

        var aDelta = pTask.aCreep.carryCapacity - _.sum(pTask.aCreep.carry);
        if (aDelta != 0) return pTask;

        var aStorage = pTask.aCreep.room.storage;
        if (pTask.aCreep.pos.isNearTo(aStorage))
        {
            var myDelta = pTask.aCreep.carryCapacity - _.sum(pTask.aCreep.carry);
            pTask.aTransfer.aTarget = aStorage;
            pTask.aTransfer.aAmount = _.min([myDelta,_.sum(aStorage.store)]);
        }
        return pTask;
    }

    assignDismantleTarget(pTask)
    {
        if (pTask.aCreep.pos.isNearTo(pTask.aFlag))
        {
            var myDismantles = pTask.aFlag.pos.lookFor(LOOK_STRUCTURES);
            if (myDismantles.length == 0)
            {
                pTask.aFlag.remove();
                return pTask;
            }
            pTask.aDismantle = myDismantles[0];
        }
        return pTask;
    }

};
module.exports = DismantleRole;
