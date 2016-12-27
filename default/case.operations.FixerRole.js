class FixerRole
{
    constructor(pOperation)
    {
        this.mOperation = pOperation;
        this.mCreep = undefined;
        this.mMove = undefined;
        this.mWithdraw = undefined;
        this.mRepair = undefined;
        this.mMoveParams = { ignoreCreeps: true, range: 1};
    }

    processRole(pCreep)
    {
        logDERP('Fixer Operations: processRole() - '+pCreep.name);

        this.mCreep = pCreep;

        this.checkCreepState();
        this.setWithdrawTarget();
        this.setRepairTarget();


        this.processRepair();
        this.processMove();
        this.processWithdraw();
    }

    checkCreepState()
    {
        // if (this.mCreep.ticksToLive < 200)
        // {
        //     // check for nearest spawn for repair
        // }
        //
        // var aSpawn = undefined;
        // if (this.mCreep.pos.isNearTo(aSpawn.pos) && (this.mCreep.getLiveRenewTicks() > 0))
        // {
        //     // when close to a spawn - wait for repair (only if spawn is not spawning)
        // }
        //
        // if (this.mCreep.pos.inRangeTo(aSpawn,3))
        // {
        //     // when near a spawn consider free moving - to prevent clogging
        //     this.mMoveParams.ignore = false;
        // }
    }

    setRepairTarget()
    {
        this.mRepair = this.findRepairObject(this.mCreep);
    }

    setWithdrawTarget()
    {
        if (this.mCreep.carry.energy == 0)
        {
            this.mWithdraw = this.findClosestEnergySupply(this.mCreep);
            //logDERP('Closest BOX: '+JSON.stringify(aBox.structureType) +' pos = '+JSON.stringify(aBox.pos));
        }

        // TODO: consider a more advanced handling here
        // - if near a box withdraw even when not empty
        // - save the last postion where you had energy and return to this position - otherwise it could be
        //   that some areas are not covered because the creep moves on to the next target 
    }


    // --------------------------------- PROCESS TASKS ----------------------------------------------------------
    processWithdraw()
    {
        if (!_.isUndefined(this.mWithdraw))
        {
            var result = this.mCreep.withdraw(this.mWithdraw,RESOURCE_ENERGY);
            logDEBUG('FIXER: grabs resources from closest box ['+this.mWithdraw.structureType+'] ['+this.mWithdraw.pos.x+' '+this.mWithdraw.pos.y+']'+ErrorSting(result));
        }
    }

    processMove()
    {
        if (!_.isUndefined(this.mMove))
        {
            var result = this.mCreep.moveTo(this.mMove,this.mMoveParams);
            logDEBUG('FIXER needs repair and moves to spawn ... '+ErrorSting(result));
        }
    }

    processRepair()
    {
        if (!_.isUndefined(this.mRepair))
        {
            var result = this.mCreep.repair(this.mRepair.repairStructure);
            logDEBUG('FIXER repairs structure at ['+this.mRepair.emergency+']['+this.mRepair.repairStructure.pos.x+' '+this.mRepair.repairStructure.pos.y+'] - '+this.mRepair.repairStructure.structureType+' .. '+ErrorSting(result));
        }
    }

    // --------------------------------- HELPER ----------------------------------------------------------
    findRepairObject(pCreep)
    {
        var aRoom = pCreep.room;
        var result = undefined;
        var aArea =
        {
            top:        _.max([(pCreep.pos.y-3), 0] ),
            left:       _.max([(pCreep.pos.x-3), 0] ),
            bottom:     _.min([(pCreep.pos.y+3),49] ),
            right:      _.min([(pCreep.pos.x+3),49] ),
        };
        var hasEmergency = false;
        var myStructuresInRange = aRoom.lookForAtArea(LOOK_STRUCTURES,aArea.top,aArea.left,aArea.bottom,aArea.right,true);
        if (myStructuresInRange.length == 0) return undefined;

        var myFixables = _.filter(myStructuresInRange,(a) =>
        {
            //return (a.structure.hitsMax - a.structure.hits) >= (REPAIR_POWER * pCreep.getActiveBodyparts(WORK));
            return (a.structure.hitsMax - a.structure.hits) >= (REPAIR_POWER);
        });
        if (myFixables.length == 0) return undefined;
        var aFix = _.min(myFixables, (a) =>
        {
            return a.structure.hits * 100 / a.structure.hitsMax;
        })
        result = Game.getObjectById(aFix.structure.id);
        return {
                    repairStructure: result,
                    emergency: ((_.isNull(result)) ? false : ((result.hits * 100 / result.hitsMax) < 80)),
                };
    }


    findClosestEnergySupply(pCreep)
    {
        var myRooms = this.mOperation.mNode.getNodeRooms();

        var myEnergySupplys = [];
        _.forEach(myRooms, (aRoom) =>
        {
            var myRoomContainers  = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.container);
            var myRoomSpawns  = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.spawn);
            var myRoomLinks  = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.link);
            var myRoomTowers  = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.tower);

            var myContainers = _.filter(myRoomContainers, (aBox) => { return aBox.store[RESOURCE_ENERGY] > 0 });
            var myLinks = _.filter(myRoomLinks, (aLink) => { return aLink.energy > 0 });
            var myTowers = _.filter(myRoomTowers, (aTower) => { return aTower.energy > 0 });
            var mySpawns = _.filter(myRoomSpawns, (aSpawn) => { return aSpawn.energy > 0 });

            myEnergySupplys = myEnergySupplys.concat(myContainers);
            myEnergySupplys = myEnergySupplys.concat(myLinks);
            myEnergySupplys = myEnergySupplys.concat(myTowers);
            myEnergySupplys = myEnergySupplys.concat(mySpawns);

            if (!_.isUndefined(aRoom.storage) && aRoom.storage.store[RESOURCE_ENERGY] > 0)
            {
                myEnergySupplys.push(aRoom.storage);
            }

            if (!_.isUndefined(aRoom.terminal) && aRoom.terminal.store[RESOURCE_ENERGY] > 0)
            {
                myEnergySupplys.push(aRoom.terminal);
            }
        });
        return _.min(myEnergySupplys, (aBox) => { return pCreep.pos.getRangeTo(aBox)});
    }
}
module.exports = FixerRole;
