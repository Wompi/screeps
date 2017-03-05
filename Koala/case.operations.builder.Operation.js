class BuilderOperation
{
    constructor()
    {
        this.mConstructions = PCache.getEntityCache(ENTITY_TYPES.constructionSite);
        this.mCreep = undefined;
        this.mHauler = undefined;
    }

    processOperation()
    {
        this.log(LOG_LEVEL.error,'processOperation()')
        this.spawnBuilder();
        this.spawnHauler();
        this.doBuilding();
        this.doHauling();
    }

    doBuilding()
    {
        if (_.isUndefined(this.mCreep) || this.mCreep.spawning) return;


        let aSite = (this.mConstructions.length != 0) ? this.mConstructions[0] : undefined;

        if (_.isUndefined(aSite))
        {
            this.log(LOG_LEVEL.info,'builder is idle...'); // TODO: move to idle or recycle position
            return;
        }

        if (!this.mCreep.pos.isNearTo(aSite))
        {
            let res = this.mCreep.moveTo(aSite.entity);
        }


        this.mResources = this.mCreep.room.find(FIND_DROPPED_RESOURCES);
        if (this.mResources.length > 0)
        {
            var aResource = _.find(this.mResources, (aDrop) => aDrop.pos.isNearTo(this.mCreep));
            if (!_.isUndefined(aResource))
            {
                let res = this.mCreep.pickup(aResource);
                //Log(undefined,'RESOURCE:'+ErrorString(res));
            }
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
            let aStorage = _.min(PCache.getEntityCache(ENTITY_TYPES.storage), (aStorage) => aStorage.pos.getRangeTo(this.mHauler));

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
        this.mCreep = _.find(myCreeps); // TODO: this will not work with multiple builders
        if (!_.isUndefined(this.mCreep)) return;
        if (this.mConstructions.length == 0) return;
        var aSite = this.mConstructions[0];  // TODO: find something to classify the construction sites


        var aSpawn = _.min(PCache.getEntityCache(ENTITY_TYPES.spawn), (aProxy) =>
        {
            if (!aProxy.my) return Infinity;
            return aProxy.pos.getRangeTo(aSite);
        });

        this.log(LOG_LEVEL.debug,'possible spawn builder - '+aSpawn.name);

        var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        {
            if (!_.isUndefined(Game.creeps[aCreepName])) return false;
            return aCreepMem.role == CREEP_ROLE.builder;
        });

        this.log(LOG_LEVEL.debug,'reuse name builder: '+aName);

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
            let res = aSpawn.createCreep(aResult.body,aName,{role: CREEP_ROLE.builder})
            this.log(LOG_LEVEL.info,'builder createCreep - '+ErrorString(res));
        }

    }

    spawnHauler()
    {
        var myCreeps = getCreepsForRole(CREEP_ROLE.builderHauler);
        this.mHauler = _.find(myCreeps); // TODO: this will not work with multiple builders
        if (!_.isUndefined(this.mHauler)) return;
        if (_.isUndefined(this.mCreep)) return;
        if (this.mConstructions.length == 0) return;

        var aSite = this.mConstructions[0];  // TODO: find something to classify the construction sites

        var aSpawn = _.min(PCache.getEntityCache(ENTITY_TYPES.spawn), (aProxy) =>
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
            let res = aSpawn.createCreep(aResult.body,aName,{role: CREEP_ROLE.builderHauler})
            this.log(LOG_LEVEL.info,'builder createCreep - '+ErrorString(res));
        }
    }

    log(pLevel,pMsg)
    {
        Log(pLevel,'BuilderOperation: '+pMsg);
    }
}
module.exports = BuilderOperation;
