class RemoteMiningFixer
{
    constructor(pOperation)
    {
        this.mOperation = pOperation;
    }

    processRetreat(pRoomName)
    {

    }


    // a fixer for the roads and containers
    process(pRoomName)
    {
        var myCreep = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == 'remote fixer '+pRoomName})

        if (!this.mOperation.isSecure)
        {
            this.retreat(myCreep);
            return;
        }

        var aSpawn = Game.spawns['Nexuspool'];
        if (_.isUndefined(myCreep))
        {
            // 2200 = A * 75
            var aWork = 1;
            var aCarry = 1
            var aMove = 1;

            var aW = new Array(aWork).fill(WORK);
            var aC = new Array(aCarry).fill(CARRY);
            var aM = new Array(aMove).fill(MOVE);
            var aBody = aW.concat(aC).concat(aM);

            var aCost = aWork * 100 + aCarry * 50 + aMove * 50;


            var aMem =
            {
                role: 'remote fixer '+pRoomName,
                target: this.getFixerGraph()[0],
            };
            //var result = 0;
            var result = aSpawn.createCreep(aBody,'RF '+pRoomName,aMem);
            logDERP('C(remote fixer):('+aSpawn.name+') '+aCost+' aWork = '+aWork+' aCarry = '+aCarry+' aMove = '+aMove+' result = '+ErrorSting(result));
            return;
        }
        else
        {
            logDERP('remote fixer '+pRoomName+' active ......');
        }
        if (myCreep.spawning) return;

        // emergency maintenance
        if (myCreep.ticksToLive < 100)
        {
//            myCreep.moveTo(aSpawn);
            myCreep.travelTo(aSpawn);
            return;
        }
        if (myCreep.pos.isNearTo(aSpawn) && myCreep.getLiveRenewTicks() > 0)
        {
            return;
        }

        if (myCreep.carry[RESOURCE_ENERGY] == 0)
        {
            var aStorage = Game.rooms['E65N49'].storage;
            if (!myCreep.pos.isNearTo(aStorage))
            {
//                myCreep.moveTo(aStorage);
                myCreep.travelTo(aStorage);
            }
            else
            {
                myCreep.withdraw(aStorage,RESOURCE_ENERGY);
            }
        }
        else
        {
            var myTarget = myCreep.memory.target;
            if (myCreep.pos.isEqualTo(myTarget.x,myTarget.y))
            {
                var roomGraph = this.getFixerGraph();
                myCreep.memory.target = roomGraph[myCreep.memory.target.next];
                logDEBUG('FIXER adjusts target position ..');
            }

            if (myCreep.room.name == this.mOperation.mRoomName)
            {
                var myRepair = this.findRepairObject(myCreep,myCreep.room);
                if (!_.isUndefined(myRepair))
                {
                    var result = myCreep.repair(myRepair.repairStructure);
                    logDEBUG('FIXER repairs structure at ['+myRepair.emergency+']['+myRepair.repairStructure.pos.x+' '+myRepair.repairStructure.pos.y+'] - '+myRepair.repairStructure.structureType+' .. '+ErrorSting(result));
                }
            }

            //var result = myCreep.moveTo(new RoomPosition(myTarget.x,myTarget.y,this.mOperation.mRoomName),{ ignoreCreeps: true});
            var aPos = new RoomPosition(myTarget.x,myTarget.y,this.mOperation.mRoomName);
            var result = myCreep.travelTo({pos:aPos});
            logDEBUG('FIXER moves to target position ['+myTarget.x+' '+myTarget.y+']... '+ErrorSting(result));
        }
    }

    retreat(pCreep)
    {
        if (_.isUndefined(pCreep)) return;

        var aPos = new RoomPosition(25,44,'E65N49');
        pCreep.moveTo(aPos);
        //pCreep.travelTo(aPos);
    }

    getFixerGraph()
    {
        return  [
                    { x:  9, y: 11, next: 1 },
                    { x: 26, y:  4, next: 2 },
                    { x: 33, y: 16, next: 3 },
                    { x: 40, y: 41, next: 4 },
                    { x: 28, y:  1, next: 0 },
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
module.exports = RemoteMiningFixer;
