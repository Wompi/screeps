class FixerOperation
{
    constructor()
    {
        this.mCreep = undefined;
    }

    processOperation()
    {
        this.log(LOG_LEVEL.error,'processOperation()');
        this.spawnFixer();
        this.doFixing();
    }

    doFixing()
    {
        if (_.isUndefined(this.mCreep) || this.mCreep.spawning) return;

        if (!this.getOpportunityEnergy(this.mCreep)) return;

        var myTarget = this.mCreep.memory.target;
        if (this.mCreep.pos.isEqualTo(myTarget.x,myTarget.y))
        {
            var roomGraph = this.getNodes();
            this.mCreep.memory.target = roomGraph[this.mCreep.memory.target.next];
            this.log(LOG_LEVEL.debig,'FIXER adjusts target position '+JS(this.mCreep.memory.target));
        }

        var myRepair = this.findRepairObject(this.mCreep,this.mCreep.room);
        if (!_.isUndefined(myRepair))
        {
            var result = this.mCreep.repair(myRepair.repairStructure);
            this.log(LOG_LEVEL.debug,'FIXER repairs structure at ['+myRepair.emergency+']['+myRepair.repairStructure.pos.x+' '+myRepair.repairStructure.pos.y+'] - '+myRepair.repairStructure.structureType+' .. '+ErrorString(result));
        }

        var aPos = new RoomPosition(myTarget.x,myTarget.y,myTarget.roomName);
        var res = this.mCreep.travelTo({pos:aPos});
        this.log(LOG_LEVEL.debug,'FIXER moves to target position ['+myTarget.x+' '+myTarget.y+' '+myTarget.roomName+']... '+ErrorString(res));

    }

    getOpportunityEnergy(pCreep)
    {
        let aStorage = _.min(PCache.getEntityCache(ENTITY_TYPES.storage), (aStorage) => aStorage.pos.getRangeTo(pCreep));
        if (pCreep.carry[RESOURCE_ENERGY] == 0 || pCreep.pos.isNearTo(aStorage))
        {

            if (!pCreep.pos.isNearTo(aStorage))
            {
                let res = pCreep.travelTo(aStorage);
                return false;
            }

            let res = pCreep.withdraw(aStorage.entity,RESOURCE_ENERGY);

        }

        let aContainer = _.find(PCache.getEntityCache(ENTITY_TYPES.container),(aBox) => aBox.pos.isNearTo(pCreep))
        if (!_.isUndefined(aContainer))
        {
            let res = pCreep.withdraw(aContainer.entity,RESOURCE_ENERGY);
        }
        return true;
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
            if (a.structure.structureType == STRUCTURE_WALL && a.structure.hits > DEFAULT_WALL_HITS) return false;
            if (a.structure.structureType == STRUCTURE_RAMPART && a.structure.hits > DEFAULT_RAMPART_HITS) return false;
            return (a.structure.hitsMax - a.structure.hits) >= (REPAIR_POWER * pCreep.getActiveBodyparts(WORK));
            //return (a.structure.hitsMax - a.structure.hits) >= (REPAIR_POWER);
        });
        if (myFixables.length == 0) return undefined;
        var aFix = _.min(myFixables, (a) =>
        {
            return a.structure.hits * 100 / a.structure.hitsMax;
        })
        result = PCache.getEntityProxyForType(aFix.structure.structureType,aFix.structure.id);
        if (_.isUndefined(result))
        {
            return undefined;
        }

        return {
                    repairStructure: result.entity,
                    emergency: ((_.isNull(result)) ? false : ((result.hits * 100 / result.hitsMax) < 80)),
                };
    }

    spawnFixer()
    {
        var myCreeps = getCreepsForRole(CREEP_ROLE.fixer);
        this.mCreep = _.find(myCreeps); // TODO: this will not work with multiple fixers
        if (!_.isUndefined(this.mCreep)) return;


        var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        {
            if (_.isUndefined(aCreepMem.target)) return false;
            if (!_.isUndefined(Game.creeps[aCreepName])) return false;
            return aCreepMem.role == CREEP_ROLE.fixer;
        });

        var aTarget = this.getNodes()[0];
        if (!_.isUndefined(aName))
        {
            aTarget = Memory.creeps[aName].target;
        }

        this.log(LOG_LEVEL.debug,'reuse name: '+aName+' target: '+JS(aTarget));

        var aSpawn = _.min(PCache.getEntityCache(ENTITY_TYPES.spawn), (aProxy) =>
        {
            if (!aProxy.my) return Infinity;
            return aProxy.pos.getRangeTo(new RoomPosition(aTarget.x,aTarget.y,aTarget.roomName));
        });

        this.log(LOG_LEVEL.debug,'possible spawn - '+aSpawn.name);

        var aCreepBody = new CreepBody();

        // TODO: the cary parts should be adjusted to the current task - so if the task is heavy un/loading
        //       to the terminal/storage it should have more parts otherwise just normal 1
        //
        var aSearch =
        {
            name: WORK,
            max: 5,
        };
        var aBodyOptions =
        {
            hasRoads: true,
            moveBoost: '',
        };

        var aEnergy = aSpawn.room.energyCapacityAvailable;
        var aBody =
        {
            [CARRY]:
            {
                count: 1,
            }
        };
        var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);

        this.log(LOG_LEVEL.debug,'body: '+JS(aResult));

        if (aResult.aCost <=  aSpawn.room.energyAvailable)
        {
            let res = aSpawn.createCreep(aResult.body,aName,{role: CREEP_ROLE.fixer, target: aTarget})
            this.log(LOG_LEVEL.info,'fixer createCreep - '+ErrorString(res));
        }

    }

    getNodes()
    {
        return  [
                    {   x: 35,   y: 28, roomName:"W67S74", next:  1, },
                    {   x: 40,   y: 28, roomName:"W67S74", next:  2, },
                    {   x: 37,   y: 34, roomName:"W67S74", next:  3, },
                    {   x: 29,   y: 29, roomName:"W67S74", next:  4, },
                    {   x: 33,   y: 25, roomName:"W67S74", next:  5, },
                    {   x: 19,   y: 17, roomName:"W67S74", next:  6, },
                    {   x:  7,   y: 19, roomName:"W67S74", next:  0, },
                ];
    }

    log(pLevel,pMsg)
    {
        Log(pLevel,'FixerOperation: '+pMsg);
    }

}
module.exports = FixerOperation;
