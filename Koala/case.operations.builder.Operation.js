class BuilderOperation extends Operation
{
    constructor(pCount)
    {
        super('BuilderOperation');
        this.mConstructions = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.constructionSite), (aC) =>
        {
            let myBays = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.flag),FLAG_TYPE.extensionBay);
            let aBay = _.find(myBays, (aB) => aB.pos.inRangeTo(aC,3));
            if (!_.isUndefined(aBay)) return false;
            return true;
        });
        this.mCount = pCount;
        this.mCreep = undefined;
        this.mHauler = undefined;
        this.mResources = PCache.getFriendlyEntityCache(ENTITY_TYPES.resource);
        this.mStorages = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.storage), (aS) => aS.store[RESOURCE_ENERGY] > 50000);
    }

    processOperation()
    {
        this.log(LOG_LEVEL.error,'processOperation() '+this.mCount);
        //this.spawnHauler();
        this.spawnBuilder();
        this.doBuilding();
        //this.doHauling();
    }

    doBuilding()
    {
        if (_.isUndefined(this.mCreep) || this.mCreep.spawning) return;

        let aSite = (this.mConstructions.length != 0) ? this.mConstructions[0] : undefined;

        if (_.isUndefined(aSite))
        {
            this.log(LOG_LEVEL.info,'builder is idle...'); // TODO: move to idle or recycle position
            this.mCreep.memory.role = CREEP_ROLE.upgrader;
            return;
        }

        // TODO: oppotunity grab from a near recource  - make this somehow global accessable to all builders/creeps
        if (this.mResources.length > 0)
        {
            var aResource = _.find(this.mResources, (aDrop) => aDrop.pos.isNearTo(this.mCreep));
            if (!_.isUndefined(aResource))
            {
                let res = this.mCreep.pickup(aResource.entity);
                //Log(undefined,'RESOURCE:'+ErrorString(res));
            }
        }

        // TODO: oppotunity grab from a near box - make this somehow global accessable to all builders/creeps
        let aNearBox = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.container), (aB) =>
        {
            if (aB.pos.roomName != this.mCreep.pos.roomName) return false;
            if (!aB.pos.isNearTo(this.mCreep)) return false;
            if (aB.store[RESOURCE_ENERGY] > 199) return false;
            return true;
        });

        if (!_.isUndefined(aNearBox))
        {
            let res = this.mCreep.withdraw(aNearBox.entity,RESOURCE_ENERGY);
        }

        if (this.mStorages.length > 0 && _.sum(this.mCreep.carry) == 0)
        {
            // TODO: change this to WorldPosition
        //    let aTarget = _.min(this.mStorages, (aS) => aS.pos.wpos.getRangeTo(this.mCreep.pos.wpos));

            /// TODO: save this somehow
            let aTarget =  _.min(this.mStorages, (aStorage) =>
            {
                let aPath =  PMan.getCleanPath(this.mCreep.pos,aStorage.pos,undefined);
                // let len = aPath.path.length;
                //
                //  let aRoomPath = {}
                //  _.each(aPath.path, (aPathPos) =>
                //  {
                //      let a = _.get(aRoomPath,aPathPos.roomName,[]);
                //      a.push(aPathPos);
                //      _.set(aRoomPath,aPathPos.roomName, a);
                //  });
                //
                //  _.each(aRoomPath, (aP,aName) =>
                //  {
                //      new RoomVisual(aName).poly(aP,{lineStyle: 'dashed' , stroke: COLOR.yellow, opacity: 1});
                //      new RoomVisual(aName).text(aP.length+'('+len+')',_.last(aP));
                //  });
                return aPath.path.length;
            });
            if (!_.isUndefined(aTarget))
            {

                let res = this.mCreep.travelTo(aTarget);
                this.log(LOG_LEVEL.debug,this.mCreep.name+' moves to storage '+aTarget.pos.toString()+' res: '+ErrorString(res));
                if (this.mCreep.pos.isNearTo(aTarget))
                {
                    let res = this.mCreep.withdraw(aTarget.entity,RESOURCE_ENERGY);
                    this.log(LOG_LEVEL.debug,this.mCreep.name+' grabs from storage '+aTarget.pos.toString()+' res: '+ErrorString(res));
                }
            }
        }
        else if (!this.mCreep.pos.inRangeTo(aSite,3))
        {
            let res = this.mCreep.travelTo(aSite,{range: 3});
            this.log(LOG_LEVEL.debug,this.mCreep.name+' moves to site '+aSite.pos.toString()+' res: '+ErrorString(res));
        }

        let res = this.mCreep.build(aSite.entity);
        this.log(LOG_LEVEL.debug,' builder '+this.mCreep.name+' builds '+aSite.pos.toString());
    }


    doHauling()
    {
        if (_.isUndefined(this.mHauler) || this.mHauler.spawning) return;
        let aSite = (this.mConstructions.length != 0) ? this.mConstructions[0] : undefined;

        if (_.isUndefined(aSite))
        {
            this.log(LOG_LEVEL.info,'builder hauler is idle...'); // TODO: move to idle or recycle position
            return;
        }

        if (_.sum(this.mHauler.carry) == 0)
        {
            let aStorage = _.min(PCache.getFriendlyEntityCache(ENTITY_TYPES.storage), (aStorage) => aStorage.pos.getRangeTo(this.mHauler));

            if (!this.mHauler.pos.isNearTo(aStorage))
            {
                let res = this.mHauler.travelTo(aStorage.entity);
            }

            let res = this.mHauler.withdraw(aStorage.entity,RESOURCE_ENERGY);
            this.log(LOG_LEVEL.debug,' builder hauler '+this.mHauler.name+' withdraw '+aStorage.pos.toString()+' res: '+ErrorString(res));
        }
        else
        {
            if (!this.mHauler.pos.isNearTo(this.mCreep))
            {
                let res = this.mHauler.travelTo(this.mCreep);
            }
            else
            {
                // TODO: cacluclate the amount to drop - something like rest site - builder carry and energy on the ground
                this.mResources = this.mCreep.room.find(FIND_DROPPED_RESOURCES);
                var aResource = undefined;
                if (this.mResources.length > 0)
                {
                    aResource = _.find(this.mResources, (aDrop) => aDrop.pos.isNearTo(this.mHauler) &&  aDrop.resourceType == RESOURCE_ENERGY && aDrop.amount > this.mHauler.carryCapacity)
                }

                if (_.isUndefined(aResource))
                {
                    let res = this.mHauler.drop(RESOURCE_ENERGY);
                }
            }
        }
    }

    spawnBuilder()
    {
        var myCreeps = getCreepsForRole(CREEP_ROLE.builder);

        this.mCreep = myCreeps[this.mCount]; // TODO: notsure if this is a good solution - every builderoperation has a number so it might work
        if (!_.isUndefined(this.mCreep)) return;
        if (this.mConstructions.length == 0) return;

        // TODO: lets see if this works - if we have upgraders make them to builders for the time construction sites are
        // valid
        var myUpgraderCreeps = getCreepsForRole(CREEP_ROLE.upgrader);
        if (myUpgraderCreeps.length > 0)
        {
            let aCreep = _.max(myUpgraderCreeps, (aC) =>
            {
                if (aC.spawning) return -Infinity;
                return aC.ticksToLive;
            });
            aCreep.memory.role = CREEP_ROLE.builder;
            return;
        }
        // TODO: for now we just use the upgraders - when no upgrader is available it will be build in the upgrader operation and then
        // reassigned in the next tick here

        // var aSite = this.mConstructions[0];  // TODO: find something to classify the construction sites
        //
        //
        // var aSpawn = _.min(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aProxy) =>
        // {
        //     if (!aProxy.my) return Infinity;
        //     return aProxy.pos.getRangeTo(aSite);
        // });
        //
        // this.log(LOG_LEVEL.debug,'possible spawn builder - '+aSpawn.name);
        //
        // var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        // {
        //     if (!_.isUndefined(Game.creeps[aCreepName])) return false;
        //     return aCreepMem.role == CREEP_ROLE.builder;
        // });
        //
        // this.log(LOG_LEVEL.debug,'reuse name builder: '+aName);
        //
        // var aCreepBody = new CreepBody();
        //
        // // TODO: the cary parts should be adjusted to the current task - so if the task is heavy un/loading
        // //       to the terminal/storage it should have more parts otherwise just normal 1
        // //
        // var aSearch =
        // {
        //     name: WORK,
        //     max: 4,
        // };
        // var aBodyOptions =
        // {
        //     hasRoads: true,
        //     moveBoost: '',
        // };
        //
        // var aEnergy = aSpawn.room.energyCapacityAvailable;
        // var aBody =
        // {
        //     [CARRY]:
        //     {
        //         count: 1,
        //     }
        // };
        // var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);
        //
        // this.log(LOG_LEVEL.debug,'body: '+JS(aResult));
        //
        // if (aResult.aCost <=  aSpawn.room.energyAvailable)
        // {
        //     let res = aSpawn.createCreep(aResult.body,aName,{role: CREEP_ROLE.builder})
        //     this.log(LOG_LEVEL.info,'builder createCreep - '+ErrorString(res));
        // }

    }

    spawnHauler()
    {
        var myCreeps = getCreepsForRole(CREEP_ROLE.builderHauler);
        this.mHauler = _.find(myCreeps); // TODO: this will not work with multiple builders
        if (!_.isUndefined(this.mHauler)) return;
        if (_.isUndefined(this.mCreep)) return;
        if (this.mConstructions.length == 0) return;

        var aSite = this.mConstructions[0];  // TODO: find something to classify the construction sites

        var aSpawn = _.min(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aProxy) =>
        {
            if (!aProxy.my) return Infinity;
            return aProxy.pos.getRangeTo(aSite);
        });

        this.log(LOG_LEVEL.debug,'possible spawn hauler - '+aSpawn.name);

        var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        {
            if (!_.isUndefined(Game.creeps[aCreepName])) return false;
            return aCreepMem.role == CREEP_ROLE.builderHauler;
        });

        this.log(LOG_LEVEL.debug,'reuse name hauler: '+aName);

        var aCreepBody = new CreepBody();

        // TODO: the cary parts should be adjusted to the current task - so if the task is heavy un/loading
        //       to the terminal/storage it should have more parts otherwise just normal 1
        //
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

        var aEnergy = aSpawn.room.energyCapacityAvailable;
        var aBody =
        {
            // [CARRY]:
            // {
            //     count: 1,
            // }
        };
        var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);

        this.log(LOG_LEVEL.debug,'body: '+JS(aResult));

        if (aResult.aCost <=  aSpawn.room.energyAvailable)
        {
            let res = aSpawn.createCreep(aResult.body,aName,{role: CREEP_ROLE.builderHauler, spawn: aSpawn.pos.wpos.serialize()})
            this.log(LOG_LEVEL.info,'builder createCreep - '+ErrorString(res));
        }
    }
}
module.exports = BuilderOperation;
