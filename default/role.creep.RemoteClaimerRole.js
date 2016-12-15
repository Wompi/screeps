class RemoteClaimerRole extends require('role.creep.AbstractRole')
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
        logDERP('REMOTE CLAIMER ROLE PROCESSED.....');
        if (!this.isRoleValid(pCreep)) return;

        var myFlagNames = _.filter(Game.flags,Flag.FLAG_COLOR.pioneer.claim.filter);
        if (myFlagNames.length == 0 )
        {
            // TODO: if nothing is to do consider moving to recycle position
            return;
        }
        var myFlag = _.min(myFlagNames, (a) => { return a.pos.getRangeTo(pCreep)});

        if (pCreep.ticksToLive < 3)
        {
            myFlag.remove();
            pCreep.suicide();
            return;
        }

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
            aClaim: undefined,
            aUpgrade: undefined,
            aMove: undefined,
        };
        myTask = this.assignMoveTarget(myTask);
        myTask = this.assignWithdrawTarget(myTask);
        myTask = this.assignClaimTarget(myTask);
        myTask = this.assignUpgradeTarget(myTask);

        if (!_.isUndefined(myTask.aMove))
        {
            var result = pCreep.moveTo(myTask.aMove,{ignoreCreeps: true});
            logDERP('REMOTE CLAIMER '+myTask.aCreep.name+' moves to pos ['+myTask.aMove.pos.x+' '+myTask.aMove.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aWithdraw.aTarget))
        {
            var result = myTask.aCreep.withdraw(myTask.aWithdraw.aTarget,RESOURCE_ENERGY,myTask.aWithdraw.aAmount);
            logDERP('REMOTE CLAIMER '+myTask.aCreep.name+' withdraws ['+myTask.aWithdraw.aAmount+'] from ['+myTask.aWithdraw.aTarget.pos.x+' '+myTask.aWithdraw.aTarget.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aClaim))
        {
            var result = pCreep.claimController(myTask.aClaim);
            logDERP('REMOTE CLAIMER '+myTask.aCreep.name+' claims ['+myTask.aClaim.pos.x+' '+myTask.aClaim.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aUpgrade))
        {
            var result = myTask.aCreep.upgradeController(myTask.aUpgrade);
            logDEBUG('REMOTE CLAIMER '+myTask.aCreep.name+' upgrades controller ['+myTask.aUpgrade.pos.x+' '+myTask.aUpgrade.pos.y+'] .. '+ErrorSting(result));
        }

        logDERP('---------------- REMOTE BUILDER --------------------');
    }

    assignMoveTarget(pTask)
    {

        var isRemote = (pTask.aFlag.pos.roomName == pTask.aCreep.room.name);

        if (_.sum(pTask.aCreep.carry) == 0)
        {
            // move back to start room
            if (isRemote)
            {
                // just die when empty
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
            if (!pTask.aCreep.pos.isEqualTo(pTask.aFlag))
            {
                pTask.aMove = pTask.aFlag;
            }
        }
        return pTask;
    }

    assignWithdrawTarget(pTask)
    {

        var isRemote = (pTask.aFlag.pos.roomName == pTask.aCreep.room.name);

        if (isRemote) return pTask;

        var aStorage = pTask.aCreep.room.storage;
        if (pTask.aCreep.pos.isNearTo(aStorage))
        {
            var myDelta = pTask.aCreep.carryCapacity - _.sum(pTask.aCreep.carry);
            pTask.aWithdraw.aTarget = aStorage;
            pTask.aWithdraw.aAmount = _.min([myDelta,aStorage.store[RESOURCE_ENERGY]]);
        }
        return pTask;
    }

    assignClaimTarget(pTask)
    {
        if (pTask.aCreep.pos.isEqualTo(pTask.aFlag))
        {
            var aController = pTask.aRoom.controller;

            if (!aController.pos.isNearTo(pTask.aCreep)) return pTask; // this should not be happen

            if (aController.level == 0)
            {
                pTask.aClaim = aController
            }
        }
        return pTask;
    }

    assignUpgradeTarget(pTask)
    {
        if (pTask.aCreep.pos.isEqualTo(pTask.aFlag))
        {
            var aController = pTask.aRoom.controller;

            if (!aController.pos.isNearTo(pTask.aCreep)) return pTask; // this should not be happen

            if (aController.level > 0)
            {
                pTask.aUpgrade = aController;
            }
        }
        return pTask;
    }
}
module.exports = RemoteClaimerRole;
