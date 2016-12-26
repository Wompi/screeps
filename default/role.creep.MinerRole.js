class MinerRole extends require('role.creep.AbstractRole')
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
        logDEBUG('MINER ROLE PROCESSED.....');
        if (!this.isRoleValid(pCreep)) return;

        var myTask =
        {
            aCreep: pCreep,
            aRoom: pCreep.room,
            aSource: undefined,

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
            aDrop:
            {
                aType: undefined,
                aAmount: 0,
            },
            aMove: undefined,
            aHarvest: undefined,
            aBuild: undefined,

        }
        myTask = this.assignMiningSource(myTask);
        myTask = this.assignMoveTarget(myTask);
        myTask = this.assignHarvestTarget(myTask);
        myTask = this.assignPickupTarget(myTask);
        myTask = this.assignTransferTarget(myTask);
        myTask = this.assignWithdrawTarget(myTask);
        myTask = this.assignBuildTarget(myTask);
        myTask = this.assignDropTarget(myTask);

        if (_.isUndefined(myTask.aSource)) return;

        // moveTask
        if (!_.isUndefined(myTask.aMove))
        {
            var result = pCreep.moveTo(myTask.aMove,{ignoreCreeps: true});
            logDERP('MINER '+myTask.aCreep.name+' moves to source ['+myTask.aSource.pos.x+' '+myTask.aSource.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aTransfer.aTarget))
        {
            var aTransferAmount = _.min([myTask.aTransfer.aAmount,myTask.aCreep.carry.energy]);
            var result = myTask.aCreep.transfer(myTask.aTransfer.aTarget,RESOURCE_ENERGY,aTransferAmount);
            //logDERP(' carry = '+_.sum(myTask.aCreep.carry)+' target amount = '+myTask.aTransfer.aAmount+' transfer amount = '+aTransferAmount);
            logDERP('MINER '+myTask.aCreep.name+' transfers ['+aTransferAmount+'] to ['+myTask.aTransfer.aTarget.pos.x+' '+myTask.aTransfer.aTarget.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aWithdraw.aTarget))
        {
            //logDERP('>>>>>> '+ (myTask.aCreep.carryCapacity-myTask.aCreep.carry.energy));
            var aWithdrawAmount = _.min([myTask.aWithdraw.aAmount,myTask.aCreep.carryCapacity-myTask.aCreep.carry.energy]);
            var result = myTask.aCreep.withdraw(myTask.aWithdraw.aTarget,RESOURCE_ENERGY,aWithdrawAmount);
            //logDERP(' carry = '+_.sum(myTask.aCreep.carry)+' target amount = '+myTask.aWithdraw.aAmount+' withdraw amount = '+aWithdrawAmount);
            logDERP('MINER '+myTask.aCreep.name+' withdraws ['+aWithdrawAmount+'] from ['+myTask.aWithdraw.aTarget.pos.x+' '+myTask.aWithdraw.aTarget.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aPickup.aTarget))
        {
            var aPickupAmount = _.min([ myTask.aPickup.aAmount , myTask.aCreep.carry.energyCapacity - myTask.aCreep.carry.energy ]);
            var result = myTask.aCreep.pickup(myTask.aPickup.aTarget,aPickupAmount);
            //logDERP(' carry = '+_.sum(myTask.aCreep.carry)+' target amount = '+myTask.aPickup.aAmount+' withdraw amount = '+aPickupAmount);
            logDERP('MINER '+myTask.aCreep.name+' pickup ['+aPickupAmount+'] from ['+myTask.aPickup.aTarget.pos.x+' '+myTask.aPickup.aTarget.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aDrop.aType))
        {
            var result = myTask.aCreep.drop(myTask.aDrop.aType,myTask.aDrop.aAmount);
            //logDERP(' carry = '+_.sum(myTask.aCreep.carry));
            logDERP('MINER '+myTask.aCreep.name+' drops  ['+myTask.aDrop.aType+' = '+myTask.aDrop.aAmount+'] .. '+ErrorSting(result));
        }


        if (!_.isUndefined(myTask.aHarvest))
        {
            var result = myTask.aCreep.harvest(myTask.aHarvest);
            logDERP('MINER '+myTask.aCreep.name+' harvests source ['+myTask.aSource.pos.x+' '+myTask.aSource.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aBuild))
        {
            var result = pCreep.build(myTask.aBuild);
            logDERP('MINER '+myTask.aCreep.name+' builds ['+myTask.aBuild.pos.x+' '+myTask.aBuild.pos.y+'] .. '+ErrorSting(result));
        }


        //logDERP(' -------------------------- MINER ----------------------');
    }

    assignBuildTarget(pTask)
    {
        if (pTask.aCreep.pos.isNearTo(pTask.aSource))
        {
            var myRoomConstructionSites = pTask.aRoom.getRoomObjects(ROOM_OBJECT_TYPE.constructionSite);
            var mySites = _.filter(myRoomConstructionSites, (a) =>
            {
                return pTask.aCreep.pos.inRangeTo(a,3);
            })
            if (mySites.length == 0) return pTask;

            var hasBox = pTask.aSource.hasMiningBox;
            if (hasBox)
            {
                var aBox = pTask.aSource.myMiningBoxes[0];

                if (_.sum(aBox.store) > 1000)
                {
                    pTask.aBuild = mySites[0];
                }
            }
            else
            {
                pTask.aBuild = mySites[0];
            }
        }
        return pTask;
    }


    assignDropTarget(pTask)
    {
        if (_.isUndefined(pTask.aPickup.aTarget)) return pTask;

        var aBox = undefined;
        if (!pTask.aSource.hasMiningBox) return pTask;
        aBox = pTask.aSource.myMiningBoxes[0];

        if (!aBox.pos.isEqualTo(pTask.aCreep)) return pTask;

        // TODO: thisneeds ajustment to other resources than energy
        pTask.aDrop.aAmount = pTask.aCreep.carry.energy;
        pTask.aDrop.aType = RESOURCE_ENERGY;
        return pTask;
    }

    assignWithdrawTarget(pTask)
    {
        if (_.isUndefined(pTask.aTransfer.aTarget)) return pTask;
        if (_.isUndefined(pTask.aSource)) return pTask;
        if (!_.isUndefined(pTask.aPickup.aTarget)) return pTask;


        if (pTask.aSource.hasMiningBox)
        {

            var aBox = pTask.aSource.myMiningBoxes[0];
            //logDERP('---- box ----- '+JSON.stringify(aBox.store));
            if (aBox.store[RESOURCE_ENERGY] > 0)
            {
                //logDERP(' box = '+aBox.store[RESOURCE_ENERGY]+' id: '+aBox.id);
                pTask.aWithdraw.aTarget = aBox;
                pTask.aWithdraw.aAmount = aBox.store[RESOURCE_ENERGY];
            }
            else
            {
                //logDEBUG('MINER '+pTask.aCreep.name+' box at ['+aBox.x+' '+aBox.y+'] is full - stopped harvesting!');
            }
        }
        else if (!_.isUndefined(pTask.aRoom.storage) && pTask.aCreep.pos.isNearTo(pTask.aRoom.storage))
        {
            // Storage is cloase an can be withdraw target
            var aStorage = pTask.aRoom.storage;
            //logDERP('---- withdraw storage ----- '+JSON.stringify(aStorage.store));
            if (aStorage.store[RESOURCE_ENERGY] > 0)
            {
                //logDERP(' box = '+aBox.store[RESOURCE_ENERGY]+' id: '+aBox.id);
                pTask.aWithdraw.aTarget = aStorage;
                pTask.aWithdraw.aAmount = aStorage.store[RESOURCE_ENERGY];
            }
            else
            {
                //logDEBUG('MINER '+pTask.aCreep.name+' box at ['+aBox.x+' '+aBox.y+'] is full - stopped harvesting!');
            }

        }
        else
        {
            // TODO: drop mining - test this
        }


        return pTask;
    }


    assignTransferTarget(pTask)
    {
        //if (!_.isUndefined(pTask.aPickup.aTarget)) return pTask;
        if (_.isUndefined(pTask.aSource)) return pTask;
        if (pTask.aCreep.getActiveBodyparts(CARRY) == 0 ) return pTask;


        pTask = this.checkSpawnTransferTarget(pTask);

        if (_.isUndefined(pTask.aTransfer.aTarget))
        {
            pTask = this.checkLinkTransferTarget(pTask);
            if (_.isUndefined(pTask.aTransfer.aTarget))
            {
                pTask = this.checkStorageTransferTarget(pTask);
            }

        }
        return pTask;
    }

    checkStorageTransferTarget(pTask)
    {
        var aStorage = pTask.aRoom.storage;
        if (_.isUndefined(aStorage)) return pTask;
        if (!pTask.aCreep.pos.isNearTo(aStorage)) return pTask;

        var aDelta = aStorage.storeCapacity - _.sum(aStorage.store);

        pTask.aTransfer.aTarget = aStorage;
        pTask.aTransfer.aAmount = _.min([pTask.aCreep.carry.energy,aDelta]);

        //logDERP('---- storage -----');
        return pTask;
    }


    checkLinkTransferTarget(pTask)
    {
        if (pTask.aRoom.energyAvailable < 500) return pTask;

        var myRoomLinks = pTask.aRoom.getRoomObjects(ROOM_OBJECT_TYPE.link);
        if (myRoomLinks.length == 0 ) return pTask;

        var myLinks = _.filter(myRoomLinks, (a) => { return pTask.aCreep.pos.isNearTo(a)});
        if (myLinks.length == 0) return pTask;

        var aLink = myLinks[0];
        if (!aLink.isEnergyNeeded()) return pTask;

        pTask.aTransfer.aTarget = aLink;
        pTask.aTransfer.aAmount = aLink.energyCapacity - aLink.energy;
        //logDERP('---- link -----');
        return pTask;
    }
    checkSpawnTransferTarget(pTask)
    {
        if (!pTask.aSource.isCloseToSpawn) return pTask;
        var aSpawn = pTask.aSource.mySpawn[0];
        if (!aSpawn.isEnergyNeeded()) return pTask;

        pTask.aTransfer.aTarget = aSpawn;
        pTask.aTransfer.aAmount = aSpawn.getEnergyNeeded();
        //logDERP('---- spawn -----');
        return pTask;
    }

    assignPickupTarget(pTask)
    {
        if (_.isUndefined(pTask.aCreep)) return pTask;
        if (_.isUndefined(pTask.aRoom)) return pTask;

        var myRoomResources = pTask.aRoom.getRoomObjects(ROOM_OBJECT_TYPE.resource);
        var myResources = _.filter(myRoomResources, (aRes) =>
        {
            return pTask.aCreep.pos.getRangeTo(aRes) < 2;
        });
        if (myResources.length == 0 ) return pTask;

        _.forEach(myResources, (aRes) =>
        {
            // pickup the resource with the least amount (highly probable that these are rare drops)
            if (_.isUndefined(pTask.aPickup.aTarget) || pTask.aPickup.aAmount > aRes.amount)
            {
                pTask.aPickup.aTarget = aRes;
                pTask.aPickup.aAmount = aRes.amount;
            }
        });
        return pTask;
    }

    assignHarvestTarget(pTask)
    {
        if (_.isUndefined(pTask.aSource)) return pTask;
        if (_.isUndefined(pTask.aCreep)) return pTask;
        if (!_.isUndefined(pTask.aMove)) return pTask;

        if (pTask.aSource.hasMiningBox)
        {
            var aBox = pTask.aSource.myMiningBoxes[0];
            if (aBox.getDeltaCapacity() >= (pTask.aCreep.getActiveBodyparts(WORK)*HARVEST_POWER))
            {
                pTask.aHarvest = pTask.aSource;
            }
            else
            {
                logDEBUG('MINER '+pTask.aCreep.name+' box at ['+aBox.x+' '+aBox.y+'] is full - stopped harvesting!');
            }
        }
        else
        {
            // TODO: drop mining - test this
            pTask.aHarvest = pTask.aSource;
        }
        return pTask;
    }

    assignMoveTarget(pTask)
    {
        if (_.isUndefined(pTask.aSource)) return pTask;
        if (_.isUndefined(pTask.aCreep)) return pTask;

        if (!pTask.aCreep.pos.isNearTo(pTask.aSource))
        {
            if (pTask.aSource.hasMiningBox)
            {
                pTask.aMove = pTask.aSource.myMiningBoxes[0];
            }
            else
            {
                pTask.aMove = pTask.aSource;
            }
        }
        return pTask;
    }

    assignMiningSource(pTask)
    {
        var myRoomSources = pTask.aRoom.getRoomObjects(ROOM_OBJECT_TYPE.source);
        var aSource = undefined;
        for (var bSource of myRoomSources)
        {
            if (!bSource.hasMiner)
            {
                bSource.registerMiner(pTask.aCreep);
                aSource = bSource;
                break;
            }
        }
        pTask.aSource = aSource;
        return pTask;
    }
}
module.exports = MinerRole;
