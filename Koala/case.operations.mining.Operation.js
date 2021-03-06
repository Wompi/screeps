class MiningOperation extends Operation
{
    constructor(pSource)
    {
        super('MiningOperation');
        this.mSource = pSource;
        this.mTasks = [];
        this.mCreep = undefined;
        this.mHauler = undefined;
        this.mResources = PCache.getFriendlyEntityCache(ENTITY_TYPES.resource);
        this.mTowers = PCache.getFriendlyEntityCache(ENTITY_TYPES.tower);

        let myStorages =  _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.storage), (aS) => aS.store[RESOURCE_ENERGY] < 500000);
        this.mStorage = undefined;
        if (myStorages.length > 0)
        {
            this.mStorage = _.min(myStorages, (aS) => aS.pos.wpos.getRangeTo(this.mSource.pos.wpos));
        }

        //this.mStorage =  _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.storage), (aS) => _.sum(aS.store) < aS.storeCapacity);


        // TODO: super iffy - change this ASAP
        /// we need a drop point
        /// lets drop it near the uprade
        this.aDropPos = new RoomPosition(41,34,'W47N84');
//        this.aDropPos = new RoomPosition(18,11,'W48N84');
        // let a = _.find(this.mResources, (aR) => aR.energy > 2000 && aR.pos.isEqualTo(this.aDropPos));
        // if (!_.isUndefined(a))
        // {
        //     this.aDropPos = new RoomPosition(13,33,this.aDropPos.roomName);
        // }
    }


    processOperation()
    {
        Log(LOG_LEVEL.error,'MiningOperation '+this.mSource.pos.toString()+': processOperation() type: '+this.mSource.getSourceType().type);
        this.spawnHauler();
        this.spawnMiner();
        this.makeTasks();

        Pro.register( () =>
        {
            this.doMining();
        },'MiningOperation doMining');

        Pro.register( () =>
        {
            this.doHauling();
        },'MiningOperation doHauling');
    }

    doHauling()
    {
        if (_.isUndefined(this.mHauler) || this.mHauler.spawning) return;

        var aBox = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.container), (aB) => aB.pos.isNearTo(this.mSource));

        if (_.isUndefined(aBox))
        {
            this.log(LOG_LEVEL.error,'hauler '+this.mHauler.name+' has no box near the source '+this.mSource.pos.toString());
            return;
        }

        if (this.mResources.length > 0 && this.aDropPos.getRangeTo(this.mHauler) > 2)
        {
            var aResource = _.find(this.mResources, (aDrop) => aDrop.pos.isNearTo(this.mHauler));
            if (!_.isUndefined(aResource))
            {
                let res = this.mHauler.pickup(aResource.entity);
                //Log(undefined,'RESOURCE:'+ErrorString(res));
            }
        }

        if (_.sum(this.mHauler.carry) == 0)
        {
            if (_.isUndefined(this.mCreep) || !this.mCreep.pos.isEqualTo(aBox.pos))
            {
                //if (this.mHauler.pos.inRangeTo(aBox,3))
                {
                    this.moveHaulerToIdlePosition(aBox);
                }
                return;
            }

            if (!this.mHauler.pos.isNearTo(aBox))
            {
                let res = this.mHauler.travelTo(aBox, {plainCost: 5});
                this.log(LOG_LEVEL.debug,' hauler '+this.mHauler.name+' move to box '+ErrorString(res));
            }
            else
            {
                let res = this.mHauler.withdraw(aBox.entity,_.findKey(aBox.store));
                this.log(LOG_LEVEL.debug,' hauler '+this.mHauler.name+' grab from box '+ErrorString(res));
            }
        }
        else
        {
            let aTower = _.find(this.mTowers,(aT) =>
            {
                if ( aT.pos.roomName != this.mHauler.pos.roomName ) return false;
                if (aT.energy == aT.energyCapacity) return false;
                let myBays = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.flag),FLAG_TYPE.extensionBay);
                let aBay = _.find(myBays, (aB) => aB.pos.isNearTo(aT.pos));
                if (!_.isUndefined(aBay)) return false;
                return true;
            });
            if (!_.isUndefined(aTower))
            {
                if (!this.mHauler.pos.isNearTo(aTower))
                {
                    let res = this.mHauler.travelTo(aTower.entity,{plainCost: 5});
                }
                else
                {
                    let res = this.mHauler.transfer(aTower.entity,RESOURCE_ENERGY);
                    this.log(LOG_LEVEL.debug,'hauler '+this.mHauler.name+' transfer tower '+aTower.pos.toString());
                }
            }
            else
            {
                // TODO: if the room has no storage - raise the loading cap for the bays
                // maybe this should be a property of the room - later
                let hasStorage =  !_.isUndefined(_.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.storage), (aS) => aS.pos.roomName == this.mHauler.pos.roomName));
                let myBays = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.flag),FLAG_TYPE.extensionBay);
                let myDropBoxes = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.container), (aB) =>
                {
                    let aExtractor = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.extractor), (aE) => !_.isUndefined(aE.miningBox) && aE.miningBox.pos.isEqualTo(aB.pos));
                    if (!_.isUndefined(aExtractor)) return false;
                    let aMultiplier = hasStorage ? 0.30 : 0.8;
                    let aBay = _.find(myBays,(aS) => aS.pos.isEqualTo(aB) && _.sum(aB.store) < aB.storeCapacity*aMultiplier);
                    return !_.isUndefined(aBay);
                });
                let aDropBox = undefined;
                if (myDropBoxes.length > 0)
                {
                    aDropBox = _.min(myDropBoxes,(aB) => aB.pos.getRangeTo(this.mHauler));
                }




                // TODO: this is a bit tricky and should be changed
                // the hauler has to go through the extension room so this will work here - change it when
                // the hauler have to go all over the place
                if (!_.isUndefined(aDropBox) && this.mHauler.pos.roomName == aDropBox.pos.roomName)
                {
                    if (!this.mHauler.pos.isNearTo(aDropBox))
                    {
                        let res = this.mHauler.travelTo({pos: aDropBox.pos},{range: 1, plainCost: 5});
                        this.log(LOG_LEVEL.debug,' hauler '+this.mHauler.name+' move to dropbox '+ErrorString(res));
                    }
                    else
                    {
                        let res = this.mHauler.transfer(aDropBox.entity,_.findKey(this.mHauler.carry));
                        this.log(LOG_LEVEL.debug,' hauler '+this.mHauler.name+' transfer to dropBox '+ErrorString(res));
                    }

                }
                else
                {
                    if (!_.isUndefined(this.mStorage))
                    {
                        if (!this.mHauler.pos.isNearTo(this.mStorage))
                        {
                            let res = this.mHauler.travelTo({pos: this.mStorage.pos},{range: 1, plainCost: 5});
                            this.log(LOG_LEVEL.debug,' hauler '+this.mHauler.name+' move to storage '+this.mStorage.pos.toString()+' res: '+ErrorString(res));
                        }
                        else
                        {
                            let res = this.mHauler.transfer(this.mStorage .entity,_.findKey(this.mHauler.carry));
                            this.log(LOG_LEVEL.debug,' hauler '+this.mHauler.name+' transfers to storage '+this.mStorage.pos.toString()+' res: '+ErrorString(res));
                        }
                    }
                    else
                    {
                        if (!this.mHauler.pos.isEqualTo(this.aDropPos))
                        {
                            let res = this.mHauler.travelTo({pos: this.aDropPos},{range: 0, plainCost: 5});
                            this.log(LOG_LEVEL.debug,' hauler '+this.mHauler.name+' move to droppos '+ErrorString(res));
                        }
                        else
                        {
                            let res = this.mHauler.drop(_.findKey(this.mHauler.carry));
                            this.log(LOG_LEVEL.debug,' hauler '+this.mHauler.name+' drop to droppos '+ErrorString(res));
                        }
                    }
                }
            }
        }
    }

    doMining()
    {
        if (_.isUndefined(this.mCreep) || this.mCreep.spawning) return;


        if (!this.mCreep.pos.isNearTo(this.mSource))
        {
            let aType = this.mSource.getSourceType();
            if (aType.type == SOURCE_TYPE.box)
            {
                this.mCreep.travelTo(aType.target, {range: 0});
            }
            else
            {
                this.mCreep.travelTo(this.mSource);
            }
        }
        else
        {
            if (this.mResources.length > 0)
            {
                var aResource = _.find(this.mResources, (aDrop) => aDrop.pos.isNearTo(this.mCreep));
                if (!_.isUndefined(aResource))
                {
                    let res = this.mCreep.pickup(aResource.entity);
                    //Log(undefined,'RESOURCE:'+ErrorString(res));
                }
            }

            let aSourceType = this.mSource.getSourceType();
            if (
                    aSourceType.type == SOURCE_TYPE.drop
                    ||
                    (
                        aSourceType.type == SOURCE_TYPE.link
                        &&
                        (aSourceType.target.energy < aSourceType.target.energyCapacity)
                    )
                    ||
                    (
                        aSourceType.type == SOURCE_TYPE.box
                        &&
                        aSourceType.target.store[RESOURCE_ENERGY] < aSourceType.target.storeCapacity
                    )
                )
            {
                let res = this.mCreep.harvest(this.mSource.entity);
            }
            else if (this.mSource.hasBox() && this.mCreep.getActiveBodyparts(CARRY) > 0)
            {
                if (aSourceType.target.hits < aSourceType.target.hitsMax)
                {
                    this.mCreep.withdraw(aSourceType.target.entity, RESOURCE_ENERGY);
                    let res = this.mCreep.repair(aSourceType.target.entity);
                    this.log(LOG_LEVEL.debug,this.mCreep.name+' repair local box '+aSourceType.target.pos.toString()+' res: '+ErrorString(res));
                }
            }

            if (!_.isUndefined(aSourceType.target))
            {
                if (aSourceType.type == SOURCE_TYPE.link && this.mCreep.getActiveBodyparts(CARRY) > 0)
                {
                    if (!this.mCreep.pos.isNearTo(aSourceType.target))
                    {
                        let res = this.mCreep.travelTo(aSourceType.target,
                            {
                                plainCost: 0, //2,
                                swampCost: 0, ///5,
                                maxOps: 20000,
                                roomCallback: function(roomName)
                                {
                                    let room = Game.rooms[roomName];
                                    // In this example `room` will always exist, but since PathFinder
                                    // supports searches which span multiple rooms you should be careful!
                                    if (!room) return;
                                    let costs = new PathFinder.CostMatrix;

                                    room.find(FIND_STRUCTURES).forEach(function(structure)
                                    {
                                        if (structure.structureType === STRUCTURE_ROAD)
                                        {
                                            // TODO: the miner creep had some trouble to reach the source when he was near the source and -
                                            // it toggled between positions because the road lead him to do this - so I try to set the roads to a higher value
                                            // and the creep will hopefully use the spot near the source that has no road
                                            costs.set(structure.pos.x, structure.pos.y, 100);
                                        }
                                        else if (structure.structureType !== STRUCTURE_CONTAINER && (structure.structureType !== STRUCTURE_RAMPART || !structure.my))
                                        {
                                            // Can't walk through non-walkable buildings
                                            costs.set(structure.pos.x, structure.pos.y, COSTMATRIX_BLOCK_VALUE);
                                        }
                                    });
                                    //Visualizer.visualizeCostMatrix(costs,room);
                                    return costs;
                                }

                            });
                    }
                }
                else if (aSourceType.type == SOURCE_TYPE.box || this.mSource.hasBox())
                {
                    if (!this.mCreep.pos.isEqualTo(aSourceType.target))
                    {
                        let res = this.mCreep.travelTo(aSourceType.target,{range: 0});
                    }
                }
                else
                {
                    this.log(LOG_LEVEL.error,'processTasks - undefined sourceType: '+aSourceType.type+' FIX THIS!');
                }

                let res = this.mCreep.transfer(aSourceType.target.entity,RESOURCE_ENERGY);
                if (res == ERR_FULL)
                {
                    let res = this.mCreep.cancelOrder('harvest');
                    this.log(LOG_LEVEL.error,'processTasks - '+aSourceType.type+' is full no harvest res: '+ErrorString(res));
                }
            }
        }

    }

    makeTasks()
    {
        this.mTasks.push(
        {
            priority: 0,
            target: this.mSource,
            task: 'H',
            role: CREEP_ROLE.miner,
        });
    }

    spawnMiner()
    {
        var myCreeps = getCreepsForRole(CREEP_ROLE.miner);
        var aSourceID = this.mSource.id;
        this.mCreep = _.find(myCreeps, (aCreep) => aCreep.memory.target == aSourceID);
        if (!_.isUndefined(this.mCreep)) return;

        var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        {
            if (_.isUndefined(aCreepMem.target)) return false;
            if (!_.isUndefined(Game.creeps[aCreepName])) return false;
            return aCreepMem.target == aSourceID && aCreepMem.role == CREEP_ROLE.miner;
        });


        let aBody = this.getMinerBody();
        let mySpawns = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aS) =>
        {
            return  !aS.spawning && aS.room.energyAvailable >= aBody.aCost;
        })

        if (mySpawns.length > 0)
        {
            // TODO: this is a bit meh - not sure what a good decission for the spawn is right now - maybe later
            // the distance to the labs or something - or the storage <- this it probably is
            let aSpawn = _.min(mySpawns, (aS) =>
            {
                return aS.pos.wpos.getRangeTo(this.mSource.pos.wpos)
            });

            this.log(undefined,JS(aSpawn));

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
                let res = aSpawn.createCreep(aBody.body,aName,{role: CREEP_ROLE.miner, target: aSourceID, spawn: aSpawn.pos.wpos.serialize()})
                this.log(LOG_LEVEL.info,'miner createCreep - '+ErrorString(res));
            }
        }
        else
        {
            this.log(LOG_LEVEL.debug,'no spawn room has enough energy - needed: '+aBody.aCost);
        }
    }

    getMinerBody()
    {
        var aCreepBody = new CreepBody();
        var aSearch =
        {
            name: WORK,
            max: (this.mSource.getNeededWorkParts() + 1),
        };
        var aBodyOptions =
        {
            hasRoads: true,
            moveBoost: '',
        };

        let aCarryCount = 0;
        let aController = PCache.getFriendlyEntityCacheByID(this.mSource.room.controller.id);
        if (this.mSource.getSourceType().type == SOURCE_TYPE.link)
        {
            aCarryCount = 1;
        }
        else if (aController.isReserved())
        {
            aCarryCount = 1;
        }

        var aSpawn = _.max(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aS) => aS.room.energyCapacityAvailable);
        let aEnergy = aSpawn.room.energyCapacityAvailable;
        var aBody =
        {
            [CARRY]:
            {
                count: aCarryCount,
            }
        };
        var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);
        return aResult;
    }

    spawnHauler()
    {
        var myCreeps = getCreepsForRole(CREEP_ROLE.miningHauler);
        var aSourceID = this.mSource.id;
        this.mHauler = _.find(myCreeps, (aCreep) => aCreep.memory.target == aSourceID);

        let aSourceType = this.mSource.getSourceType();
        // TODO: this is a bit ugly - the miner will not be spawned when the source has no box - aka drop/link
        // ther should be no reason to let the hauler still spawn when drop but for now it is not good
        if (!_.isUndefined(this.mHauler) || aSourceType.type != SOURCE_TYPE.box) return;

        var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        {
            if (_.isUndefined(aCreepMem.target)) return false;
            return aCreepMem.target == aSourceID && aCreepMem.role == CREEP_ROLE.miningHauler;
        });



        let aPathLen = 0;
        if (!_.isUndefined(this.mStorage))
        {
            let aPath = PMan.getCleanPath(this.mSource.pos,this.mStorage.pos,undefined);
            aPathLen = aPath.path.length;
        }
        else
        {
            let aPath = PMan.getCleanPath(this.mSource.pos,this.aDropPos,undefined);
            aPathLen = aPath.path.length;
        }


        let aBody = this.getHaulerBody(aPathLen);
        let mySpawns = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aS) =>
        {
            return  aS.room.energyAvailable >= aBody.aCost;
        })

        if (mySpawns.length > 0)
        {
            // TODO: this is a bit meh - not sure what a good decission for the spawn is right now - maybe later
            // the distance to the labs or something - or the storage <- this it probably is
            let aSpawn = _.min(mySpawns, (aS) => aS.pos.wpos.getRangeTo(this.mSource.pos.wpos));

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
                let res = aSpawn.createCreep(aBody.body,aName,{role: CREEP_ROLE.miningHauler, target: aSourceID, pathLen: aPathLen, spawn: aSpawn.pos.wpos.serialize()})
                this.log(LOG_LEVEL.info,'hauler createCreep - '+ErrorString(res));
            }
        }
        else
        {
            this.log(LOG_LEVEL.debug,'no spawn room has enough energy - needed: '+aBody.aCost);
        }
    }

    getHaulerBody(aPathLen)
    {

        var aCreepBody = new CreepBody();
        var aSearch =
        {
            name: CARRY,
            max: aPathLen == 0 ? 16 : _.ceil((aPathLen * 2 * 10)/50),  // lets test this: 2 times len for travel back and forth times 10 for a normal source harvest
        };
        var aBodyOptions =
        {
            hasRoads: true,
            moveBoost: '',
        };

        var myCreeps = getCreepsForRole(CREEP_ROLE.miningHauler);
        var aSpawn = _.max(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aS) => aS.room.energyCapacityAvailable);
        let aEnergy = aSpawn.room.energyCapacityAvailable;

        // TODO: a rather nasty fallback when we hav not enough haulers - this should be related to the current miners
        // somehow - or something else
        if (myCreeps.length < 4)
        {
            aSpawn = _.max(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aS) => aS.room.energyAvailable);
            aEnergy = aSpawn.room.energyAvailable;
        }

        var aBody = {};
        var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);
        return aResult;
    }


    moveHaulerToIdlePosition(pBox)
    {
        let aArea = pBox.pos.adjacentPositions(2);
        let myPos = [];
        _.each(aArea, (a,x) =>
        {
            _.each(a, (ia,y) =>
            {
                let aPos = new RoomPosition(x,y,pBox.pos.roomName);
                let aLook = _.find(_.map(aPos.look(),'type'), (a) => a == 'structure');
                if (_.isUndefined(aLook))
                {
                    myPos.push(aPos);
                    //this.log(LOG_LEVEL.error,'LOOK: '+JS(aPos));
                }
            });
        });

        let aPos = _.min(myPos, (a) => this.mHauler.pos.getRangeTo(a));

        if (!this.mHauler.pos.isEqualTo(aPos))
        {
            let res = this.mHauler.travelTo({pos: aPos}, {range: 0, plainCost: 5});
            this.log(LOG_LEVEL.info,'hauler '+this.mHauler.name+' moves to idle pos '+ErrorString(res));
        }
    }
}
module.exports = MiningOperation;
