class RemoteReserveRole extends require('role.creep.AbstractRole')
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
        logDERP('REMOTE RESERVE ROLE PROCESSED.....');
        if (!this.isRoleValid(pCreep)) return;

        var myFlagNames = _.filter(Game.flags,Flag.FLAG_COLOR.remote.claim.filter);
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
            aReserve: undefined,
            aMove: undefined,
        };
        myTask = this.assignMoveTarget(myTask);
        myTask = this.assignReserveTarget(myTask);

        if (!_.isUndefined(myTask.aMove))
        {
            var result = pCreep.moveTo(myTask.aMove,{ignoreCreeps: true});
            logDERP('REMOTE RESERVE '+myTask.aCreep.name+' moves to pos ['+myTask.aMove.pos.x+' '+myTask.aMove.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aReserve))
        {
            var result = pCreep.reserveController(myTask.aReserve);
            logDERP('REMOTE RESERVE '+myTask.aCreep.name+' claims ['+myTask.aReserve.pos.x+' '+myTask.aReserve.pos.y+'] .. '+ErrorSting(result));
        }

        logDERP('---------------- REMOTE RESERVE --------------------');
    }

    assignMoveTarget(pTask)
    {
        if (!pTask.aCreep.pos.isNearTo(pTask.aFlag))
        {
            pTask.aMove = pTask.aFlag;
        }
        return pTask;
    }

    assignReserveTarget(pTask)
    {
        if (pTask.aCreep.pos.isNearTo(pTask.aFlag))
        {
            pTask.aReserve = pTask.aRoom.controller
        }
        return pTask;
    }
}
module.exports = RemoteReserveRole;
