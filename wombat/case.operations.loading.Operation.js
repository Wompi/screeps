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
    }

    processOperation()
    {
        this.log(LOG_LEVEL.error,'processOperation()')

        var aCount = {}
        _.each(this.mBay,(aValue,aKey) => aCount[aKey] = _.size(aValue));
        this.log(LOG_LEVEL.debug,JS(aCount));

        // derp test
        // let a = [1,2,3,4,5,6,7,8];
        // _.each(a, (b) =>
        // {
        //     let c = ((b+1) % 2 + b) % 8;
        //     this.log(undefined,b+' '+c);
        // });



        this.spawnLoader();
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

        let res = this.mCreep.withdraw(aTask.target,aTask.resource);
        this.log(LOG_LEVEL.debug,' withdraw - '+ErrorString(res));
        res = this.mCreep.transfer(aTask.destination,aTask.resource);
        this.log(LOG_LEVEL.debug,' transfer - '+ErrorString(res));
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
        var aBody =
        {
            [WORK]:
            {
                count: _.isUndefined(this.mBay[ENTITY_TYPES.constructionSite]) ? 0 : 4,
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
            _.set(this.mBay,[aType,aID],PCache.getEntityProxyForType(aType,aID));
        })

        // TODO: the result for LOOK_CONSTRUCTION_SITES is completly different as from the normal looks so
        //       we need to do this here again
        let aDerpLook = aRoom.lookForAtArea(LOOK_CONSTRUCTION_SITES,
            this.mCenter.y - 2,
            this.mCenter.x - 2,
            this.mCenter.y + 2,
            this.mCenter.x + 2,
            true);
    //    this.log(LOG_LEVEL.debug,JS(aDerpLook));

        _.each(aDerpLook, (a) =>
        {
            let aType = ENTITY_TYPES.constructionSite;
            let aID = a.constructionSite.id;
            _.set(this.mBay,[aType,aID],PCache.getEntityProxyForType(aType,aID));
        })
    }



    log(pLevel,pMsg)
    {
        Log(pLevel,'LoadingOperation '+this.mCenter.toString()+': '+pMsg);
    }
}
module.exports = LoadingOperation;
