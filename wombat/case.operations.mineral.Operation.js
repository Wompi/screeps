class MineralOperation
{
    constructor(pExtractor)
    {
        this.mExtractor = pExtractor;
        this.mCreep = undefined;
        this.mHauler = undefined;
    }

    processOperation()
    {
        Log(LOG_LEVEL.error, 'MineralOperation: processOperation() ..... ');

        let ttr = this.mExtractor.mineralSource.ticksToRegeneration;
        let ma = this.mExtractor.mineralSource.mineralAmount;

        Log(LOG_LEVEL.debug,'MineralOperation: ticksToRegeneration: '+ttr+' amount: '+ ma)

        if (_.isUndefined(this.mExtractor.mineralSource.mineralBox))
        {
            Log(LOG_LEVEL.error,'MineralOperation: mineral source '+this.mExtractor.mineralSource.pos.toString()+' has no dropBox - build one first!');
            return;
        }
        if (!_.isUndefined(this.mExtractor.mineralSource.ticksToRegeneration))
        {
            var myCreeps = getCreepsForRole(CREEP_ROLE.mineral);
            var aMineralID = this.mExtractor.mineralSource.id;
            this.mCreep = _.find(myCreeps, (aCreep) => aCreep.memory.target == aMineralID);

            if (!_.isUndefined(this.mCreep))
            {
                this.moveMinerToRecyclePosition();
            }


            var myCreeps = getCreepsForRole(CREEP_ROLE.mineralHauler);
            var aMineralID = this.mExtractor.mineralSource.id;
            this.mHauler = _.find(myCreeps, (aCreep) => aCreep.memory.target == aMineralID);
            if (!_.isUndefined(this.mHauler))
            {
                this.doMineralHauling();
            }
            return;
        }

        this.spawnMineralMiner();
        this.spawnMineralHauler();
        this.doMineralMining();
        this.doMineralHauling();
    }

    doMineralHauling()
    {
        if (_.isUndefined(this.mHauler) || this.mHauler.spawning) return;

        var aBox = this.mExtractor.mineralSource.mineralBox;
        var aStorage = _.find(PCache.getEntityCache(ENTITY_TYPES.storage), (aProxy) => aProxy.pos.roomName == this.mExtractor.pos.roomName);

        if (_.sum(this.mHauler.carry) == 0)
        {
            if (_.isUndefined(this.mCreep) || !this.mCreep.pos.isEqualTo(aBox.pos))
            {
                this.moveHaulerToIdlePosition(aBox);
                return;
            }

            if (!this.mHauler.pos.isNearTo(aBox))
            {
                let res = this.mHauler.travelTo(this.mExtractor.mineralSource.mineralBox);
                Log(LOG_LEVEL.debug,'MineralOperation: hauler '+this.mHauler.name+' move to box '+ErrorString(res));
            }

            let res = this.mHauler.withdraw(aBox.entity,_.findKey(aBox.store));
            Log(LOG_LEVEL.debug,'MineralOperation: hauler '+this.mHauler.name+' grab from box '+ErrorString(res));
        }
        else
        {
            if (!this.mHauler.pos.isNearTo(aStorage))
            {
                let res = this.mHauler.travelTo(aStorage.entity);
                Log(LOG_LEVEL.debug,'MineralOperation: hauler '+this.mHauler.name+' move to storage '+ErrorString(res));
            }

            let res = this.mHauler.transfer(aStorage.entity,_.findKey(this.mHauler.carry));
            Log(LOG_LEVEL.debug,'MineralOperation: hauler '+this.mHauler.name+' drop to storage '+ErrorString(res));
        }
    }


    doMineralMining()
    {
        if (_.isUndefined(this.mCreep) || this.mCreep.spawning) return;

        let aBox = this.mExtractor.mineralSource.mineralBox;
        if (!this.mCreep.pos.isEqualTo(aBox))
        {
            let res = this.mCreep.travelTo(aBox,{range: 0});
            Log(LOG_LEVEL.debug,'MineralOperation: '+this.mCreep.name+' move: '+ErrorString(res));
        }

        if (_.sum(aBox.store) <= (aBox.storeCapacity - (this.mCreep.getActiveBodyparts(WORK) * HARVEST_MINERAL_POWER)))
        {
            let res = this.mCreep.harvest(this.mExtractor.mineralSource.entity);
            Log(LOG_LEVEL.debug,'MineralOperation: '+this.mCreep.name+' harvest: '+ErrorString(res));
        }
    }

    spawnMineralHauler()
    {
        var myCreeps = getCreepsForRole(CREEP_ROLE.mineralHauler);
        var aMineralID = this.mExtractor.mineralSource.id;
        this.mHauler = _.find(myCreeps, (aCreep) => aCreep.memory.target == aMineralID);
        if (!_.isUndefined(this.mHauler)) return;

        var myRoomSpawns = _.filter(PCache.getEntityCache(ENTITY_TYPES.spawn), (aProxy) => aProxy.pos.roomName == this.mExtractor.pos.roomName);  // this should be adjusted to find the closest spawn to unscouted rooms
        var aSpawn = _.min(myRoomSpawns, (aProxy) => aProxy.pos.getRangeTo(this.mExtractor.pos));

        var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        {
            if (_.isUndefined(aCreepMem.target)) return false;
            return aCreepMem.target == aMineralID && aCreepMem.role == CREEP_ROLE.mineralHauler;
        });

        var aCreepBody = new CreepBody();
        var aSearch =
        {
            name: CARRY,
            max: 1,
        };
        var aBodyOptions =
        {
            hasRoads: true,
            moveBoost: '',
        };

        var aEnergy = aSpawn.room.energyCapacityAvailable;
        var aBody = {};
        var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);

        Log(LOG_LEVEL.debug,'hauler BODY: '+JS(aResult));

        if (aResult.aCost <=  aSpawn.room.energyAvailable)
        {
            let res = aSpawn.createCreep(aResult.body,aName,{role: CREEP_ROLE.mineralHauler, target: aMineralID})
            Log(LOG_LEVEL.info,'MineralOperation: hauler createCreep - '+ErrorString(res));
        }
    }

    spawnMineralMiner()
    {
        var myCreeps = getCreepsForRole(CREEP_ROLE.mineral);
        var aMineralID = this.mExtractor.mineralSource.id;
        this.mCreep = _.find(myCreeps, (aCreep) => aCreep.memory.target == aMineralID);
        if (!_.isUndefined(this.mCreep)) return;

        var myRoomSpawns = _.filter(PCache.getEntityCache(ENTITY_TYPES.spawn), (aProxy) => aProxy.pos.roomName == this.mExtractor.pos.roomName);  // this should be adjusted to find the closest spawn to unscouted rooms
        var aSpawn = _.min(myRoomSpawns, (aProxy) => aProxy.pos.getRangeTo(this.mExtractor.pos));

        //Log(LOG_LEVEL.debug,'MineralOperation: spawnMineralMiner - possible spawn: '+aSpawn.name+' '+aSpawn.pos+' id: '+aMineralID);

        var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        {
            if (_.isUndefined(aCreepMem.target)) return false;
            return aCreepMem.target == aMineralID && aCreepMem.role == CREEP_ROLE.mineral;
        });

        //Log(LOG_LEVEL.debug,'Old name: '+aName);

        var aCreepBody = new CreepBody();
        var aSearch =
        {
            name: WORK,
            //max: 5,
        };
        var aBodyOptions =
        {
            hasRoads: true,
            moveBoost: '',
        };

        var aEnergy = aSpawn.room.energyCapacityAvailable;
        var aBody = {};
        var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);

        //Log(LOG_LEVEL.debug,'BODY: '+JS(aResult));
        if (aResult.aCost <=  aSpawn.room.energyAvailable)
        {
            let res = aSpawn.createCreep(aResult.body,aName,{role: CREEP_ROLE.mineral, target: aMineralID})
            Log(LOG_LEVEL.info,'MineralOperation: miner createCreep - '+ErrorString(res));
        }
    }

    moveHaulerToIdlePosition(pBox)
    {
        let aArea = pBox.pos.adjacentPositions(1);
        let myPos = [];
        _.each(aArea, (a,x) =>
        {
            _.each(a, (ia,y) =>
            {
                let aPos = new RoomPosition(x,y,pBox.pos.roomName);
                let aLook = _.find(_.map(aPos.look(),'type'), (a) => a == 'structure');
                if (_.isUndefined(aLook))
                {
                    myPos.push(aPos);
                    Log(LOG_LEVEL.error,'LOOK: '+JS(aPos));
                }
            });
        });

        let aPos = _.min(myPos, (a) => this.mHauler.pos.getRangeTo(a));

        if (!this.mHauler.pos.isEqualTo(aPos))
        {
            let res = this.mHauler.travelTo({pos: aPos}, {range: 0});
            Log(LOG_LEVEL.info,'MineralOperation: hauler '+this.mHauler.name+' moves to idle pos '+ErrorString(res));
        }
    }

    moveMinerToRecyclePosition()
    {
        var aSpawn = _.min(PCache.getEntityCache(ENTITY_TYPES.spawn), (aProxy) => aProxy.pos.getRangeTo(this.mCreep));
        var aBox = _.find(PCache.getEntityCache(ENTITY_TYPES.container), (aProxy) => aProxy.pos.isNearTo(aSpawn));

        if (!this.mCreep.pos.isEqualTo(aBox))
        {
            let res = this.mCreep.travelTo(aBox,{range: 0});
            Log(LOG_LEVEL.info,'MineralOperation: miner moves to recycle  - '+ErrorString(res));
        }
        else
        {
            let res = aSpawn.recycleCreep(this.mCreep);
            Log(LOG_LEVEL.info,'MineralOperation: recycle miner - '+ErrorString(res));
        }
    }
}
module.exports = MineralOperation;
