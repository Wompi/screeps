class ResettleOperation
{
    constructor()
    {
        this.mSpawn = _.find(Game.spawns);
        this.mRoom = this.mSpawn.room;
        this.mController = this.mRoom.controller;

        this.mSources = _.sortBy(this.mRoom.find(FIND_SOURCES), (aSource) => this.mSpawn.pos.getRangeTo(aSource));

        var mySourcePos = [];
        _.each(this.mSources, (aSource) => mySourcePos = mySourcePos.concat(aSource.possibleMiningPositions(true)));


        this.mSourcePoses = _.reduce(this.mSources, (res, aSource) =>
        {
            return _.reduce(aSource.possibleMiningPositions(), (res,value,aX) =>
            {
                return _.reduce(value, (res,aCount,aY) =>
                {
                    res.push(new RoomPosition(aX,aY,this.mRoom.name));
                    return res;
                },res);
            },res);
        },[]);

        this.mExtensions = _.filter(GameMan.getStructureForType('extension'), (aStruct) => aStruct.energy < aStruct.energyCapacity);
        this.mConstructions = _.filter(Game.constructionSites, (aSite) => aSite.room.name == this.mRoom.name);
        this.mResources = this.mRoom.find(FIND_DROPPED_RESOURCES);

        this.mContainers = GameMan.getStructureForType('container');
        this.mRoads = GameMan.getStructureForType('road');

        this.mTowers = GameMan.getStructureForType('tower');

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
            if (!aCreep.spawning)
            {
                //Log(WARN,'CREEP: '+aCreep.name);
                let isEmpty = aCreep.carry[RESOURCE_ENERGY] == 0;
                let isFull = aCreep.carry[RESOURCE_ENERGY] == aCreep.carryCapacity;
                let hasEnergy = aCreep.carry[RESOURCE_ENERGY] > 0;

                let aSay = aCreep.saying;

                let aTask = undefined;


                var aTarget = undefined;
                if (!isFull && (isEmpty || aSay == 'H'))
                {
                    aTarget = this.mSourcePoses.shift();
                }
                else
                {
                    aTask = this.mTasks.shift();
                    if (!_.isUndefined(aTask))
                    {
                        aTarget = aTask.target;
                    }
                }

                if (!_.isUndefined(aTask)) aCreep.say(aTask.task);

                // when no task is left maybe go mining or something
                //if (_.isUndefined(aTask)) return;

                // let aTarget = undefined;
                // if
                // {
                //     // needs a bit more thought
                //     aTarget = this.mSourcePoses.shift();
                //     //Log(undefined, aCreep.name+' '+JS(aTarget));
                //     //aCreep.say('H');
                // }
                // else
                // {
                //     aTarget = aTask.target
                //     aCreep.say(aTask.task);
                // }

                var res = aCreep.travelTo( _.isUndefined(aTarget.pos) ? {pos: aTarget} : aTarget,  _.isUndefined(aTarget.pos) ? {range: 0} : {} );
                //Log(undefined,'MOVE: '+ErrorString(res));

                var res = aCreep.harvest(_.find(this.mSources, (aSource) => aSource.pos.isNearTo(aTarget)));
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
                //var hasBuildPower = aCreep.carry[RESOURCE_ENERGY] >= (aCreep.getActiveBodyparts(WORK) * BUILD_POWER);
                if (/*hasBuildPower &&*/ (_.isUndefined(aTask) || (aTask.task != 'S' && aTask.task != 'E') ))
                {
                    var mySites = _.sortBy(_.filter(this.mConstructions, (aSite) => aCreep.pos.inRangeTo(aSite,3)),'progress').reverse();
                    if (mySites.length > 0)
                    {
                        aCreep.build(mySites[0]);
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
                    var res = aCreep.repair(aRoad);
                    //Log(undefined,'REPAIR ROAD:'+ErrorString(res));
                }

                var aContainer = _.find(this.mContainers, (aBox) => aBox.pos.inRangeTo(aCreep,3));
                if (!_.isUndefined(aContainer) && (_.isUndefined(aTask) || (aTask.task != 'S' && aTask.task != 'E') ))
                {
                    var canRepair = (aContainer.hits + (aCreep.getActiveBodyparts(WORK) * REPAIR_POWER)) < aContainer.hitsMax;
                    if (canRepair)
                    {
                        var res = aCreep.repair(aContainer);
                        //Log(undefined,'REPAIR CONTAINER:'+ErrorString(res));
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
                target: aExtension,
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
                target: aTower,
                task: 'D',
            }
            this.mTasks.push(aTowerFillTask);
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

        var myExstensionConstruction = _.find(Game.constructionSites, (aBuild) => aBuild.structureType == STRUCTURE_EXTENSION);
        if (!_.isUndefined(myExstensionConstruction))
        {
            var aExtensionBuildTask =
            {
                priority: 0.15,
                target: myExstensionConstruction,
                task: 'B',
            }
            this.mTasks.push(aExtensionBuildTask);
        }

        var aContainer = _.find(this.mContainers, (aBox) => aBox.hits < (aBox.hitsMax * 0.75));

        if (!_.isUndefined(aContainer))
        {
            var aRepairTask =
            {
                priority: 0.2,
                target: aContainer,
                task: 'R',
            }
            this.mTasks.push(aRepairTask);
        };

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

        var aUpgradeTask =
        {
            priority: 1,
            target: this.mController,
            task: 'U',
        }
        this.mTasks.push(aUpgradeTask);


        _.sortBy(this.mTasks,'priority');

        // debug
        var a = '';
        _.each(this.mTasks, (aTask) => a = a + aTask.task + ' ');

        //Log(undefined,'TASKS: '+ a);
    }

    spawnFirst()
    {
        if (_.size(Game.creeps) > 3) return;


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
        if (aEnergy >= 1300)
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