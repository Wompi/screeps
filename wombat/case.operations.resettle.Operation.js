class ResettleOperation
{
    constructor()
    {
        this.mSpawn = _.find(Game.spawns);
        this.mRoom = this.mSpawn.room;
        this.mController = this.mRoom.controller;

        let mySources = _.filter(PCache.getEntityCache(ENTITY_TYPES.source), (aSource) => aSource.isMine);

        this.mSources = _.sortBy(mySources, (aSource) => this.mSpawn.pos.getRangeTo(aSource));

        // var mySourcePos = [];
        // _.each(this.mSources, (aSource) => mySourcePos = mySourcePos.concat(aSource.possibleMiningPositions));

        this.mSourcePoses = _.reduce(this.mSources, (res, aSource) =>
        {
            return _.reduce(aSource.possibleMiningPositions, (res,value,aX) =>
            {
                return _.reduce(value, (res,aCount,aY) =>
                {
                    res.push(new RoomPosition(aX,aY,this.mRoom.name));
                    return res;
                },res);
            },res);
        },[]);

        this.mExtensions =  _.filter(PCache.getEntityCache(ENTITY_TYPES.extension), (aExt) => aExt.energy < aExt.energyCapacity);
        this.mConstructions = _.filter(Game.constructionSites, (aSite) => aSite.room.name == this.mRoom.name);
        this.mResources = this.mRoom.find(FIND_DROPPED_RESOURCES);

        this.mContainers = PCache.getEntityCache(ENTITY_TYPES.container);
        this.mRoads = PCache.getEntityCache(ENTITY_TYPES.road);

        this.mTowers = PCache.getEntityCache(ENTITY_TYPES.tower);

        this.mStorage = _.find(PCache.getEntityCache(ENTITY_TYPES.storage), (aProxy) => aProxy.pos.roomName == this.mRoom.name);

        this.mTasks = [];
    }


    processOperation()
    {
        //Log(undefined,'Lets start ....');
        this.spawnFirst();
        this.makeTasks();
        this.goMining();
    }

    goMining()
    {
        _.each(Game.creeps, (aCreep) =>
        {
            if (!aCreep.spawning && aCreep.getActiveBodyparts(WORK) > 0 && _.isUndefined(aCreep.memory.role))
            {
                //Log(LOG_LEVEL.warn,'CREEP: '+aCreep.name);
                let isEmpty = aCreep.carry[RESOURCE_ENERGY] == 0;
                let isFull = aCreep.carry[RESOURCE_ENERGY] == aCreep.carryCapacity;
                let hasEnergy = aCreep.carry[RESOURCE_ENERGY] > 0;
                let isCloseToMine = !_.isUndefined(_.find(this.mSources, (aSource) => aSource.energy > 0 && aSource.pos.isNearTo(aCreep)));


                let aSay = aCreep.saying;

                let aTask = undefined;


                var aTarget = undefined;
                if ((isCloseToMine && !isFull) || isEmpty)
                {
                    this.mSourcePoses = _.sortBy(this.mSourcePoses, (aPos) => aPos.getRangeTo(aCreep));
                    aTarget = this.mSourcePoses.shift();
                    if (_.isUndefined(aTarget)) return;

                    let aLook = aTarget.lookFor(LOOK_CREEPS);
                    if (aLook.length > 0 && aLook[0].name != aCreep.name)
                    {
                        aTarget = this.mSourcePoses.shift();
                    }
                }
                else
                {
                    aTask = this.mTasks.shift();
                    if (_.isUndefined(aTask))
                    {
                        Log(LOG_LEVEL.error, 'No TASK!');
                        return;
                    }
                    if (!_.isUndefined(aTask))
                    {
                        aTarget = aTask.target;
                    }
                }

                if (!_.isUndefined(aTask)) aCreep.say(aTask.task);

                //when no task is left maybe go mining or something



                var res = aCreep.travelTo( _.isUndefined(aTarget.pos) ? {pos: aTarget} : aTarget,  _.isUndefined(aTarget.pos) ? {range: 0} : {} );
                //Log(undefined,'MOVE: '+ErrorString(res));


                var aBla = _.find(this.mSources, (aSource) => aSource.pos.isNearTo(aTarget));
                var res = undefined;
                if (!_.isUndefined(aBla))
                {
                    res = aCreep.harvest(aBla.entity);
                }

                if (res == OK)
                {
                    if (aCreep.pos.isEqualTo(aTarget)) aCreep.cancelOrder('move');
                    aCreep.say('H');
                }
                //Log(undefined,'HARVEST:'+ErrorString(res));

                var res = aCreep.transfer(aTarget,RESOURCE_ENERGY);
                //Log(undefined,'TRANSFER:'+ErrorString(res));

                var res = aCreep.upgradeController(aTarget);
                if (res == OK)
                {
                    aCreep.cancelOrder('move');
                }
                //Log(undefined,'UPGRADE: '+ErrorString(res));


                // opportunity tasks
                if (this.mResources.length > 0)
                {
                    var aResource = _.find(this.mResources, (aDrop) => aDrop.pos.isNearTo(aCreep));
                    if (!_.isUndefined(aResource))
                    {
                        let res = aCreep.pickup(aResource);
                        //Log(undefined,'RESOURCE:'+ErrorString(res));
                    }
                }
                //var hasBuildPower = isCloseToMine && (aCreep.carry[RESOURCE_ENERGY] >= (aCreep.getActiveBodyparts(WORK) * BUILD_POWER));
                if (!isCloseToMine && (_.isUndefined(aTask) || (aTask.task != 'S' && aTask.task != 'E') ))
                {
                    if (!_.isUndefined(aTask) && (aTask.task == 'T' || aTask.task == 'B') && aTarget.pos.inRangeTo(aCreep,3))
                    {
                        let res = aCreep.build(aTarget);
                        if (res == OK)
                        {
                            aCreep.cancelOrder('move');
                        }
                    }
                    else
                    {
                        var mySites = _.sortBy(_.filter(this.mConstructions, (aSite) => aCreep.pos.inRangeTo(aSite,3)),'progress').reverse();
                        if (mySites.length > 0)
                        {
                            aCreep.build(mySites[0]);
                        }
                    }
                }


                var aRoad = _.find(this.mRoads, (aRoad) =>
                {
                    var inRange = aRoad.pos.inRangeTo(aCreep,3);
                    var canRepair = (aRoad.hits + (aCreep.getActiveBodyparts(WORK) * REPAIR_POWER)) < aRoad.hitsMax;
                    return inRange && canRepair;
                });
                if (!_.isUndefined(aRoad) && (_.isUndefined(aTask) || (aTask.task != 'S' && aTask.task != 'E') ))
                {
                    var res = aCreep.repair(aRoad.entity);
                    //Log(undefined,'REPAIR ROAD:'+ErrorString(res));
                }

                var aContainer = _.find(this.mContainers, (aBox) => aBox.pos.inRangeTo(aCreep,3));
                if (!_.isUndefined(aContainer) && (_.isUndefined(aTask) || (aTask.task != 'S' && aTask.task != 'E') ))
                {
                    if (!_.isUndefined(aTask) && (aTask.task == 'R'))
                    {
                        let res = aCreep.repair(aTarget);
                        if (res == OK)
                        {
                            aCreep.cancelOrder('move');
                        }
                    }
                    else
                    {
                        var canRepair = (aContainer.hits + (aCreep.getActiveBodyparts(WORK) * REPAIR_POWER)) < aContainer.hitsMax;
                        if (canRepair)
                        {
                            var res = aCreep.repair(aContainer.entity);
                            //Log(undefined,'REPAIR CONTAINER:'+ErrorString(res));
                        }
                    }
                }
            }
        });
    }

    makeTasks()
    {
        let aSpawnTask =
        {
            priority: 0,
            target: this.mSpawn,
            task: 'S',
        }
        if (this.mSpawn.energy < this.mSpawn.energyCapacity)
        {
            this.mTasks.push(aSpawnTask);
        }

        _.each(this.mExtensions, (aExtension) =>
        {
            let aExtensionTask =
            {
                priority: 0.1,
                target: aExtension.entity,
                task: 'E',
            }
            this.mTasks.push(aExtensionTask);
        });


        var aTower = _.find(this.mTowers, (aTower) => aTower.energy < aTower.energyCapacity);
        if (!_.isUndefined(aTower))
        {
            var aTowerFillTask =
            {
                priority: 0.14,
                target: aTower.entity,
                task: 'D',
            }
            this.mTasks.push(aTowerFillTask);
        }

        var aContainer =  _.find(this.mContainers, (aBox) =>
        {
            if (_.sum(aBox.store) > aBox.storeCapacity * 0.5) return false;

            let aSource = _.find(this.mSources, (aSource) => aSource.pos.isNearTo(aBox));
            if (!_.isUndefined(aSource)) return false;

            return true;
        });
        if (!_.isUndefined(aContainer))
        {
            var aBoxFillTask =
            {
                priority: 0.145,
                target: aContainer.entity,
                task: 'C',
            }
            this.mTasks.push(aBoxFillTask);
        }

        var aTowerConstruction = _.find(Game.constructionSites, (aBuild) => aBuild.structureType == STRUCTURE_TOWER);
        if (!_.isUndefined(aTowerConstruction))
        {
            _.each(Game.creeps, (aCreep) =>
            {
                if (aCreep.pos.roomName == aTowerConstruction.pos.roomName && aCreep.canBuild())
                {
                    var aTowerBuildTask =
                    {
                        priority: 0.15,
                        target: aTowerConstruction,
                        task: 'T',
                    }
                    this.mTasks.push(aTowerBuildTask);
                }
            });
        }

        var myExstensionConstructions = _.filter(Game.constructionSites, (aBuild) => aBuild.structureType == STRUCTURE_EXTENSION);
        if (myExstensionConstructions.length > 0)
        {
            let prio = 0.13;
            _.each(myExstensionConstructions, (aBuild) =>
            {
                let aBuildTask =
                {
                    priority: (prio + 0.02),
                    target: aBuild,
                    task: 'B',
                }
                this.mTasks.push(aBuildTask);
            });
        }

        var myExtractorConstruction = _.find(Game.constructionSites, (aBuild) => aBuild.structureType == STRUCTURE_EXTRACTOR);
        if (!_.isUndefined(myExtractorConstruction))
        {
            var aExtractorBuildTask =
            {
                priority: 0.16,
                target: myExtractorConstruction,
                task: 'B',
            }
            this.mTasks.push(aExtractorBuildTask);
        }

        var myTerminalConstruction = _.find(Game.constructionSites, (aBuild) => aBuild.structureType == STRUCTURE_TERMINAL);
        if (!_.isUndefined(myTerminalConstruction))
        {
            let aBuildTask =
            {
                priority: 0.16,
                target: myTerminalConstruction,
                task: 'B',
            }
            this.mTasks.push(aBuildTask);
        }

        var myLabConstruction = _.find(Game.constructionSites, (aBuild) => aBuild.structureType == STRUCTURE_LAB);
        if (!_.isUndefined(myLabConstruction))
        {
            let aBuildTask =
            {
                priority: 0.16,
                target: myLabConstruction,
                task: 'B',
            }
            this.mTasks.push(aBuildTask);
        }

        var myRoadConstruction = _.find(Game.constructionSites, (aBuild) => aBuild.structureType == STRUCTURE_ROAD);
        if (!_.isUndefined(myRoadConstruction))
        {
            var aRoadBuildTask =
            {
                priority: 0.16,
                target: myRoadConstruction,
                task: 'B',
            }
            this.mTasks.push(aRoadBuildTask);
        }

        var myContainerConstruction = _.find(Game.constructionSites, (aBuild) => aBuild.structureType == STRUCTURE_CONTAINER);
        if (!_.isUndefined(myContainerConstruction))
        {
            let aBuildTask =
            {
                priority: 0.16,
                target: myContainerConstruction,
                task: 'B',
            }
            this.mTasks.push(aBuildTask);
        }

        var aContainer = _.find(this.mContainers, (aBox) => aBox.room.controller.my && aBox.hits < (aBox.hitsMax * 0.75));

        if (!_.isUndefined(aContainer))
        {
            var aRepairTask =
            {
                priority: 0.2,
                target: aContainer.entity,
                task: 'R',
            }
            this.mTasks.push(aRepairTask);
        };

        var aUpgradeTask =
        {
            priority: 0.9,
            target: this.mController,
            task: 'U',
        }
        this.mTasks.push(aUpgradeTask);

        if (!_.isUndefined(this.mStorage) && this.mStorage.store[RESOURCE_ENERGY] < 500000)
        {
            var aStorageTask =
            {
                priority: 1,
                target: this.mStorage.entity,
                task: 'F',
            }
            this.mTasks.push(aStorageTask);
            var aStorageTask =
            {
                priority: 1,
                target: this.mStorage.entity,
                task: 'F',
            }
            this.mTasks.push(aStorageTask);
            var aStorageTask =
            {
                priority: 1,
                target: this.mStorage.entity,
                task: 'F',
            }
            this.mTasks.push(aStorageTask);
            var aStorageTask =
            {
                priority: 1,
                target: this.mStorage.entity,
                task: 'F',
            }
            this.mTasks.push(aStorageTask);
        }
        else
        {
            var aUpgradeTask =
            {
                priority: 1,
                target: this.mController,
                task: 'U',
            }
            this.mTasks.push(aUpgradeTask);
            var aUpgradeTask =
            {
                priority: 1,
                target: this.mController,
                task: 'U',
            }
            this.mTasks.push(aUpgradeTask);
            var aUpgradeTask =
            {
                priority: 1,
                target: this.mController,
                task: 'U',
            }
            this.mTasks.push(aUpgradeTask);
            var aUpgradeTask =
            {
                priority: 1,
                target: this.mController,
                task: 'U',
            }
            this.mTasks.push(aUpgradeTask);
        }


        this.mTasks = _.sortBy(this.mTasks,'priority');
    }

    spawnFirst()
    {
        var myCreeps = _.filter(Game.creeps, (aCreep) => aCreep.getActiveBodyparts(WORK) > 0 && _.isUndefined(aCreep.memory.role));
        if (myCreeps.length > 6) return;


        var aCreepBody = new CreepBody();
        var aSearch =
        {
            name: CARRY,
            //max: 5,
        };
        var aBodyOptions =
        {
            hasRoads: true,
            moveBoost: '',
        };

        var aEnergy = this.mRoom.energyCapacityAvailable;

        if (_.size(Game.creeps) < 2)
        {
            aEnergy = _.max([this.mRoom.energyAvailable,300]);
        }

        var aCount = 1;
        if (aEnergy >= 2000)
        {
            aCount = 10;
        }
        else if (aEnergy >= 1300)
        {
            aCount = 8;
        }
        else if (aEnergy >= 800)
        {
            aCount = 5;
        }
        else if (aEnergy >= 650)
        {
            aCount = 4;
        }
        else if (aEnergy >= 550)
        {
            aCount = 3;
        }
        else if (aEnergy >= 400)
        {
            aCount = 2;
        }

        var aBody =
        {
            [WORK]:
            {
                count: aCount,
            },
        };

        //var aEnergy = this.mRoom.energyAvailable; //  RCL_ENERGY(this.mController.level);
        var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);


        if (!_.isEmpty(aResult.body))
        {
            var res = this.mSpawn.createCreep(aResult.body);
        }
        Log(undefined,JS(aResult));
    }

}
module.exports = ResettleOperation;
