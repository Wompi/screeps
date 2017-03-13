class HaulerOperation
{
    constructor(pStorage)
    {
        this.mCreep = undefined;
        this.mTasks = [];
        this.mStorage = pStorage;
        this.mRoom = pStorage.room;

        this.mContainers = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.container), (aBox) =>
        {
            if (aBox.pos.roomName != this.mRoom.name) return false;
            let myBays = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.flag),FLAG_TYPE.extensionBay);
            if (myBays.length == 0) return false;
            let aBay =  _.find(myBays, (aB) => aB.pos.isEqualTo(aBox.pos));
            return !_.isUndefined(aBay);
        });
        this.mExtractor = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.extractor), (aE) => aE.pos.roomName == this.mRoom.name);
        this.mResources =  _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.resource), (aR) => aR.pos.roomName == this.mRoom.name);
    }


    processOperation()
    {
        this.log(LOG_LEVEL.error,'processOperation() '+this.mRoom.name+' container: '+this.mContainers.length+' storage: '+this.mStorage.id);
        this.spawnExtensionHauler();
        this.makeTasks();
        this.doHauling();
    }

    doHauling()
    {
        if (_.isUndefined(this.mCreep) || this.mCreep.spawning) return;

        let aTask = this.mTasks.shift();
        if (_.isUndefined(aTask))
        {
            // TODO: move to idle pos ...
            this.log(LOG_LEVEL.info,' hauler is idle!');
            let aPos = new RoomPosition(26,37,this.mCreep.pos.roomName);
            if (!this.mCreep.pos.isEqualTo(aPos))
            {
                let res = this.mCreep.travelTo({pos: aPos},{range: 0});
            }
            return;
        }


        if (this.mCreep.carry[RESOURCE_ENERGY] == 0)
        {
            if (!this.mCreep.pos.isNearTo(aTask.target))
            {
                let res = this.mCreep.travelTo(aTask.target);
            }
        }
        else
        {
            if (!this.mCreep.pos.isNearTo(aTask.destination))
            {
                let res = this.mCreep.travelTo(aTask.destination);
            }
        }

        if (this.mResources.length > 0)
        {
            var aResource = _.find(this.mResources, (aDrop) => aDrop.pos.isNearTo(this.mCreep));
            if (!_.isUndefined(aResource))
            {
                let res = this.mCreep.pickup(aResource.entity);
            }
        }

        let res =  this.mCreep.withdraw(aTask.target,aTask.resource);
        this.log(LOG_LEVEL.debug,' withdraw - '+ErrorString(res));
        res =  this.mCreep.transfer(aTask.destination,aTask.resource);
        this.log(LOG_LEVEL.debug,' transfer - '+ErrorString(res));
    }

    makeTasks()
    {
        if (!_.isUndefined(this.mStorage) && this.mContainers.length > 0)
        {
            if (this.mStorage.store[RESOURCE_ENERGY] > 0)
            {

                var myContainers =  _.filter(this.mContainers, (aBox) =>
                {
                    if (_.sum(aBox.store) > aBox.storeCapacity * 0.75) return false;
                    return true;
                });
                var aContainer = undefined;
                if (myContainers.length > 0)
                {
                    aContainer = _.min(myContainers, (aBox) => aBox.pos.getRangeTo(this.mCreep));
                }

                if (!_.isUndefined(aContainer))
                {
                    this.mTasks.push(
                    {
                        priority: 0,
                        target: this.mStorage.entity,
                        destination: aContainer.entity,
                        task: 'L',  // link cleaning
                        resource: RESOURCE_ENERGY,
                    });
                }
            }
        }

        this.mTasks = _.sortBy(this.mTasks,'priority');
    }

    spawnExtensionHauler()
    {
        var myCreeps = getCreepsForRole(CREEP_ROLE.extensionHauler);
        var aRoomID = this.mRoom.id;
        this.mCreep = _.find(myCreeps, (aCreep) => aCreep.memory.target == aRoomID);
        if (!_.isUndefined(this.mCreep)) return;

        var aSpawn = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aProxy) =>
        {
            if (aProxy.pos.roomName != this.mRoom.name) return Infinity;
            return aProxy.spawning == null;
        });

        if (_.isUndefined(aSpawn)) return;

        this.log(LOG_LEVEL.debug,'possible spawn - '+aSpawn.name);

        var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        {
            if (_.isUndefined(aCreepMem.target)) return false;
            if (!_.isUndefined(Game.creeps[aCreepName])) return false;
            return aCreepMem.target == aRoomID && aCreepMem.role == CREEP_ROLE.extensionHauler;
        });

        this.log(LOG_LEVEL.debug,'reuse name: '+aName);

        var aCreepBody = new CreepBody();

        // TODO: the carry parts should be adjusted to the current task - so if the task is heavy un/loading
        //       to the terminal/storage it should have more parts otherwise just normal 1
        //
        var aSearch =
        {
            name: CARRY,
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
            [WORK]:
            {
                count: 0, // TODO: consider a work part for repair maybe
            }
        };
        var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);

        this.log(LOG_LEVEL.debug,'body: '+JS(aResult));
        if (aResult.aCost <=  aSpawn.room.energyAvailable)
        {
            let res = aSpawn.createCreep(aResult.body,aName,{role: CREEP_ROLE.extensionHauler, target: aRoomID})
            this.log(LOG_LEVEL.info,'hauler createCreep - '+ErrorString(res));
        }

    }

    log(pLevel,pMsg)
    {
        Log(pLevel,'HaulerOperation '+this.mRoom.name+' : '+pMsg);
    }
}
module.exports = HaulerOperation;
