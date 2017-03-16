class ResettleOperation extends Operation
{
    constructor(pStopSpawning = false)
    {
        super('ResettleOperation');
        this.mStopSpawning = pStopSpawning;
        this.mSpawn = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn));
        this.mRoom = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.room), (aR) => aR.name == 'W47N84');
        //this.mController =  undefined ;
        this.mController = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.controller), (aC) => _.isUndefined(aC.reservation) && aC.level < 3);
        if (_.isUndefined(this.mController))
        {
            this.mController = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.controller), (aC) => _.isUndefined(aC.reservation) && aC.pos.roomName == this.mRoom.name);
        }
        //this.mController.visualize();

//        this.mSources = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.source),(aSource) => aSource.pos.roomName == this.mRoom.name);
        this.mSources = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.source),(aS) => aS.energy > 0 && aS.getSourceType().type != SOURCE_TYPE.link);

        this.mSourcePoses = _.reduce(this.mSources, (res, aSource) =>
        {
            aSource.visualize();
            return _.reduce(aSource.possibleMiningPositions, (res,value,aX) =>
            {
                return _.reduce(value, (res,aCount,aY) =>
                {
                    res.push(new RoomPosition(aX,aY,aSource.pos.roomName));
                    return res;
                },res);
            },res);
        },[]);

        this.mExtensions =  _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.extension), (aExt) => aExt.energy < aExt.energyCapacity);
        this.mConstructions = PCache.getFriendlyEntityCache(ENTITY_TYPES.constructionSite);
        this.mResources = PCache.getFriendlyEntityCache(ENTITY_TYPES.resource);

        this.mContainers = PCache.getFriendlyEntityCache(ENTITY_TYPES.container);
        this.mRoads = PCache.getFriendlyEntityCache(ENTITY_TYPES.road);

        this.mTowers = PCache.getFriendlyEntityCache(ENTITY_TYPES.tower);

        this.mStorage = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.storage), (aProxy) => aProxy.pos.roomName == this.mRoom.name);

        this.myCreeps = [];

        this.mTasks = [];
    }


    processOperation()
    {
        this.log(LOG_LEVEL.error,'processOperation()');
        this.spawnFirst();
        this.makeTasks();
        this.goMining();
    }

    goMining()
    {
        _.each(this.myCreeps, (aCreep) =>
        {

            if (!aCreep.spawning)
            {
                //Log(LOG_LEVEL.warn,'CREEP: '+aCreep.name);
                let isEmpty = aCreep.carry[RESOURCE_ENERGY] == 0;
                let isFull = aCreep.carry[RESOURCE_ENERGY] == aCreep.carryCapacity;
                let hasEnergy = aCreep.carry[RESOURCE_ENERGY] > 0;
                let isCloseToMine = !_.isUndefined(_.find(this.mSources, (aSource) => aSource.energy > 0 && aSource.pos.isNearTo(aCreep)));

                let aBox = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.container), (aB) =>
                {
                    if (isCloseToMine && aB.pos.isNearTo(aCreep) && aB.store[RESOURCE_ENERGY] > 0)
                    {
                        return true;
                    }
                    return false;
                });
                if (!_.isUndefined(aBox))
                {
                    let res = aCreep.withdraw(aBox.entity,RESOURCE_ENERGY);
                    this.log(LOG_LEVEL.debug,'oppotunity withdraw from minign box '+aBox.pos.toString());
                }


                // opportunity tasks
                if (this.mResources.length > 0)
                {
                    var aResource = _.find(this.mResources, (aDrop) => aDrop.pos.isNearTo(aCreep));
                    if (!_.isUndefined(aResource))
                    {
                        let res = aCreep.pickup(aResource.entity);
                        //Log(undefined,'RESOURCE:'+ErrorString(res));
                    }
                }

                let aSay = aCreep.saying;

                let aTask = undefined;


                var aTarget = undefined;
                if ((isCloseToMine && !isFull) || isEmpty)
                {
                    this.mSourcePoses = _.sortBy(this.mSourcePoses, (aPos) => aPos.getRangeTo(aCreep));

                    // if (isCloseToMine)
                    // {
                    //     for (let aIndex in this.mSourcePoses)
                    //     {
                    //         let a = _.find(this.mSources, (aSource) => aSource.pos.isNearTo(this.mSourcePoses[aIndex]));
                    //         if (!_.isUndefined(a))
                    //         {
                    //             aTarget = a;
                    //             delete this.mSourcePoses[aIndex];
                    //             break;
                    //         }
                    //     }
                    // }
                    // else
                    {
                        aTarget = this.mSourcePoses.shift();
                    }


                    if (_.isUndefined(aTarget))
                    {
                        let aSource = undefined;
                        if (_.findIndex(this.myCreeps, (aC) => aC.name == aCreep.name) % 2 == 0)
                        {
                            aSource = _.max(this.mSources, (aSource) => aSource.pos.getRangeTo(this.mSpawn));
                            aCreep.say('iii');
                        }
                        else
                        {
                            aSource = _.min(this.mSources, (aSource) => aSource.pos.getRangeTo(this.mSpawn));
                            aCreep.say('ooo');
                        }


                        if (!_.isUndefined(aSource))
                        {
                            aCreep.travelTo(aSource);
                        }
                        if(!aCreep.pos.isNearTo(aSource)) return;
                        else
                        {
                            aTarget = aCreep.pos;
                        }
                    }

                    let aLook = aTarget.lookFor(LOOK_CREEPS);
                    if (aLook.length > 0 && aLook[0].name != aCreep.name)
                    {
                        aTarget = this.mSourcePoses.shift();
                    }
                    if (_.isUndefined(aTarget)) return;
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
                if (_.isUndefined(aTarget)) return;

                if (!_.isUndefined(aTask)) aCreep.say(aTask.task);

                //when no task is left maybe go mining or something



                var res = aCreep.travelTo( _.isUndefined(aTarget.pos) ? {pos: aTarget} : aTarget,  _.isUndefined(aTarget.pos) ? {range: 0} : {} );
                let aMsg = _.isUndefined(aTarget.pos) ? aTarget.toString() : aTarget.pos.toString();
                Log(undefined,'MOVE: '+aCreep.name+' '+aMsg+' '+ErrorString(res));


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

                var res = aCreep.transfer(_.isUndefined(aTarget.entity)? aTarget: aTarget.entity,RESOURCE_ENERGY);
                //Log(undefined,'TRANSFER:'+ErrorString(res));

                if (!_.isUndefined(aTask) && aTask.task != 'B')
                {
                    var res = aCreep.upgradeController(_.isUndefined(aTarget.entity)? aTarget: aTarget.entity);
                    if (res == OK)
                    {
                        aCreep.cancelOrder('move');
                        this.moveUpdaterFromRoad(aCreep);
                    }
                }
                //Log(undefined,'UPGRADE: '+ErrorString(res));

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
                            let res = aCreep.build(mySites[0].entity);
                            if (res == OK)
                            {
                                aCreep.cancelOrder('move');
                            }
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
        var aSpawnConstruction = _.find(this.mConstructions, (aBuild) => aBuild.structureType == STRUCTURE_SPAWN);
        if (!_.isUndefined(aSpawnConstruction))
        {
            _.each(Game.creeps, (aCreep) =>
            {
                if (aCreep.pos.roomName == aSpawnConstruction.pos.roomName && aCreep.canBuild())
                {
                    var aSpawnBuildTask =
                    {
                        priority: 0,
                        target: aSpawnConstruction.entity,
                        task: 'X',
                    }
                    this.mTasks.push(aSpawnBuildTask);
                }
            });
        }

        // if (!_.isUndefined(this.mSpawn))
        // {
        //     let aSpawnTask =
        //     {
        //         priority: 0,
        //         target: this.mSpawn.entity,
        //         task: 'S',
        //     }
        //     if (this.mSpawn.energy < this.mSpawn.energyCapacity)
        //     {
        //         this.mTasks.push(aSpawnTask);
        //     }
        // }

        _.each(this.mExtensions, (aExtension) =>
        {
            let myBays = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.flag),FLAG_TYPE.extensionBay);
            let aBay = undefined;
            if (myBays.length > 0)
            {
                aBay = _.find(myBays,(aB) => aB.pos.inRangeTo(aExtension,2));
            }

            if (_.isUndefined(aBay))
            {
                let aExtensionTask =
                {
                    priority: 0.1,
                    target: aExtension.entity,
                    task: 'E',
                }

                if (aExtension.energy < aExtension.energyCapacity)
                {
                    this.mTasks.push(aExtensionTask);
                }
            }
        });

        // _.each(this.mContainers, (aBox) =>
        // {
        //     if (aBox.pos.isNearTo(this.mSpawn) && _.sum(aBox.store) < (aBox.storeCapacity*0.75))
        //     {
        //         _.times(1, (aIndex) =>
        //         {
        //             let aBoxTask =
        //             {
        //                 priority: 0.1,
        //                 target: aBox.entity,
        //                 task: 'Y',
        //             }
        //             this.mTasks.push(aBoxTask);
        //         });
        //         this.log(LOG_LEVEL.debug,'BOX TASK!');
        //     }
        // });

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

            let aSource = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.source), (aSource) => aSource.pos.isNearTo(aBox));
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
            var prio = 0.13;
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

        var myRoadConstructions = _.filter(Game.constructionSites, (aBuild) => aBuild.structureType == STRUCTURE_ROAD);
        if (myRoadConstructions.length > 0)
        {
            _.times(_.max([1,myRoadConstructions.length]), (aIndex) =>
            {
                var aRoadBuildTask =
                {
                    priority: 0.16,
                    target: myRoadConstructions[aIndex],
                    task: 'B',
                }
                this.mTasks.push(aRoadBuildTask);
            });
        }

        var myContainerConstruction = _.find(Game.constructionSites, (aBuild) => aBuild.structureType == STRUCTURE_CONTAINER);
        if (!_.isUndefined(myContainerConstruction))
        {
            _.each(Game.creeps, (aCreep) =>
            {
                if (aCreep.memory.role == CREEP_ROLE.multiTool)
                {
                    let aBuildTask =
                    {
                        priority: 0.16,
                        target: myContainerConstruction,
                        task: 'B',
                    }
                    this.mTasks.push(aBuildTask);
                }
            });

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
            _.times(_.max([0,this.myCreeps.length - 2]), (aIndex) =>
            {
                var aStorageTask =
                {
                    priority: 1,
                    target: this.mStorage.entity,
                    task: 'F',
                }
                this.mTasks.push(aStorageTask);
            });
        }
        else
        {
            if (this.mController.ticksToDowngrade < 1000)
            {
                var aUpgradeTask =
                {
                    priority: 0,
                    target: this.mController,
                    task: 'U',
                }
                this.mTasks.push(aUpgradeTask);
            }


            _.times(this.myCreeps.length, (aIndex) =>
            {
                var aUpgradeTask =
                {
                    priority: 1,
                    target: this.mController,
                    task: 'U',
                }
                this.mTasks.push(aUpgradeTask);
            });
        }


        this.mTasks = _.sortBy(this.mTasks,'priority');
    }

    spawnFirst()
    {
        this.myCreeps = getCreepsForRole(CREEP_ROLE.multiTool);

        if (this.mStopSpawning) return;
        if (this.myCreeps.length > 8) return;

        var aSpawn = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn)); // TODO: this will not work with multiple spawns

        if (_.isUndefined(aSpawn)) return;
        this.log(LOG_LEVEL.debug,'possible spawn - '+aSpawn.name);

        var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        {
            if (!_.isUndefined(Game.creeps[aCreepName])) return false;
            return aCreepMem.role == CREEP_ROLE.multiTool;
        });


        var aCreepBody = new CreepBody();
        var aSearch =
        {
            name: CARRY,
            max: 6,
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
            aCount = 5; /// 8
        }
        else if (aEnergy >= 800)
        {
            aCount = 4;  //5;   /// if we have a extension loader switch to 3
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


        this.log(LOG_LEVEL.debug,'body: '+JS(aResult));
        if (aResult.aCost <=  aSpawn.room.energyAvailable)
        {
            let res = aSpawn.createCreep(aResult.body,aName,{role: CREEP_ROLE.multiTool, spawn: aSpawn.pos.wpos.serialize()})
            this.log(LOG_LEVEL.info,'multiTool createCreep - '+ErrorString(res));
        }
    }

    moveUpdaterFromRoad(pCreep)
    {
        let aRoad = _.find(pCreep.pos.look(), (a) =>
        {
            return (_.get(a,['structure','structureType']) == STRUCTURE_ROAD)
        });
        if (_.isUndefined(aRoad)) return;


        let myControllerPos = this.mController.upgradePositions.area;
        //this.log(LOG_LEVEL.debug,JS(myControllerPos));

        let aArea = pCreep.pos.adjacentPositions(3);
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
            aPos = _.min(myPos, (a) => this.mController.pos.getRangeTo(a));
            if (!pCreep.pos.isEqualTo(aPos))
            {
                let res = pCreep.travelTo({pos: aPos}, {range: 0});
                this.log(LOG_LEVEL.info,'move from road '+pCreep.name+' '+aPos.toString()+' '+ErrorString(res));
            }
        }
    }
}
module.exports = ResettleOperation;
