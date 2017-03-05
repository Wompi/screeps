class UpgraderOperation
{
    constructor(pRoomName,pUpgraderName)
    {
        this.mUpgraderName = pUpgraderName;
        this.mRoomName = pRoomName;
        this.mController = _.find(PCache.getEntityCache(ENTITY_TYPES.controller), (aController) => aController.pos.roomName == this.mRoomName);
        this.mCreep = undefined;
        this.mStorage = _.find(PCache.getEntityCache(ENTITY_TYPES.storage), (aStorage) => aStorage.pos.roomName == this.mRoomName);
        this.mResources = _.filter(this.mController.room.find(FIND_DROPPED_RESOURCES), (aDrop) => aDrop.resourceType == RESOURCE_ENERGY);
    }

    processOperation()
    {
        this.log(LOG_LEVEL.error,'processOperation() storage: '+this.mStorage.pos.toString());
        this.spawnUpgrader();
        this.doUpgrade();
    }

    doUpgrade()
    {
        if (_.isUndefined(this.mCreep) || this.mCreep.spawning) return;

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
            if (!this.mCreep.pos.isNearTo(this.mStorage))
            {
                let res = this.mCreep.travelTo(this.mStorage.entity);
            }

            let res = this.mCreep.withdraw(this.mStorage.entity,RESOURCE_ENERGY);
            this.log(LOG_LEVEL.debug,this.mCreep.name+' withdraw '+this.mStorage.pos.toString());
        }
        else
        {
            let res = this.mCreep.upgradeController(this.mController.entity);
            if (res != OK)
            {
                let res = this.mCreep.travelTo(this.mController.entity);
                this.log(LOG_LEVEL.debug,this.mCreep.name+' move to '+this.mController.pos.toString());
            }
        }
    }

    spawnUpgrader()
    {
        var myCreeps = getCreepsForRole(CREEP_ROLE.upgrader);
        this.mCreep = _.find(myCreeps, (aCreep) => aCreep.name == this.mUpgraderName); // TODO: this will not work with multiple upgraders
        if (!_.isUndefined(this.mCreep)) return;
        if (this.mStorage.store[RESOURCE_ENERGY] < 150000) return;

        var aSpawn = _.min(PCache.getEntityCache(ENTITY_TYPES.spawn), (aProxy) =>
        {
            if (!aProxy.my) return Infinity;
            return aProxy.pos.getRangeTo(this.mController);
        });
        this.log(LOG_LEVEL.debug,'possible spawn - '+aSpawn.name);

        var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        {
            if (!_.isUndefined(Game.creeps[aCreepName])) return false;
            return aCreepMem.role == CREEP_ROLE.upgrader && aCreepName == this.mUpgraderName;
        });
        if (_.isUndefined(aName))
        {
            aName = this.mUpgraderName;
        }

        this.log(LOG_LEVEL.debug,'reuse name: '+aName);

        var aCreepBody = new CreepBody();

        // TODO: the cary parts should be adjusted to the current task - so if the task is heavy un/loading
        //       to the terminal/storage it should have more parts otherwise just normal 1
        //
        var aSearch =
        {
            name: WORK,
            max: 20,
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
                count: 6,
            }
        };
        var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);

        this.log(LOG_LEVEL.debug,'body: '+JS(aResult));

        if (aResult.aCost <=  aSpawn.room.energyAvailable)
        {
            let res = aSpawn.createCreep(aResult.body,aName,{role: CREEP_ROLE.upgrader})
            this.log(LOG_LEVEL.info,'upgrader createCreep - '+ErrorString(res));
        }
    }

    log(pLevel,pMsg)
    {
        Log(pLevel,'UpgraderOperation '+this.mRoomName+': '+pMsg);
    }
}
module.exports = UpgraderOperation;
