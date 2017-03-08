class MiningOperation
{
    constructor(pSource)
    {
        this.mSource = pSource;
        this.mTasks = [];
        this.mCreep = undefined;
        this.mHauler = undefined;
        this.mResources = PCache.getFriendlyEntityCache(ENTITY_TYPES.resource);
        this.mTowers = PCache.getFriendlyEntityCache(ENTITY_TYPES.tower);

        // TODO: super iffy - change this ASAP
        /// we need a drop point
        /// lets drop it near the uprade
        this.aDropPos = new RoomPosition(33,39,'W47N84');
        //this.aDropPos = new RoomPosition(20,30,'W47N83');
        // let a = _.find(this.mResources, (aR) => aR.energy > 2000 && aR.pos.isEqualTo(this.aDropPos));
        // if (!_.isUndefined(a))
        // {
        //     this.aDropPos = new RoomPosition(13,33,this.aDropPos.roomName);
        // }
    }


    processOperation()
    {
        Log(LOG_LEVEL.error,'MiningOperation '+this.mSource.pos.toString()+': processOperation() type: '+this.mSource.getSourceType().type);
        this.spawnMiner();
        this.spawnHauler();
        this.makeTasks();
        this.doMining();
        this.doHauling();
    }

    doHauling()
    {
        if (_.isUndefined(this.mHauler) || this.mHauler.spawning) return;

        var aBox = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.container), (aB) => aB.pos.isNearTo(this.mSource));

        if (_.isUndefined(aBox))
        {
            this.log(LOG_LEVEL.error,'hauler has no box near the source '+this.mSource.pos.toString());
            return;
        }

        if (this.mResources.length > 0 && this.aDropPos.getRangeTo(this.mHauler) > 2)
        {
            var aResource = _.find(this.mResources, (aDrop) => aDrop.pos.isNearTo(this.mCreep));
            if (!_.isUndefined(aResource))
            {
                let res = this.mCreep.pickup(aResource.entity);
                //Log(undefined,'RESOURCE:'+ErrorString(res));
            }
        }

        if (_.sum(this.mHauler.carry) == 0)
        {
            if (_.isUndefined(this.mCreep) || !this.mCreep.pos.isEqualTo(aBox.pos))
            {
                this.moveHaulerToIdlePosition(aBox);
                return;
            }

            if (!this.mHauler.pos.isNearTo(aBox))
            {
                let res = this.mHauler.travelTo(aBox);
                this.log(LOG_LEVEL.debug,' hauler '+this.mHauler.name+' move to box '+ErrorString(res));
            }

            let res = this.mHauler.withdraw(aBox.entity,_.findKey(aBox.store));
            this.log(LOG_LEVEL.debug,' hauler '+this.mHauler.name+' grab from box '+ErrorString(res));
        }
        else
        {
            let aTower = _.find(this.mTowers,(aT) => aT.pos.roomName == this.mHauler.pos.roomName && aT.energy < aT.energyCapacity);
            if (!_.isUndefined(aTower))
            {
                if (!this.mHauler.pos.isNearTo(aTower))
                {
                    let res = this.mHauler.travelTo(aTower.entity);
                }
                let res = this.mHauler.transfer(aTower.entity,RESOURCE_ENERGY);
                this.log(LOG_LEVEL.debug,'hauler '+this.mHauler.name+' transfer tower '+aTower.pos.toString());
            }
            else
            {
                let myBays = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.flag),FLAG_TYPE.extensionBay);

                let myDropBoxes = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.container), (aB) =>
                {
                    let aBay = _.find(myBays,(aS) => aS.pos.isEqualTo(aB) && _.sum(aB.store) < aB.storeCapacity*0.75);
                    return !_.isUndefined(aBay);
                });
                let aDropBox = undefined;
                if (myDropBoxes.length > 0)
                {
                    aDropBox = _.min(myDropBoxes,(aB) => aB.pos.getRangeTo(this.mHauler));
                }

                if (!_.isUndefined(aDropBox))
                {
                    if (!this.mHauler.pos.isNearTo(aDropBox))
                    {
                        let res = this.mHauler.travelTo({pos: aDropBox.pos},{range: 1});
                        this.log(LOG_LEVEL.debug,' hauler '+this.mHauler.name+' move to dropbox '+ErrorString(res));
                    }
                    else
                    {
                        let res = this.mHauler.transfer(aDropBox.entity,_.findKey(this.mHauler.carry));
                        this.log(LOG_LEVEL.debug,' hauler '+this.mHauler.name+' transfer to dropBox '+ErrorString(res));
                    }

                }
                else
                {
                    if (!this.mHauler.pos.isEqualTo(this.aDropPos))
                    {
                        let res = this.mHauler.travelTo({pos: this.aDropPos},{range: 0});
                        this.log(LOG_LEVEL.debug,' hauler '+this.mHauler.name+' move to droppos '+ErrorString(res));
                    }
                    else
                    {
                        let res = this.mHauler.drop(_.findKey(this.mHauler.carry));
                        this.log(LOG_LEVEL.debug,' hauler '+this.mHauler.name+' drop to droppos '+ErrorString(res));
                    }
                }
            }
        }
    }

    doMining()
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
                    let res = this.mCreep.pickup(aResource.entity);
                    //Log(undefined,'RESOURCE:'+ErrorString(res));
                }
            }

            let aSourceType = this.mSource.getSourceType();
            if (aSourceType.type == SOURCE_TYPE.drop || (aSourceType.type == SOURCE_TYPE.box && aSourceType.target.store[RESOURCE_ENERGY] < aSourceType.target.storeCapacity))
            {
                let res = this.mCreep.harvest(this.mSource.entity);
            }

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

        var aSpawn = _.min(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aProxy) =>
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
        var myCreeps = getCreepsForRole(CREEP_ROLE.miningHauler);
        var aSourceID = this.mSource.id;
        this.mHauler = _.find(myCreeps, (aCreep) => aCreep.memory.target == aSourceID);

        let aBox = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.container),(aB) => aB.pos.isNearTo(this.mSource));

        if (!_.isUndefined(this.mHauler) && !_.isUndefined(aBox)) return;

        var myRoomSpawns = PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn);  // this should be adjusted to find the closest spawn to unscouted rooms
        var aSpawn = _.min(myRoomSpawns, (aProxy) => aProxy.pos.getRangeTo(this.mSource.pos));

        var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        {
            if (_.isUndefined(aCreepMem.target)) return false;
            return aCreepMem.target == aSourceID && aCreepMem.role == CREEP_ROLE.miningHauler;
        });

        var aCreepBody = new CreepBody();
        var aSearch =
        {
            name: CARRY,
            //max: 1,
        };
        var aBodyOptions =
        {
            hasRoads: true,
            moveBoost: '',
        };

        var aEnergy = aSpawn.room.energyCapacityAvailable;
        var aBody = {};
        var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);

        this.log(LOG_LEVEL.debug,'hauler BODY: '+JS(aResult));

        if (aResult.aCost <=  aSpawn.room.energyAvailable)
        {
            let res = aSpawn.createCreep(aResult.body,aName,{role: CREEP_ROLE.miningHauler, target: aSourceID})
            this.log(LOG_LEVEL.info,'hauler createCreep - '+ErrorString(res));
        }
    }


    moveHaulerToIdlePosition(pBox)
    {
        let aArea = pBox.pos.adjacentPositions(2);
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
                    this.log(LOG_LEVEL.error,'LOOK: '+JS(aPos));
                }
            });
        });

        let aPos = _.min(myPos, (a) => this.mHauler.pos.getRangeTo(a));

        if (!this.mHauler.pos.isEqualTo(aPos))
        {
            let res = this.mHauler.travelTo({pos: aPos}, {range: 0});
            this.log(LOG_LEVEL.info,'hauler '+this.mHauler.name+' moves to idle pos '+ErrorString(res));
        }
    }

    log(pLevel,pMsg)
    {
        Log(pLevel,'MiningOperation '+this.mSource.toString()+': '+pMsg);
    }
}
module.exports = MiningOperation;
