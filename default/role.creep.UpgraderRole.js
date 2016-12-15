class UpgraderRole extends require('role.creep.AbstractRole')
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
        logDEBUG('UPGRADER ROLE PROCESSED.....');
        if (!this.isRoleValid(pCreep)) return;

        var myTask =
        {
            aCreep: pCreep,
            aRoom: pCreep.room,

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
            aUpgrade:
            {
                aTarget: undefined,
                aAmount: undefined,
            }
        }

        myTask = this.assignMoveTarget(myTask);
        myTask = this.assignUpgradeTarget(myTask);
        //myTask = this.assignPickupTarget(myTask);
        myTask = this.assignWithdrawTarget(myTask);


        if (!_.isUndefined(myTask.aMove))
        {
            var result = pCreep.moveTo(myTask.aMove,{ignoreCreeps: true});
            logDEBUG('UPGRADER '+myTask.aCreep.name+' moves to pos ['+myTask.aMove.x+' '+myTask.aMove.y+'] .. '+ErrorSting(result));
            myTask.aCreep.memory.travelTime = myTask.aCreep.memory.travelTime + 1;
        }

        if (!_.isUndefined(myTask.aWithdraw.aTarget))
        {
            var result = myTask.aCreep.withdraw(myTask.aWithdraw.aTarget,RESOURCE_ENERGY,myTask.aWithdraw.aAmount);
            //logDERP(' carry = '+_.sum(myTask.aCreep.carry)+' target amount = '+myTask.aWithdraw.aAmount+' withdraw amount = '+aWithdrawAmount);
            logDEBUG('UPGRADER '+myTask.aCreep.name+' withdraws ['+myTask.aWithdraw.aAmount+'] from ['+myTask.aWithdraw.aTarget.pos.x+' '+myTask.aWithdraw.aTarget.pos.y+'] .. '+ErrorSting(result));
        }

        // if (!_.isUndefined(myTask.aPickup.aTarget))
        // {
        //     var aPickupAmount = _.min([ myTask.aPickup.aAmount , myTask.aCreep.carry.energyCapacity - myTask.aCreep.carry.energy ]);
        //     var result = myTask.aCreep.pickup(myTask.aPickup.aTarget,aPickupAmount);
        //     logDERP(' carry = '+_.sum(myTask.aCreep.carry)+' target amount = '+myTask.aPickup.aAmount+' withdraw amount = '+aPickupAmount);
        //     logDERP('MINER '+myTask.aCreep.name+' pickup ['+aPickupAmount+'] from ['+myTask.aPickup.aTarget.pos.x+' '+myTask.aPickup.aTarget.pos.y+'] .. '+ErrorSting(result));
        // }

        if (!_.isUndefined(myTask.aUpgrade.aTarget))
        {
            var result = myTask.aCreep.upgradeController(myTask.aUpgrade.aTarget);
            logDEBUG('UPGRADER '+myTask.aCreep.name+' upgrades controller ['+myTask.aUpgrade.aTarget.pos.x+' '+myTask.aUpgrade.aTarget.pos.y+'] .. '+ErrorSting(result));
        }

        //logDERP('---------------- UPGRADER --------------------');
    }

    assignWithdrawTarget(pTask)
    {
        if (!_.isUndefined(pTask.aTransfer.aTarget)) return pTask;
        if (!pTask.aRoom.my) return pTask;
        if (!_.isUndefined(pTask.aMove)) return pTask;
        if (!_.isUndefined(pTask.aPickup.aTarget)) return pTask;

        var uA = pTask.aCreep.getActiveBodyparts(WORK) * UPGRADE_CONTROLLER_POWER;
        var eA =_.sum(pTask.aCreep.carry);
        if (eA < uA)
        {
            pTask = this.checkBoxWithdrawTarget(pTask,1000);
            if (_.isUndefined(pTask.aWithdraw.aTarget))
            {
                pTask = this.checkLinkWithdrawTarget(pTask);

                // TODO: rethink this .. if the box is under the first limit and the link is emptySpots
                // use the box with no limit ...
                if (_.isUndefined(pTask.aWithdraw.aTarget))
                {
                    pTask = this.checkBoxWithdrawTarget(pTask,0);
                }
            }
        }
        else
        {
            //logDERP(' ----- wait withdraw ['+eA+']['+uA+'] ['+Game.time+']')
        }
        return pTask;
    }

    checkBoxWithdrawTarget(pTask,pAmountBorder)
    {
        if (!_.isUndefined(pTask.aWithdraw.aTarget)) return pTask;

        var myRoomControllers = pTask.aRoom.getRoomObjects(ROOM_OBJECT_TYPE.controller);
        var aController = myRoomControllers[0];

        if (aController.hasUpgraderBox)
        {
            // TODO: change this if we have more than one box
            var aBox = aController.myUpgraderBoxes[0];
            if (_.sum(aBox.store) > pAmountBorder)
            {
                var cA = pTask.aCreep.carryCapacity;
                var eA = _.sum(pTask.aCreep.carry)
                var bA = _.sum(aBox.store);
                var aAmount = cA - eA  ;


                //logDERP(' --------- box withdraw ['+bA+'] ['+aAmount+'] ['+cA+' '+eA+'] ['+Game.time+']------ ');

                pTask.aWithdraw.aTarget = aBox;
                pTask.aWithdraw.aAmount = aAmount;
            }
        }
        return pTask;
    }


    checkLinkWithdrawTarget(pTask)
    {
        if (!_.isUndefined(pTask.aWithdraw.aTarget)) return pTask;

        var myRoomLinks = pTask.aRoom.getRoomObjects(ROOM_OBJECT_TYPE.link);
        if (myRoomLinks.length == 0) return pTask;

        var myLinks = _.filter(myRoomLinks, (a) => { return a.pos.isNearTo(pTask.aCreep) && a.energy > 0})
        if (myLinks.length == 0 ) return pTask;

        var aLink = myLinks[0];
        if (aLink.energy == 0 ) return pTask


        var cA = pTask.aCreep.carryCapacity;
        var eA = _.sum(pTask.aCreep.carry)
        var eL = aLink.energy;
        var aAmount = _.min([cA - eA,eL]);

        //logDERP(' --------- link withdraw ['+eL+'] ['+aAmount+'] ['+cA+' '+eA+'] ['+Game.time+']------ ');

        pTask.aWithdraw.aTarget = aLink;
        pTask.aWithdraw.aAmount = aAmount;

        return pTask;
    }

    assignPickupTarget(pTask)
    {
        // if (_.isUndefined(pTask.aCreep)) return pTask;
        // if (_.isUndefined(pTask.aRoom)) return pTask;
        //
        // var myRoomResources = pTask.aRoom.getRoomObjects(ROOM_OBJECT_TYPE.resource);
        // var myResources = _.filter(myRoomResources, (aRes) =>
        // {
        //     return pTask.aCreep.pos.getRangeTo(aRes) < 2;
        // });
        // if (myResources.length == 0 ) return pTask;
        //
        // _.forEach(myResources, (aRes) =>
        // {
        //     // pickup the resource with the least amount (highly probable that these are rare drops)
        //     if (_.isUndefined(pTask.aPickup.aTarget) || pTask.aPickup.aAmount > aRes.amount)
        //     {
        //         pTask.aPickup.aTarget = aRes;
        //         pTask.aPickup.aAmount = aRes.amount;
        //     }
        // });
        return pTask;
    }

    assignUpgradeTarget(pTask)
    {
        if (!pTask.aRoom.my) return pTask;
        if (!_.isUndefined(pTask.aMove)) return pTask;

        var myRoomControllers = pTask.aRoom.getRoomObjects(ROOM_OBJECT_TYPE.controller);
        var aController = myRoomControllers[0];

        pTask.aUpgrade.aTarget = aController;
        pTask.aUpgrade.aAmount = pTask.aCreep.getActiveBodyparts(WORK) * UPGRADE_CONTROLLER_POWER;
        return pTask;
    }

    assignMoveTarget(pTask)
    {
        if (!pTask.aRoom.my) return pTask;
        if (_.isUndefined(pTask.aCreep)) return pTask;

        var myRoomControllers = pTask.aRoom.getRoomObjects(ROOM_OBJECT_TYPE.controller);
        var aController = myRoomControllers[0];

        var aCheck = this.findControllerPosition(aController,pTask.aRoom)
        if (_.isUndefined(aCheck.aPos))
        {
            logERROR('UPGRADER '+pTask.aCreep.name+' has no controller position! - fix this');
            return pTask;
        }

        if (!pTask.aCreep.pos.isEqualTo(aCheck.aPos))
        {
            //logDERP(' ----- aPOs ------- '+JSON.stringify(aCheck.aPos));
            pTask.aMove = aCheck.aPos;
        }
        return pTask;
    }

    findControllerPosition(pController,pRoom)
    {
        var aControllerBox = (pController.hasUpgraderBox) ? pController.myUpgraderBoxes[0] : undefined;
        if (_.isUndefined(aControllerBox))
        {
            // TODO: for this time I only handle upgrades with controller box
            // consider for later tojust update the pos and the upgrader might be filled with links
            return { aBox: undefined, aPos: undefined};
        }
        var myRoomSources = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.source);
        var myMiningBoxes = [];
        _.forEach(myRoomSources,(a) => { if (a.hasMiningBox) myMiningBoxes = myMiningBoxes.concat(a.myMiningBoxes);});


        var result = { aBox: aControllerBox, aPos: aControllerBox.pos }
        _.forEach(myMiningBoxes, (a) =>
        {
            // TODO: uncomment this if the road is build in E66
            if (a.pos.isEqualTo(aControllerBox))
            {
                var nearPositions = findAdjacentWalkablePositions(aControllerBox.pos);

                var aNearPos = _.min(nearPositions, (a) =>
                {

                    var aLook = a.look();
                    var aLookTypes = _.countBy(aLook,'type');
                    delete aLookTypes['creep'];
                    //logDERP(' pos ['+a.x+' '+a.y+'] ');
                    //logDERP(' pos ['+a.x+' '+a.y+'] ');
                    //logDERP(JSON.stringify(aLookTypes));
                    //logDERP('----- BLARK ----- ' +JSON.stringify(a)+' RANGE: '+a.getRangeTo(pController)+' look: '+ (_.keys(aLookTypes).length)   );

                    // TODO: weonly search for spots with no structures on it ... this can be tricky later
                    // if we have no spot ... then change this
                    if (_.keys(aLookTypes).length != 1) return MAX_ROOM_RANGE;
                    return a.getRangeTo(pController);
                });
                result.aPos = aNearPos;
            }
        });
        return result;
    }
}
module.exports = UpgraderRole;
