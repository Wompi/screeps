class LoadingOperation extends Operation
{
    constructor(pCenterPos)
    {
        super('LoadingOperation');
        this.mCenter = pCenterPos;
        this.mCreep = undefined;
        this.mBay = {};
        this.mTasks = [];


        this.initBay();

        this.mStorage = _.find(this.mBay[ENTITY_TYPES.storage]);
        this.mLink = _.find(this.mBay[ENTITY_TYPES.link]);
        this.mTerminal = _.find(this.mBay[ENTITY_TYPES.terminal]);
        this.mContainer = _.find(this.mBay[ENTITY_TYPES.container]);
        this.mExtensions = _.map(this.mBay[ENTITY_TYPES.extension]);
        this.mSpawn = _.find(this.mBay[ENTITY_TYPES.spawn]);
        this.mTower = _.find(this.mBay[ENTITY_TYPES.tower]);
        this.mMineral = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.mineral), (aMin) => aMin.pos.roomName == this.mCenter.roomName);

        this.mResources = PCache.getFriendlyEntityCache(ENTITY_TYPES.resource);
        this.mConstructionSites = _.map(this.mBay[ENTITY_TYPES.constructionSite]);
        this.mWalls = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.constructedWall), (aWall) => aWall.pos.inRangeTo(this.mCenter,3) && aWall.hits < DEFAULT_WALL_HITS);
        this.mRamparts = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.rampart), (aWall) => aWall.pos.inRangeTo(this.mCenter,3));

        this.mLabs = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.lab), (aLab) => aLab.pos.isNearTo(this.mCenter));

    }

    processOperation()
    {
        this.log(LOG_LEVEL.error,'processOperation() '+this.mCenter.toString())

        var aCount = {}
        _.each(this.mBay,(aValue,aKey) => aCount[aKey] = _.size(aValue));
        this.log(LOG_LEVEL.debug,JS(aCount)+' walls: '+this.mWalls.length);


        this.spawnLoader();

        if (_.isUndefined(this.mCreep) || this.mCreep.spawning) return;

        let aRoom = PCache.getFriendlyEntityCacheByID(Game.rooms[this.mCenter.roomName].id);
        //let aRoom = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.room),(aR) => aR.name == this.mCenter.roomName);

        let aCreepLook = aRoom.lookForAtArea(LOOK_CREEPS,
            this.mCenter.y - 2,
            this.mCenter.x - 2,
            this.mCenter.y + 2,
            this.mCenter.x + 2,
            true);
        //this.log(LOG_LEVEL.debug,JS(aCreepLook))

        _.each(aCreepLook, (a) =>
        {
            if (a.creep.name != this.mCreep.name)
            {
                _.set(this.mBay,[ENTITY_TYPES.creep,a.creep.name],Game.creeps[a.creep.name]);
            }
        })
        this.mVisitors = _.find(this.mBay[ENTITY_TYPES.creep], (a) => a.memory.role == CREEP_ROLE.reactionHauler);


        this.makeTasks();
        this.doLoading();
    }

    doLoading()
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



        if (!this.mCreep.pos.isNearTo(this.mCenter))
        {
            let res = this.mCreep.travelTo({pos: this.mCenter});
            return;
        }

        let aDirection = this.mCreep.pos.getDirectionTo(this.mCenter);

        let myDirections =
        {
            undefined: () => false,            // center
            [TOP_LEFT]: () => false,          // bottom right
            [TOP_RIGHT]: () => false,         // bottom left
            [BOTTOM_LEFT]: () => false,       // top right
            [BOTTOM_RIGHT]: () => false,       // top left
        }

        let aTask = this.mTasks.shift();
        if (_.isUndefined(aTask))
        {

        }
        else
        {

            if (!this.mCreep.pos.isNearTo(aTask.target))
            {
                if (_.isUndefined(aDirection))
                {
                    this.mCreep.move(aTask.direction);
                }
                else
                {
                    this.mCreep.move(aDirection);
                }
            }
            else if (!this.mCreep.pos.isNearTo(aTask.destination))
            {
                if (_.isUndefined(aDirection))
                {
                    this.mCreep.move(aTask.direction);
                }
                else
                {
                    this.mCreep.move(aDirection);
                }
            }

            this.log(LOG_LEVEL.debug,'DIRECTION: '+JS(aDirection));

            if (this.mResources.length > 0)
            {
                var aResource = _.find(this.mResources, (aDrop) => aDrop.pos.isNearTo(this.mCreep));
                if (!_.isUndefined(aResource))
                {
                    let res = this.mCreep.pickup(aResource.entity);
                    //Log(undefined,'RESOURCE:'+ErrorString(res));
                }
            }

            if (_.sum(this.mCreep.carry) == 0)
            {
                let res = this.mCreep.withdraw(aTask.target,aTask.resource);

                this.log(LOG_LEVEL.debug,' withdraw - '+ErrorString(res));
            }
            else
            {
                if (aTask.task == 'C' || aTask.task == 'W')
                {
                    let aType = _.findKey(this.mCreep.carry);
                    if (aType != aTask.resource)
                    {
                        if (!_.isUndefined(this.aTerminal))
                        {
                            let res = this.mCreep.transfer(this.mTerminal.entity,aType);
                        }
                        else if (!_.isUndefined(this.mStorage))
                        {
                            let res = this.mCreep.transfer(this.mStorage.entity,aType);
                        }
                        else
                        {
                            let res = this.mCreep.transfer(this.mContainer.entity,aType);
                        }
                    }

                    if (aTask.task == 'C')
                    {
                        let res = this.mCreep.build(aTask.destination);
                        this.log(LOG_LEVEL.debug,' build - '+ErrorString(res));
                    }
                    else if (aTask.task == 'W')
                    {
                        let res = this.mCreep.repair(aTask.destination);
                        this.log(LOG_LEVEL.debug,' repair - '+ErrorString(res));
                    }
                }
                else
                {
                    let aType = _.findKey(this.mCreep.carry);
                    if (aType != aTask.resource)
                    {
                        if (!_.isUndefined(this.mStorage))
                        {
                            let res = this.mCreep.transfer(this.mStorage.entity,aType);
                        }
                        else
                        {
                            let res = this.mCreep.transfer(this.mContainer.entity,aType);
                        }
                    }
                    else
                    {
                        let res = this.mCreep.transfer(aTask.destination,aType);
                        this.log(LOG_LEVEL.debug,' transfer - '+ErrorString(res));
                    }

                }
            }
        }


        let myFortress = this.mRamparts.concat(this.mWalls);

        if (myFortress.length > 0 && this.mCreep.getActiveBodyparts(WORK) > 0 && (_.isUndefined(aTask) || aTask.task != 'L'))
        {
            let aTarget = undefined;
            if (!_.isUndefined(this.mStorage))
            {
                aTarget = this.mStorage;
            }
            else if (!_.isUndefined(this.mContainer))
            {
                aTarget = this.mContainer;
            }
            if (_.sum(this.mCreep.carry) == 0)
            {
                if (_.isUndefined(aTask) || aTask.task != 'F')
                {
                    let res = this.mCreep.withdraw(aTarget.entity,RESOURCE_ENERGY);
                }
            }

            let aJob = _.min(myFortress, (aW) => aW.hits);
            aJob.room.visual.circle(aJob.pos.x,aJob.pos.y,{fill: COLOR.red});
            if (aJob.pos.inRangeTo(this.mCreep,3) && (_.isUndefined(aTask) || aTask.task != 'C'))
            {
                let res = this.mCreep.repair(aJob.entity);
            }

            if (!_.isUndefined(this.mVisitors))
            {
                this.mCreep.move(TOP_LEFT);
            }
            else if (_.isUndefined(aTask))
            {
                this.mCreep.move(aDirection);
            }
        }
        else
        {
            if (_.isUndefined(aTask))
            {
                this.log(LOG_LEVEL.debug,'has no task and is idle');
                if (!_.isUndefined(aDirection)) this.mCreep.move(aDirection);
                else
                {
                    this.mCreep.move(TOP_LEFT);
                }
                //return;
            }
        }
    }

    makeTasks()
    {
        if (!_.isUndefined(this.mLink) && !_.isUndefined(this.mStorage))
        {
            let aStatus = this.mLink.getStatus();
            if (aStatus.status != FILL_STATUS.isEmpty)
            {
                let aDir = this.mCenter.getDirectionTo(this.mLink.pos);
                this.mTasks.push(
                {
                    priority: 0,
                    target: this.mLink.entity,
                    destination: this.mStorage.entity,
                    task: 'L',  // link cleaning
                    resource: RESOURCE_ENERGY,
                    direction: (aDir % 2 + aDir),
                });
            }
        }


        if (!_.isUndefined(this.mLink) && !_.isUndefined(this.mContainer) &&  (_.sum(this.mContainer.store)+ this.mCreep.carry[RESOURCE_ENERGY]) < (this.mContainer.storeCapacity))
        {
            let aStatus = this.mLink.getStatus();
            if (aStatus.status != FILL_STATUS.isEmpty)
            {
                let aDir = this.mCenter.getDirectionTo(this.mLink.pos);
                this.mTasks.push(
                {
                    priority: 0,
                    target: this.mLink.entity,
                    destination: this.mContainer.entity,
                    task: 'L',  // link cleaning
                    resource: RESOURCE_ENERGY,
                    direction: (aDir % 2 + aDir),
                });
            }
        }


        if (this.mLabs.length > 0)
        {
            _.each(this.mLabs, (aL) =>
            {
                if (aL.mineralType == 'LH')
                {
                    let aTarget = undefined;
                    if (!_.isUndefined(this.mStorage))
                    {
                        aTarget = this.mStorage;
                    }
                    else if (!_.isUndefined(this.mContainer))
                    {
                        aTarget = this.mContainer;
                    }
                    if (!_.isUndefined(aTarget) && aL.energy < 300)
                    {
                        let aDir = this.mCenter.getDirectionTo(aL);
                        this.mTasks.push(
                        {
                            priority: 1,
                            target: aTarget.entity,
                            destination: aL.entity,
                            task: 'F',  // fill extension
                            resource: RESOURCE_ENERGY,
                            direction: (aDir % 2 + aDir),
                        });
                    }
                }
            })
        }


        let aTarget = undefined;
        if (!_.isUndefined(this.mStorage))
        {
            aTarget = this.mStorage;
        }
        else if (!_.isUndefined(this.mContainer))
        {
            aTarget = this.mContainer;
        }

        if (!_.isUndefined(aTarget) && !_.isUndefined(this.mTerminal) && !_.isUndefined(this.mStorage))
        {
            let aMineralStore = this.mTerminal.getMineralStore();
            if (!_.isUndefined(this.mMineral))
            {
                delete aMineralStore[this.mMineral.mineralType];
            }
            if (!_.isEmpty(aMineralStore))
            {
                let aDir = this.mCenter.getDirectionTo(this.mStorage);
                this.mTasks.push(
                {
                    priority: 1,
                    target: this.mTerminal.entity,
                    destination: this.mStorage.entity,
                    task: 'F',  // fill extension
                    resource: _.findKey(aMineralStore),
                    direction: (aDir % 2 + aDir),
                });
            }
        }


        if (!_.isUndefined(aTarget) && aTarget.store[RESOURCE_ENERGY] > 0)
        {
            if (!_.isUndefined(this.mSpawn))
            {
                let aStatus = this.mSpawn.getStatus();
                if (aStatus.status != FILL_STATUS.isFull && aTarget.store[RESOURCE_ENERGY] > 0)
                {
                    let aDir = this.mCenter.getDirectionTo(this.mSpawn);
                    this.mTasks.push(
                    {
                        priority: 0,
                        target: aTarget.entity,
                        destination: this.mSpawn.entity,
                        task: 'F',  // fill extension
                        resource: RESOURCE_ENERGY,
                        direction: (aDir % 2 + aDir),
                    });
                }
            }

            if (!_.isUndefined(this.mTower))
            {
                let aStatus = this.mTower.getStatus();
                if (aStatus.status != FILL_STATUS.isFull && aTarget.store[RESOURCE_ENERGY] > 0)
                {
                    let aDir = this.mCenter.getDirectionTo(this.mTower);
                    this.mTasks.push(
                    {
                        priority: 0,
                        target: aTarget.entity,
                        destination: this.mTower.entity,
                        task: 'F',  // fill extension
                        resource: RESOURCE_ENERGY,
                        direction: (aDir % 2 + aDir),
                    });
                }
            }

            // PRIO: 0.2 - 0.8
            let myTasks = [];
            _.each(this.mExtensions, (aExt) =>
            {
                let aStatus = aExt.getStatus();
                if (aStatus.status != FILL_STATUS.isFull && aTarget.store[RESOURCE_ENERGY] > 0)
                {
                    let aDir = this.mCenter.getDirectionTo(aExt);
                    myTasks.push(
                    {
                        priority: ((aDir % 2 + aDir) / 10),
                        target: aTarget.entity,
                        destination: aExt.entity,
                        task: 'F',  // fill extension
                        resource: RESOURCE_ENERGY,
                        direction: (aDir % 2 + aDir),
                    });
                }
            });
            this.log(LOG_LEVEL.debug,'EXTENSION TASKS: '+JS(_.map(myTasks,'direction')));
            this.mTasks = this.mTasks.concat(myTasks);




            if (this.mConstructionSites.length > 0 && this.mCreep.getActiveBodyparts(WORK) > 0)
            {
                let aSite = _.max(this.mConstructionSites,(aS) => aS.progress);
                let aDir = this.mCenter.getDirectionTo(aSite);
                this.mTasks.push(
                {
                    priority: 0.9,
                    target: aTarget.entity,
                    destination: aSite.entity,
                    task: 'C',  // fill extension
                    resource: RESOURCE_ENERGY,
                    direction: (aDir % 2 + aDir),
                });
            }


            if (!_.isUndefined(this.mTerminal) && !_.isUndefined(this.mStorage))
            {
                if (this.mTerminal.store[RESOURCE_ENERGY] < 50000 && this.mStorage.store[RESOURCE_ENERGY] > 50000)
                {
                    let aDir = this.mCenter.getDirectionTo(this.mTerminal);
                    this.mTasks.push(
                    {
                        priority: 1,
                        target: aTarget.entity,
                        destination: this.mTerminal.entity,
                        task: 'F',  // fill extension
                        resource: RESOURCE_ENERGY,
                        direction: (aDir % 2 + aDir),
                    });
                }


                if (!_.isUndefined(this.mMineral) )
                {

                    let aType = this.mMineral.mineralType;
                    if ((_.isUndefined(this.mTerminal.store[aType]) || this.mTerminal.store[aType] < 30000)
                            && !_.isUndefined(this.mStorage.store[aType]) && this.mStorage.store[aType] > 3000)
                    {
                        let aDir = this.mCenter.getDirectionTo(this.mTerminal);
                        this.mTasks.push(
                        {
                            priority: 1,
                            target: aTarget.entity,
                            destination: this.mTerminal.entity,
                            task: 'F',  // fill extension
                            resource: aType,
                            direction: (aDir % 2 + aDir),
                        });
                    }
                }
            }
        }

        this.mTasks = _.sortBy(this.mTasks,'priority');
    }

    spawnLoader()
    {
        var myCreeps = getCreepsForRole(CREEP_ROLE.bayLoader);
        var aCenterID = this.mCenter.id;
        this.mCreep = _.find(myCreeps, (aCreep) => aCreep.memory.target == aCenterID);

        if (!_.isUndefined(this.mCreep)) return;

        var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        {
            if (_.isUndefined(aCreepMem.target)) return false;
            if (!_.isUndefined(Game.creeps[aCreepName])) return false;
            return aCreepMem.target == aCenterID && aCreepMem.role == CREEP_ROLE.bayLoader;
        });

        let aBody = this.getBody();
        let mySpawns = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aS) =>
        {
            return  aS.room.energyAvailable >= aBody.aCost;
        })
        this.log(undefined,JS(mySpawns));
        if (mySpawns.length > 0)
        {
            // TODO: this is a bit meh - not sure what a good decission for the spawn is right now - maybe later
            // the distance to the labs or something - or the storage <- this it probably is
            let aSpawn = _.min(mySpawns, (aS) => aS.pos.wpos.getRangeTo(this.mCenter.wpos));

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
               let res = aSpawn.createCreep(aBody.body,aName,{role: CREEP_ROLE.bayLoader, target: aCenterID, spawn: aSpawn.pos.wpos.serialize()})
               this.log(LOG_LEVEL.info,'createCreep - '+ErrorString(res));
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
            name: CARRY,
            max: _.isUndefined(this.mBay[ENTITY_TYPES.storage]) ? 4 : 6,
        };
        var aBodyOptions =
        {
            hasRoads: true,
            moveBoost: '',
        };

        var aSpawn = _.max(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aS) => aS.room.energyCapacityAvailable);
        let aEnergy = aSpawn.room.energyCapacityAvailable;
        var hasSites = !_.isUndefined(this.mBay[ENTITY_TYPES.constructionSite]);
        var hasWalls = this.mWalls.length > 0 || _.filter(this.mRamparts, (aR) => aR.hits < DEFAULT_RAMPART_HITS).length > 0;
        var aBody =
        {
            [WORK]:
            {
                count: ((hasSites || hasWalls) && _.gte(aEnergy,300)) ? 2 : 0,
            }
        };
        var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);

        this.log(LOG_LEVEL.debug,'body: '+JS(aResult));
        return aResult;
    }


    initBay()
    {
        let pLookTypes = [LOOK_CONSTRUCTION_SITES,LOOK_STRUCTURES];
        let aRoom = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.room),(aR) => aR.name == this.mCenter.roomName);


        let aLook = aRoom.lookForAtArea(LOOK_STRUCTURES,
            this.mCenter.y - 2,
            this.mCenter.x - 2,
            this.mCenter.y + 2,
            this.mCenter.x + 2,
            true);
    //    this.log(LOG_LEVEL.debug,JS(aLook));

        _.each(aLook, (a) =>
        {
            let aType = a.structure.structureType;
            let aID = a.structure.id;
            let aProxy = PCache.getFriendlyEntityCacheByID(aID);
            if (!_.isUndefined(aProxy))
            {
                _.set(this.mBay,[aType,aID],aProxy);
            }
        })


        // TODO: the result for LOOK_CONSTRUCTION_SITES is completly different as from the normal looks so
        //       we need to do this here again
        let aDerpLook = aRoom.lookForAtArea(LOOK_CONSTRUCTION_SITES,
            this.mCenter.y - 3,
            this.mCenter.x - 3,
            this.mCenter.y + 3,
            this.mCenter.x + 3,
            true);
    //    this.log(LOG_LEVEL.debug,JS(aDerpLook));

        _.each(aDerpLook, (a) =>
        {
            let aType = ENTITY_TYPES.constructionSite;
            let aID = a.constructionSite.id;
            let aProxy = PCache.getFriendlyEntityCacheByID(aID);
            if (!_.isUndefined(aProxy))
            {
                _.set(this.mBay,[aType,aID],aProxy);
            }
        })
    }
}
module.exports = LoadingOperation;
