class HaulerOperation
{
    constructor(pRoom)
    {
        this.mRoom = pRoom;
        this.mExtensionCreep = undefined;
        this.mTasks = [];

        this.mContainers = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.container), (aBox) => aBox.pos.roomName == this.mRoom.name);
        this.mStorage = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.storage), (aStorage) => aStorage.pos.roomName == this.mRoom.name);
        this.mSources = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.source), (aSource) => aSource.pos.roomName == this.mRoom.name);
        this.mMineral = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.mineral), (aSource) => aSource.pos.roomName == this.mRoom.name);

        this.mTowers = PCache.getFriendlyEntityCache(ENTITY_TYPES.tower);

        this.mResources = PCache.getFriendlyEntityCache(ENTITY_TYPES.resource);
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
        if (_.isUndefined(this.mExtensionCreep) || this.mExtensionCreep.spawning) return;

        let aTask = this.mTasks.shift();
        if (_.isUndefined(aTask))
        {
            // TODO: move to idle pos ...
            this.log(LOG_LEVEL.info,' hauler is idle!');
            let aPos = new RoomPosition(31,26,this.mExtensionCreep.pos.roomName);
            if (!this.mExtensionCreep.pos.isEqualTo(aPos))
            {
                let res = this.mExtensionCreep.travelTo({pos: aPos},{range: 0});
            }
            return;
        }




        if (this.mExtensionCreep.carry[RESOURCE_ENERGY] == 0)
        {
            if (!this.mExtensionCreep.pos.isNearTo(aTask.target))
            {
                let res = this.mExtensionCreep.travelTo(aTask.target);
            }
        }
        else
        {
            if (!this.mExtensionCreep.pos.isNearTo(aTask.destination))
            {
                let res = this.mExtensionCreep.travelTo(aTask.destination);
            }
        }

        if (this.mResources.length > 0)
        {
            var aResource = _.find(this.mResources, (aDrop) => aDrop.pos.isNearTo(this.mExtensionCreep));
            if (!_.isUndefined(aResource))
            {
                let res = this.mExtensionCreep.pickup(aResource.entity);
            }
        }

        let res =  this.mExtensionCreep.withdraw(aTask.target,aTask.resource);
        this.log(LOG_LEVEL.debug,' withdraw - '+ErrorString(res));
        res =  this.mExtensionCreep.transfer(aTask.destination,aTask.resource);
        this.log(LOG_LEVEL.debug,' transfer - '+ErrorString(res));
    }

    makeTasks()
    {
        if (this.mTowers.length > 0)
        {
            let aTower = _.find(this.mTowers,(aT) => aT.pos.roomName == this.mExtensionCreep.pos.roomName && aT.energy < aT.energyCapacity);
            if (!_.isUndefined(aTower))
            {
                this.mTasks.push(
                {
                    priority: 0,
                    target: undefined,
                    destination: aTower.entity,
                    task: 'T',  // link cleaning
                    resource: RESOURCE_ENERGY,
                });
            }
        }


        if (!_.isUndefined(this.mStorage) && this.mContainers.length > 0)
        {
            if (this.mStorage.store[RESOURCE_ENERGY] > 0)
            {

                var myContainers =  _.filter(this.mContainers, (aBox) =>
                {
                    if (_.sum(aBox.store) > aBox.storeCapacity * 0.5) return false;

                    let aSource = _.find(this.mSources, (aSource) => aSource.pos.isNearTo(aBox));
                    if (!_.isUndefined(aSource)) return false;
                    let aMineral = _.find(this.mMineral, (aMin) => aMin.pos.isNearTo(aBox));
                    if (!_.isUndefined(aMineral)) return false;



                    return true;
                });
                var aContainer = undefined;
                if (myContainers.length > 0)
                {
                    aContainer = _.min(myContainers, (aBox) => aBox.pos.getRangeTo(this.mExtensionCreep));
                }

                if (!_.isUndefined(aContainer))
                {
                    this.mTasks.push(
                    {
                        priority: 0.1,
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
        this.mExtensionCreep = _.find(myCreeps, (aCreep) => aCreep.memory.target == aRoomID);
        if (!_.isUndefined(this.mExtensionCreep)) return;

        var aSpawn = _.find(PCache.getEntityCache(ENTITY_TYPES.spawn), (aProxy) =>
        {
            if (!aProxy.my) return Infinity;
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
            max: 8,
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
