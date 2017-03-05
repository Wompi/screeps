class LoadingOperation
{
    constructor(pCenterPos)
    {
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
        this.mMineral = _.find(PCache.getEntityCache(ENTITY_TYPES.mineral), (aMin) => aMin.pos.roomName == this.mCenter.roomName);

        this.mResources = Game.rooms[this.mCenter.roomName].find(FIND_DROPPED_RESOURCES);
        this.mConstructionSites = _.map(this.mBay[ENTITY_TYPES.constructionSite]);
        this.mWalls = _.filter(PCache.getEntityCache(ENTITY_TYPES.constructedWall), (aWall) => aWall.pos.inRangeTo(this.mCenter,3) && aWall.hits < DEFAULT_WALL_HITS);
        this.mRamparts = _.filter(PCache.getEntityCache(ENTITY_TYPES.rampart), (aWall) => aWall.pos.inRangeTo(this.mCenter,3) && aWall.hits < DEFAULT_RAMPART_HITS);
    }


    processOperation()
    {
        this.log(LOG_LEVEL.error,'processOperation()')

        var aCount = {}
        _.each(this.mBay,(aValue,aKey) => aCount[aKey] = _.size(aValue));
        this.log(LOG_LEVEL.debug,JS(aCount)+' walls: '+this.mWalls.length);



        // derp test
        // let a = [1,2,3,4,5,6,7,8];
        // _.each(a, (b) =>
        // {
        //     let c = ((b+1) % 2 + b) % 8;
        //     this.log(undefined,b+' '+c);
        // });


        this.spawnLoader();

        if (_.isUndefined(this.mCreep) || this.mCreep.spawning) return;

        let aRoom = PCache.getEntityProxy(Game.rooms[this.mCenter.roomName]);

        let aCreepLook = aRoom.lookForAtArea(LOOK_CREEPS,
            this.mCenter.y - 2,
            this.mCenter.x - 2,
            this.mCenter.y + 2,
            this.mCenter.x + 2,
            true);
        this.log(LOG_LEVEL.debug,JS(aCreepLook))

        _.each(aCreepLook, (a) =>
        {
            if (a.creep.name != this.mCreep.name)
            {
                _.set(this.mBay,[ENTITY_TYPES.creep,a.creep.name],Game.creeps[a.creep.name]);
            }
        })
        this.mVisitors = _.find(this.mBay[ENTITY_TYPES.creep]);


        this.makeTasks();
        this.doLoading();
    }

    doLoading()
    {
        if (_.isUndefined(this.mCreep) || this.mCreep.spawning) return;

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
            this.log(LOG_LEVEL.debug,'has no task and is idle');
            if (!_.isUndefined(aDirection)) this.mCreep.move(aDirection);
            else
            {
                this.mCreep.move(TOP_LEFT);
            }
            return;
        }

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
                let res = this.mCreep.pickup(aResource);
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



        let aTarget = undefined;
        if (!_.isUndefined(this.mStorage))
        {
            aTarget = this.mStorage;
        }
        else if (!_.isUndefined(this.mContainer))
        {
            aTarget = this.mContainer;
        }

        if (!_.isUndefined(aTarget))
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


            if (this.mConstructionSites.length > 0)
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
                            && !_.isUndefined(this.mStorage.store[aType]) && this.mStorage.store[aType] > 0)
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

            if (this.mRamparts.length > 0 && _.isUndefined(this.mVisitors))
            {
                let aRampart = _.min(this.mRamparts, (aW) => aW.hits);

                // debug
                aRampart.room.visual.circle(aRampart.pos.x,aRampart.pos.y,{fill: COLOR.red});


                let aDir = this.mCenter.getDirectionTo(aRampart);
                this.mTasks.push(
                {
                    priority: 1.1,
                    target: aTarget.entity,
                    destination: aRampart.entity,
                    task: 'W',  // fill extension
                    resource: RESOURCE_ENERGY,
                    direction: (aDir % 2 + aDir),
                });
            }

            if (this.mWalls.length > 0 && _.isUndefined(this.mVisitors))
            {
                let aWall = _.min(this.mWalls, (aW) => aW.hits);

                // debug
                aWall.room.visual.circle(aWall.pos.x,aWall.pos.y,{fill: COLOR.red});


                let aDir = this.mCenter.getDirectionTo(aWall);
                this.mTasks.push(
                {
                    priority: 1.2,
                    target: aTarget.entity,
                    destination: aWall.entity,
                    task: 'W',  // fill extension
                    resource: RESOURCE_ENERGY,
                    direction: (aDir % 2 + aDir),
                });
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

        var aSpawn = _.min(PCache.getEntityCache(ENTITY_TYPES.spawn), (aProxy) =>
        {
            if (!aProxy.my) return Infinity;
            if (aProxy.pos.roomName != this.mCenter.roomName) return Infinity;
            return aProxy.pos.getRangeTo(this.mCenter);
        });

        this.log(LOG_LEVEL.debug,'possible spawn - '+aSpawn.name);

        var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        {
            if (_.isUndefined(aCreepMem.target)) return false;
            if (!_.isUndefined(Game.creeps[aCreepName])) return false;
            return aCreepMem.target == aCenterID && aCreepMem.role == CREEP_ROLE.bayLoader;
        });

        this.log(LOG_LEVEL.debug,'reuse name: '+aName);

        var aCreepBody = new CreepBody();

        // TODO: the cary parts should be adjusted to the current task - so if the task is heavy un/loading
        //       to the terminal/storage it should have more parts otherwise just normal 1
        //
        var aSearch =
        {
            name: CARRY,
            max: _.isUndefined(this.mBay[ENTITY_TYPES.storage]) ? 1 : 4,
        };
        var aBodyOptions =
        {
            hasRoads: true,
            moveBoost: '',
        };

        var aEnergy = aSpawn.room.energyCapacityAvailable;
        var hasSites = !_.isUndefined(this.mBay[ENTITY_TYPES.constructionSite]);
        var hasWalls = this.mWalls.length > 0;
        var aBody =
        {
            [WORK]:
            {
                count: (hasSites || hasWalls)  ? 4 : 1,
            }
        };
        var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);

        this.log(LOG_LEVEL.debug,'body: '+JS(aResult));
        if (aResult.aCost <=  aSpawn.room.energyAvailable)
        {
            let res = aSpawn.createCreep(aResult.body,aName,{role: CREEP_ROLE.bayLoader, target: aCenterID})
            this.log(LOG_LEVEL.info,'miner createCreep - '+ErrorString(res));
        }
    }

    initBay()
    {
        let pLookTypes = [LOOK_CONSTRUCTION_SITES,LOOK_STRUCTURES];
        let aRoom = PCache.getEntityProxy(Game.rooms[this.mCenter.roomName]);


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
            let aProxy = PCache.getEntityProxyForType(aType,aID);
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
            let aProxy = PCache.getEntityProxyForType(aType,aID);
            if (!_.isUndefined(aProxy))
            {
                _.set(this.mBay,[aType,aID],aProxy);
            }
        })
    }




    log(pLevel,pMsg)
    {
        Log(pLevel,'LoadingOperation '+this.mCenter.toString()+': '+pMsg);
    }
}
module.exports = LoadingOperation;
