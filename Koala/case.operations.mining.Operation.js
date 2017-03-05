class MiningOperation
{
    constructor(pSource)
    {
        this.mSource = pSource;
        this.mTasks = [];
        this.mCreep = undefined;
        this.mResources = this.mSource.room.find(FIND_DROPPED_RESOURCES);
    }

    processOperation()
    {
        Log(LOG_LEVEL.error,'MiningOperation '+this.mSource.pos.toString()+': processOperation() type: '+this.mSource.getSourceType().type);
        this.spawnMiner();
        this.spawnHauler();
        this.makeTasks();
        this.processTasks();
    }

    processTasks()
    {
        if (_.isUndefined(this.mCreep) || this.mCreep.spawning) return;


        if (!this.mCreep.pos.isNearTo(this.mSource))
        {
            this.mCreep.travelTo(this.mSource);
        }
        else
        {
            if (this.mResources.length > 0)
            {
                var aResource = _.find(this.mResources, (aDrop) => aDrop.pos.isNearTo(this.mCreep));
                if (!_.isUndefined(aResource))
                {
                    let res = this.mCreep.pickup(aResource);
                    //Log(undefined,'RESOURCE:'+ErrorString(res));
                }
            }

            let aSourceType = this.mSource.getSourceType();
            let res = this.mCreep.harvest(this.mSource.entity);

            if (!_.isUndefined(aSourceType.target))
            {
                if (aSourceType.type == SOURCE_TYPE.link)
                {
                    if (!this.mCreep.pos.isNearTo(aSourceType.target))
                    {
                        let res = this.mCreep.travelTo(aSourceType.target);
                    }
                }
                else if (aSourceType.type == SOURCE_TYPE.box)
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

        var aSpawn = _.min(PCache.getEntityCache(ENTITY_TYPES.spawn), (aProxy) =>
        {
            if (!aProxy.my) return Infinity;
            if (aProxy.pos.roomName != this.mSource.pos.roomName) return Infinity;
            return aProxy.pos.getRangeTo(this.mSource);
        });

        Log(LOG_LEVEL.debug,'MinerOperation '+this.mSource.pos.toString()+': possible spawn: '+aSpawn.name+' '+aSpawn.pos+' id: '+aSourceID);

        var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        {
            if (_.isUndefined(aCreepMem.target)) return false;
            if (!_.isUndefined(Game.creeps[aCreepName])) return false;
            return aCreepMem.target == aSourceID && aCreepMem.role == CREEP_ROLE.miner;
        });

        Log(LOG_LEVEL.debug,'MinerOperation '+this.mSource.pos.toString()+': reuse name: '+aName);

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

        var aEnergy = aSpawn.room.energyCapacityAvailable;
        var aBody =
        {
            [CARRY]:
            {
                count: (this.mSource.getSourceType().type == SOURCE_TYPE.link ? 1 : 0),
            }
        };
        var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);

        Log(LOG_LEVEL.debug,'BODY: '+JS(aResult));
        if (aResult.aCost <=  aSpawn.room.energyAvailable)
        {
            let res = aSpawn.createCreep(aResult.body,aName,{role: CREEP_ROLE.miner, target: aSourceID})
            this.log(LOG_LEVEL.info,'miner createCreep - '+ErrorString(res));
        }
    }

    spawnHauler()
    {

    }


    log(pLevel,pMsg)
    {
        Log(pLevel,'MiningOperation '+this.mSource.toString()+': '+pMsg);
    }
}
module.exports = MiningOperation;
