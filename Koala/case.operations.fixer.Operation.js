class FixerOperation extends Operation
{
    constructor()
    {
        super('FixerOperation');
        this.mCreep = undefined;
        this.mResources = PCache.getFriendlyEntityCache(ENTITY_TYPES.resource);
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


        if (!_.any(this.mCreep.body, i => !!i.boost))
        {
            let aPartCount = this.mCreep.getActiveBodyparts(WORK);
            let aLab = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.lab), (aL) =>
            {
                // this.log(undefined,'D1');
                if (!aL.pos.isNearTo(this.mCreep)) return false;
                // this.log(undefined,'D2');
                if (_.isUndefined(aL.mineralType)) return false;
                // this.log(undefined,'D3');
                if (aL.mineralType != 'LH') return false;
                // this.log(undefined,'D4');

                if (aL.energy < (aPartCount * 20)) return false;
                // this.log(undefined,'D5');

                if (aL.mineralAmount < (aPartCount * 30 )) return false;
                // this.log(undefined,'D6');
                return true;
            })
            if (!_.isUndefined(aLab))
            {
                let res = aLab.boostCreep(this.mCreep);
                // this.log(undefined,'DERP: '+ErrorString(res));
            }
        }















        if (this.mResources.length > 0)
        {
            var aResource = _.find(this.mResources, (aDrop) => aDrop.pos.isNearTo(this.mCreep));
            if (!_.isUndefined(aResource))
            {
                let res = this.mCreep.pickup(aResource.entity);
                //Log(undefined,'RESOURCE:'+ErrorString(res));
            }
        }

        if (!this.getOpportunityEnergy(this.mCreep)) return;

        var myTarget = this.mCreep.memory.target;
        if (this.mCreep.pos.isEqualTo(myTarget.x,myTarget.y))
        {
            var roomGraph = this.getNodes();
            this.mCreep.memory.target = roomGraph[this.mCreep.memory.target.next];
            this.log(LOG_LEVEL.debig,'FIXER adjusts target position '+JS(this.mCreep.memory.target));
        }

        var myRepair = undefined;
        Pro.profile( () =>
        {
            myRepair = this.findRepairObject(this.mCreep,this.mCreep.room);
        },'roads old find');

        if (!_.isUndefined(myRepair) && myRepair.emergency)
        {
            this.mCreep.say('Oh boy!');

            this.moveToEmergencyRepairPosition(this.mCreep,myRepair.repairStructure);
            var result = this.mCreep.repair(myRepair.repairStructure);
            this.log(LOG_LEVEL.debug,'FIXER repairs emergency structure at ['+myRepair.emergency+'] '+myRepair.repairStructure.pos.toString()+' - '+myRepair.repairStructure.structureType+' .. '+ErrorString(result));
        }
        else if (!_.isUndefined(myRepair))
        {
            var result = this.mCreep.repair(myRepair.repairStructure);
            this.log(LOG_LEVEL.debug,'FIXER repairs structure at ['+myRepair.emergency+']['+myRepair.repairStructure.pos.x+' '+myRepair.repairStructure.pos.y+'] - '+myRepair.repairStructure.structureType+' .. '+ErrorString(result));

        }

        if ( _.isUndefined(myRepair) || !myRepair.emergency)
        {
            var aPos = new RoomPosition(myTarget.x,myTarget.y,myTarget.roomName);
            var res = this.mCreep.travelTo({pos:aPos});
            this.log(LOG_LEVEL.debug,'FIXER moves to target position ['+myTarget.x+' '+myTarget.y+' '+myTarget.roomName+']... '+ErrorString(res));
        }
    }

    getOpportunityEnergy(pCreep)
    {
        let myStorages = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.storage), (aStorage) => aStorage.store[RESOURCE_ENERGY] > 0);
        let myContainers = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.container),(aBox) => aBox.store[RESOURCE_ENERGY] > 100)

        let myGrabs = myStorages.concat(myContainers);
        let aGrab = _.min(myGrabs, (aG) => aG.pos.getRangeTo(pCreep));

        if (pCreep.carry[RESOURCE_ENERGY] == 0 || pCreep.pos.isNearTo(aGrab))
        {

            if (!pCreep.pos.isNearTo(aGrab))
            {
                let res = pCreep.travelTo(aGrab);
                return false;
            }

            let res = pCreep.withdraw(aGrab.entity,RESOURCE_ENERGY);

        }
        return true;
    }


    moveToEmergencyRepairPosition(pCreep, pRepairTarget)
    {
        let aRoad = _.find(pCreep.pos.look(), (a) =>
        {
            return (_.get(a,['structure','structureType']) == STRUCTURE_ROAD)
        });
        if (_.isUndefined(aRoad)) return;

        let myControllerPos = pRepairTarget.pos.adjacentPositions(2)
        this.log(LOG_LEVEL.debug,JS(myControllerPos));

        let aArea = pCreep.pos.adjacentPositions(2);
        let myPos = [];
        _.each(aArea, (a,x) =>
        {
            _.each(a, (ia,y) =>
            {
                if (!_.isUndefined(myControllerPos[x]) && !_.isUndefined(myControllerPos[x][y]))
                {
                    let aPos = new RoomPosition(x,y,pCreep.pos.roomName);
                    let aLook = _.find(_.map(aPos.look(),'type'), (a) => a == 'structure' || a == 'creep');
                    if (_.isUndefined(aLook))
                    {
                        myPos.push(aPos);
                        //this.log(LOG_LEVEL.debug,'LOOK: '+JS(aPos));
                    }
                }
            });
        });
        //this.log(LOG_LEVEL.debug,'hit: '+JS(myPos));

        let aPos = undefined;
        if (myPos.length > 0)
        {
            aPos = _.min(myPos, (a) => pRepairTarget.pos.getRangeTo(a));
            if (!pCreep.pos.isEqualTo(aPos))
            {
                let res = pCreep.moveTo(aPos,{range: 0, reusePath: 0});
                this.log(LOG_LEVEL.info,'move from road '+pCreep.name+' '+aPos.toString()+' '+ErrorString(res));
            }
        }
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
            if (a.structure.structureType == STRUCTURE_WALL /*&& a.structure.hits > DEFAULT_WALL_HITS*/) return false;
            if (a.structure.structureType == STRUCTURE_RAMPART /*&& a.structure.hits > DEFAULT_RAMPART_HITS*/) return false;
            return (a.structure.hitsMax - a.structure.hits) >= (REPAIR_POWER * pCreep.getActiveBodyparts(WORK));
            //return (a.structure.hitsMax - a.structure.hits) >= (REPAIR_POWER);
        });
        if (myFixables.length == 0) return undefined;
        var aFix = _.min(myFixables, (a) =>
        {
            return a.structure.hits * 100 / a.structure.hitsMax;
        })
        result = PCache.getFriendlyEntityCacheByID(aFix.structure.id);
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

        let aBody = this.getBody();
        let mySpawns = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aS) =>
        {
            return  aS.room.energyAvailable >= aBody.aCost;
        })

        if (mySpawns.length > 0)
        {
            // TODO: this is a bit meh - not sure what a good decission for the spawn is right now - maybe later
            // the distance to the labs or something - or the storage <- this it probably is
            let aPos = new RoomPosition(aTarget.x,aTarget.y,aTarget.roomName);
            let aSpawn = _.min(mySpawns, (aS) => aS.pos.wpos.getRangeTo(aPos.wpos));

            if (!_.isUndefined(aSpawn))
            {
                if (aSpawn.spawning)
                {
                    this.log(LOG_LEVEL.debug,'possible spawn is bussy - '+aSpawn.name+' '+aSpawn.pos.toString());
                    return;
                }
                this.log(LOG_LEVEL.debug,'possible spawn - '+aSpawn.name+' '+aSpawn.pos.toString());
                this.log(LOG_LEVEL.debug,'possible name - '+aName);

                // TODO: consider a path approach here
                let res = aSpawn.createCreep(aBody.body,aName,{role: CREEP_ROLE.fixer, target: aTarget, spawn: aSpawn.pos.wpos.serialize()})
                this.log(LOG_LEVEL.info,'fixer createCreep - '+ErrorString(res));
            }
        }
        else
        {
            this.log(LOG_LEVEL.debug,'no spawn room has enough energy - needed: '+aBody.aCost);
        }
    }

    getBody()
    {
        var aCreepBody = new CreepBody();

        // TODO: the cary parts should be adjusted to the current task - so if the task is heavy un/loading
        //       to the terminal/storage it should have more parts otherwise just normal 1
        //
        var aSearch =
        {
            name: WORK,
            max: 4,
        };
        var aBodyOptions =
        {
            hasRoads: true,
            moveBoost: '',
        };

        var aSpawn = _.max(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aS) => aS.room.energyCapacityAvailable);
        let aEnergy = aSpawn.room.energyCapacityAvailable;
        var aBody =
        {
            [CARRY]:
            {
                count: 4,
            }
        };
        var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);

        this.log(LOG_LEVEL.debug,'body: '+JS(aResult));
        return aResult;

    }

    getNodes()
    {
        let i = 1;
        return  [
                    {   x: 42,   y: 32, roomName:"W47N84", next:  i++, },
                    {   x: 41,   y: 48, roomName:"W47N84", next:  i++, },


                    {   x: 43,   y:  1, roomName:"W47N83", next:  i++, },
                    {   x: 48,   y:  6, roomName:"W47N83", next:  i++, },

                    {   x:  1,   y:  8, roomName:"W46N83", next:  i++, },
                    {   x: 32,   y: 31, roomName:"W46N83", next:  i++, },
                    {   x:  1,   y:  8, roomName:"W46N83", next:  i++, },

                    {   x: 48,   y:  6, roomName:"W47N83", next:  i++, },
                    {   x: 43,   y:  1, roomName:"W47N83", next:  i++, },


                    {   x: 23,   y: 41, roomName:"W47N84", next:  i++, },
                    {   x: 24,   y: 48, roomName:"W47N84", next:  i++, },

                    {   x: 22,   y:  1, roomName:"W47N83", next:  i++, },
                    {   x: 24,   y: 34, roomName:"W47N83", next:  i++, },
                    {   x: 25,   y: 21, roomName:"W47N83", next:  i++, },
                    {   x: 19,   y: 14, roomName:"W47N83", next:  i++, },
                    {   x:  7,   y: 26, roomName:"W47N83", next:  i++, },
                    {   x: 22,   y:  1, roomName:"W47N83", next:  i++, },

                    {   x: 16,   y:  3, roomName:"W47N84", next:  i++, },
                    {   x:  1,   y: 38, roomName:"W47N84", next:  i++, },

                    {   x: 48,   y: 36, roomName:"W48N84", next:  i++, },
                    {   x: 40,   y: 48, roomName:"W48N84", next:  i++, },
                    {   x:  4,   y: 38, roomName:"W48N84", next:  i++, },
                    {   x: 22,   y: 32, roomName:"W48N84", next:  i++, },
                    {   x: 17,   y: 10, roomName:"W48N84", next:  i++, },
                    {   x: 48,   y: 36, roomName:"W48N84", next:  i++, },

                    {   x: 22,   y: 34, roomName:"W47N84", next:  0, },

                ];
    }
}
module.exports = FixerOperation;
