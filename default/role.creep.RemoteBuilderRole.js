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

        var myResources = myTask.aRoom.find(FIND_DROPPED_RESOURCES,
        {
            filter: (a) =>
            {
                //a.init();
                return pCreep.pos.isNearTo(a) && a.resourceType == RESOURCE_ENERGY;
            }
        });
        var aResource = undefined;
        if (myResources.length > 0)
        {
            aResource = myResources[0];
            //logDERP('RESOURCE DERP: '+JSON.stringify(aResource))
        }
        if (!_.isUndefined(aResource))
        {
            pCreep.pickup(aResource);
            logDERP('REMOTE BUILDER: pickup - near energy ');
        }


        if (!_.isUndefined(myTask.aMove))
        {
            var result = pCreep.moveTo(myTask.aMove,{ignoreCreeps: false});
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
        var aStorage = pTask.aCreep.room.storage;

        var isRemote = (pTask.aFlag.pos.roomName == pTask.aCreep.room.name || _.isUndefined(aStorage));

        if (_.sum(pTask.aCreep.carry) == 0)
        {
            // move back to start room
            if (isRemote)
            {
                var myContainers = pTask.aCreep.room.find(FIND_STRUCTURES,
                {
                    filter: (a) =>
                    {
                        //a.init();
                        return     a.structureType == STRUCTURE_CONTAINER
                                && a.store[RESOURCE_ENERGY] >= 1000
                                && pTask.aCreep.pos.inRangeTo(a,5) ;
                    }
                });
                var aContainer = myContainers.length > 0 ? myContainers[0] : undefined;
                if (_.isUndefined(aContainer))
                {
                    var aHome = Game.getObjectById('58670bd25d1b59a921cc9639');
                    //var aDerp = Game.getObjectById(aHome);
                    if (!_.isNull(aHome))
                    {
                        pTask.aMove = aHome;
                    }
                    else
                    {
                        logERROR('REMOTE BUILDER HAS NO HOME saved .... fix this!');
                    }
                }
                else
                {
                    pTask.aMove = aContainer;
                }
            }
            else
            {
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
        var aStorage = pTask.aCreep.room.storage;

        var isRemote = (pTask.aFlag.pos.roomName == pTask.aCreep.room.name || _.isUndefined(aStorage));

        if (isRemote)
        {
            var myContainers = pTask.aCreep.room.find(FIND_STRUCTURES,
            {
                filter: (a) =>
                {
                    //a.init();
                    return     a.structureType == STRUCTURE_CONTAINER
                            && a.store[RESOURCE_ENERGY] >= 1000
                            && pTask.aCreep.pos.inRangeTo(a,5) ;
                }
            });
            var aContainer = myContainers.length > 0 ? myContainers[0] : undefined;
            if (_.isUndefined(aContainer))
            {
                return pTask;
            }
            else
            {
                var myDelta = pTask.aCreep.carryCapacity - _.sum(pTask.aCreep.carry);
                pTask.aWithdraw.aTarget = aContainer;
                pTask.aWithdraw.aAmount = _.min([myDelta,aContainer.store[RESOURCE_ENERGY]]);
                return pTask;
            }
        }

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
