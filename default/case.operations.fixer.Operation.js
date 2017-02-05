class FixerOperation
{
    constructor()
    {

    }

    processOperation()
    {
        var ROLE_NAME = 'fixer test';
        var aCreep = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == ROLE_NAME })

        var aSpawn = Game.spawns['Nexuspool'];

        if (_.isUndefined(aCreep))
        {
            // 2200 = A * 75
            var aWork = 2;
            var aCarry = 2
            var aMove = 2;

            var aW = new Array(aWork).fill(WORK);
            var aC = new Array(aCarry).fill(CARRY);
            var aM = new Array(aMove).fill(MOVE);
            var aBody = aW.concat(aC).concat(aM);

            var aCost = aWork * 100 + aCarry * 50 + aMove * 50;


            var aMem =
            {
                role: ROLE_NAME,
                target: this.getGraph()[0],
            };
            //var result = 0;
            var result = aSpawn.createCreep(aBody,'Fixer',aMem);
            logDERP('C(fixer):('+aSpawn.name+') '+aCost+' aWork = '+aWork+' aCarry = '+aCarry+' aMove = '+aMove+' result = '+ErrorSting(result));
            return;
        }
        else
        {
            logDERP('Fixer (multi room) active ......');
        }
        if (aCreep.spawning) return;

        if (aCreep.ticksToLive < 100)
        {
//            myCreep.moveTo(aSpawn);
            aCreep.travelTo(aSpawn);
            return;
        }
        if (aCreep.pos.isNearTo(aSpawn) && aCreep.getLiveRenewTicks() > 0)
        {
            return;
        }

        this.getOpportunityEnergy(aCreep);


    //     if (aCreep.carry[RESOURCE_ENERGY] == 0)
    //     {
    //         var aStorage = Game.rooms['E65N49'].storage;
    //         if (!aCreep.pos.isNearTo(aStorage))
    //         {
    // //                myCreep.moveTo(aStorage);
    //             aCreep.travelTo(aStorage);
    //         }
    //         else
    //         {
    //             aCreep.withdraw(aStorage,RESOURCE_ENERGY);
    //         }
    //     }
    //     else
        {
            var myTarget = aCreep.memory.target;
            if (aCreep.pos.isEqualTo(myTarget.x,myTarget.y))
            {
                var roomGraph = this.getGraph();
                aCreep.memory.target = roomGraph[aCreep.memory.target.next];
                logDEBUG('FIXER adjusts target position ..');
            }

            var myRepair = this.findRepairObject(aCreep,aCreep.room);
            if (!_.isUndefined(myRepair))
            {
                var result = aCreep.repair(myRepair.repairStructure);
                logDEBUG('FIXER repairs structure at ['+myRepair.emergency+']['+myRepair.repairStructure.pos.x+' '+myRepair.repairStructure.pos.y+'] - '+myRepair.repairStructure.structureType+' .. '+ErrorSting(result));
            }

            //var result = myCreep.moveTo(new RoomPosition(myTarget.x,myTarget.y,this.mOperation.mRoomName),{ ignoreCreeps: true});
            var aPos = new RoomPosition(myTarget.x,myTarget.y,myTarget.roomName);
            var result = aCreep.travelTo({pos:aPos});
            logDERP('FIXER moves to target position ['+myTarget.x+' '+myTarget.y+' '+myTarget.roomName+']... '+ErrorSting(result));
        }
    }

    getOpportunityEnergy(pCreep)
    {
        var aRoom = pCreep.room;

        var myResources = aRoom.find(FIND_DROPPED_RESOURCES);
        var aResource = _.find(myResources, (aDrop) =>
        {
            return (aDrop.resourceType == RESOURCE_ENERGY && aDrop.pos.getRangeTo(pCreep) < 2);
        });

        if (!_.isUndefined(aResource))
        {
            logDERP('Fixer - close to resource');
            pCreep.pickup(aResource);
            return;
        }
        else
        {
            logDERP('Fixer - not close to resource');
        }

        var myEnergySupplies = aRoom.find(FIND_STRUCTURES,
        {
            filter: (a) =>
            {

                return a.isEnergySupply && pCreep.pos.isNearTo(a) && a.energy > 0;
            }
        });
        var aEnergySupply = undefined;
        if (myEnergySupplies.length > 0)
        {
            aEnergySupply = _.max(myEnergySupplies, (a) =>
            {
                return a.energy;
            });
        }

        //logDERP(JSON.stringify(aEnergySupply))
        if (!_.isUndefined(aEnergySupply))
        {
            logDERP('Fixer - close to a energy source');
            pCreep.withdraw(aEnergySupply,RESOURCE_ENERGY);
            return;
        }
        else
        {
            logDERP('Fixer - not close to a energy source');
        }

    }



    getGraph()
    {
        return  [
                    {   x: 28,   y: 48, roomName:"E65N49", next:  1, },

                    {   x: 28,   y:  1, roomName:"E65N48", next:  2, },
                    {   x:  1,   y: 17, roomName:"E65N48", next:  3, },

                    {   x: 48,   y: 17, roomName:"E64N48", next:  4, },
                    {   x: 40,   y: 20, roomName:"E64N48", next:  5, },
                    {   x: 26,   y:  1, roomName:"E64N48", next:  6, },
                    {   x: 40,   y: 20, roomName:"E64N48", next:  7, },
                    {   x:  8,   y: 43, roomName:"E64N48", next:  8, },
                    {   x:  6,   y: 41, roomName:"E64N48", next:  9, },
                    {   x:  8,   y: 43, roomName:"E64N48", next: 10, },
                    {   x:  7,   y: 48, roomName:"E64N48", next: 11, },

                    {   x:  7,   y:  1, roomName:"E64N47", next: 12, },
                    {   x:  1,   y: 10, roomName:"E64N47", next: 13, },

                    {   x: 48,   y: 11, roomName:"E63N47", next:  14, },
                    {   x: 21,   y: 18, roomName:"E63N47", next:  15, },
                    {   x: 19,   y: 16, roomName:"E63N47", next:  16, },
                    {   x: 11,   y:  7, roomName:"E63N47", next:  17, },
                    {   x: 19,   y: 16, roomName:"E63N47", next:  18, },
                    {   x: 32,   y:  1, roomName:"E63N47", next:  19, },
                    {   x: 19,   y: 16, roomName:"E63N47", next:  20, },
                    {   x: 48,   y: 11, roomName:"E63N47", next:  21, },

                    {   x:  1,   y: 10, roomName:"E64N47", next:  22, },
                    {   x:  7,   y:  1, roomName:"E64N47", next:  23, },

                    {   x:  7,   y: 48, roomName:"E64N48", next:  24, },
                    {   x: 48,   y: 17, roomName:"E64N48", next:  25, },

                    {   x:  1,   y: 17, roomName:"E65N48", next:  26, },
                    {   x: 28,   y:  1, roomName:"E65N48", next:  27, },

                    {   x: 28,   y: 48, roomName:"E65N49", next:  0, },

                ];

    }

    findRepairObject(pCreep,pRoom)
    {
        var result = undefined;
        var aArea =
        {
            top:        _.max([(pCreep.pos.y-3), 0] ),
            left:       _.max([(pCreep.pos.x-3), 0] ),
            bottom:     _.min([(pCreep.pos.y+3),49] ),
            right:      _.min([(pCreep.pos.x+3),49] ),
        };
        var hasEmergency = false;
        var myStructuresInRange = pRoom.lookForAtArea(LOOK_STRUCTURES,aArea.top,aArea.left,aArea.bottom,aArea.right,true);
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
}
module.exports = FixerOperation
