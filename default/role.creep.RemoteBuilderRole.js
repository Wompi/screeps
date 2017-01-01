class RemoteBuilderRole extends require('role.creep.AbstractRole')
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
        logDERP('REMOTE BUILDER ROLE PROCESSED.....');
        if (!this.isRoleValid(pCreep)) return;

        var myFlagNames = _.filter(Game.flags,Flag.FLAG_COLOR.pioneer.construction.filter);
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
                aKey: undefined,
            },
            aBuild: undefined,
            aMove: undefined,
            aUpgrade: undefined,
        };

        myTask = this.assignMoveTarget(myTask);
        myTask = this.assignWithdrawTarget(myTask);
        myTask = this.assignBuildTarget(myTask);
        myTask = this.assignUpgradeTarget(myTask);

        if (!_.isUndefined(myTask.aMove))
        {
            var result = pCreep.moveTo(myTask.aMove,{ignoreCreeps: true});
            logDERP('REMOTE BUILDER '+myTask.aCreep.name+' moves to pos ['+myTask.aMove.pos.x+' '+myTask.aMove.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aWithdraw.aTarget))
        {
            var result = myTask.aCreep.withdraw(myTask.aWithdraw.aTarget,RESOURCE_ENERGY,myTask.aWithdraw.aAmount);
            logDERP('REMOTE BUILDER '+myTask.aCreep.name+' withdraws ['+myTask.aWithdraw.aKey+']['+myTask.aWithdraw.aAmount+'] from ['+myTask.aWithdraw.aTarget.pos.x+' '+myTask.aWithdraw.aTarget.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aUpgrade))
        {
            var result = myTask.aCreep.upgradeController(myTask.aUpgrade);
            logDEBUG('REMOTE BUILDER '+myTask.aCreep.name+' upgrades controller ['+myTask.aUpgrade.pos.x+' '+myTask.aUpgrade.pos.y+'] .. '+ErrorSting(result));
        }


        if (!_.isUndefined(myTask.aBuild))
        {
            var result = pCreep.build(myTask.aBuild);
            logDERP('REMOTE BUILDER '+myTask.aCreep.name+' builds ['+myTask.aBuild.pos.x+' '+myTask.aBuild.pos.y+'] .. '+ErrorSting(result));
        }

        logDERP('---------------- REMOTE BUILDER --------------------');

    }

    assignUpgradeTarget(pTask)
    {
        var aController = pTask.aRoom.controller;

        if (pTask.aCreep.pos.inRangeTo(aController,3) && aController.level < 3 && pTask.aCreep.carry.energy > 0)
        {
            pTask.aUpgrade = aController;
        }
        return pTask;
    }

    assignMoveTarget(pTask)
    {

        var isRemote = (pTask.aFlag.pos.roomName == pTask.aCreep.room.name);

        if (_.sum(pTask.aCreep.carry) == 0)
        {
            // move back to start room
            if (isRemote)
            {
                // var aRoom = pTask.aCreep.room;
                // var myRoomBoxs = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.container);
                // var myBoxs = _.filter(myRoomBoxs, (a) => { return a.store[RESOURCE_ENERGY] > 1499 ;});
                //
                // var aBox = _.min(myBoxs, (a) =>
                // {
                //     return pTask.aCreep.pos.getRangeTo(a);
                // });
                // logDERP('DERP: '+JSON.stringify(aBox));
                // if (_.isNull(aBox))
                // {
                    var aHome = pTask.aCreep.memory.home;
                    var aDerp = Game.getObjectById(aHome);
                    if (!_.isNull(aDerp))
                    {
                        pTask.aMove = aDerp;
                    }
                    else
                    {
                        logERROR('REMOTE BUILDER HAS NO HOME saved .... fix this!');
                    }
                // }
                // else
                // {
                //     pTask.aMove = aBox;
                // }
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

        if (isRemote)
        {
            // var aRoom = pTask.aCreep.room;
            // var myRoomBoxs = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.container);
            // var myBoxs = _.filter(myRoomBoxs, (a) => { return a.store[RESOURCE_ENERGY] > 1499 ;});
            //
            // var aBox = _.min(myBoxs, (a) =>
            // {
            //     return pTask.aCreep.pos.getRangeTo(a);
            // });
            // logDERP(JSON.stringify(aBox))
            // if (_.isNull(aBox))
            // {
                //logDERP('NULL PASS')
                return pTask;
//             }
//             else
//             {
//                 logDERP('NULL CHECK ' +JSON.stringify(aBox))
//                 var myDelta = pTask.aCreep.carryCapacity - _.sum(pTask.aCreep.carry);
//                 pTask.aWithdraw.aTarget = aBox;
// //                pTask.aWithdraw.aAmount = _.min([myDelta,aBox.store[RESOURCE_ENERGY]]);
//                 pTask.aWithdraw.aAmount = myDelta;
//                 return pTask;
//             }
        }

        var aStorage = pTask.aCreep.room.storage;
        if (pTask.aCreep.pos.isNearTo(aStorage))
        {
            var myDelta = pTask.aCreep.carryCapacity - _.sum(pTask.aCreep.carry);
            pTask.aWithdraw.aTarget = aStorage;
            pTask.aWithdraw.aAmount = _.min([myDelta,aStorage.store[RESOURCE_ENERGY]]);
        }
        return pTask;
    }

    assignBuildTarget(pTask)
    {
        // var isRemote = (pTask.aFlag.pos.roomName == pTask.aCreep.room.name);
        // if (!isRemote) return pTask;

        if (pTask.aCreep.pos.isNearTo(pTask.aFlag))
        {
            var mySites = _.filter(Game.constructionSites, (a) =>
            {
                return a.pos.inRangeTo(pTask.aCreep,3);
            });
            if (mySites.length == 0)
            {
                pTask.aFlag.remove();
                return pTask;
            }
            pTask.aBuild = mySites[0];
        }
        return pTask;
    }
}
module.exports = RemoteBuilderRole;
