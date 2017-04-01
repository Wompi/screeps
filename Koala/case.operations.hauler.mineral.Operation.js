class MineralHaulerOperation extends Operation
{
    constructor(pRoom)
    {
        super('MineralHaulerOperation');
        this.mRoom = pRoom;
        this.mCreep = undefined;
        this.mExtractor = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.extractor), (aE) => aE.pos.roomName == this.mRoom.name);
        this.mStorage = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.storage), (aE) => aE.pos.roomName == this.mRoom.name);
        this.mContainer = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.container), (aBox) =>
        {
            if (aBox.pos.roomName != this.mRoom.name) return false;
            return _.sum(aBox.getMineralStore()) > 0;
        });
    }

    processOperation()
    {
        this.log(LOG_LEVEL.error,'processOperation() ');
        this.spawnHauler();
        this.doHauling();
    }

    doHauling()
    {
        if (_.isUndefined(this.mCreep) || this.mCreep.spawning) return;

        let aBox = this.mExtractor.miningBox;

        //let aBox = Game.getObjectById('58be89d328c63a1e760f4582');

        if (_.sum(aBox.store) == 0 && !this.mExtractor.isReady() && _.sum(this.mCreep.carry) == 0)
        {
            if (!_.isUndefined(this.mContainer))
            {
                aBox = this.mContainer;
            }
            else
            {
                // TODO: find a way to handle idle state - maybe change him to a extension hauler -  but this is not ready yet
                // fo now we go to a idle pos
                // hmm what to do
                let aPos = new RoomPosition(28,37,'W47N84');
                if (!this.mCreep.pos.isEqualTo())
                {
                    this.mCreep.travelTo({pos: aPos},{range: 0});
                }
                return;
            }
        }

        if (_.sum(this.mCreep.carry) == 0)
        {
            if (!this.mCreep.pos.isNearTo(aBox))
            {
                let res = this.mCreep.travelTo(aBox);
            }

            if (!_.isUndefined(this.mContainer) && aBox.pos.isEqualTo(this.mContainer))
            {
                let res = this.mCreep.withdraw(aBox.entity,_.findKey(aBox.getMineralStore()));
            }
            else
            {
                let res = this.mCreep.withdraw(aBox.entity,_.findKey(aBox.store));
            }
        }
        else if (!_.isUndefined(this.mStorage))
        {
            if (!this.mCreep.pos.isNearTo(this.mStorage))
            {
                let res = this.mCreep.travelTo(this.mStorage);
            }
            let res = this.mCreep.transfer(this.mStorage.entity,_.findKey(this.mCreep.carry));
        }
    }

    spawnHauler()
    {
        var myCreeps = getCreepsForRole(CREEP_ROLE.mineralHauler);
        var aRoomID = this.mRoom.id;
        this.mCreep = _.find(myCreeps, (aCreep) => aCreep.memory.target == aRoomID);
        if (_.isUndefined(this.mExtractor)) return;
        if (!this.mExtractor.isReady()) return;


        if (!_.isUndefined(this.mCreep)) return;

        var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        {
            if (_.isUndefined(aCreepMem.target)) return false;
            if (!_.isUndefined(Game.creeps[aCreepName])) return false;
            return aCreepMem.target == aRoomID && aCreepMem.role == CREEP_ROLE.mineralHauler;
        });

        let aBody = this.getBody();
        let mySpawns = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aS) =>
        {
            return  aS.room.energyAvailable >= aBody.aCost;
        })

        if (mySpawns.length > 0)
        {
            // TODO: this is a bit meh - not sure what a good decission for the spawn is right now - maybe later
            // the distance to the labs or something - or the storage <- this it probably is
            let aSpawn = _.min(mySpawns, (aS) => aS.pos.wpos.getRangeTo(this.mStorage.pos.wpos));

            if (!_.isUndefined(aSpawn))
            {
                if (aSpawn.spawning)
                {
                    this.log(LOG_LEVEL.debug,'possible spawn is bussy - '+aSpawn.name+' '+aSpawn.pos.toString());
                    return;
                }
                this.log(LOG_LEVEL.debug,'possible spawn - '+aSpawn.name+' '+aSpawn.pos.toString());
                this.log(LOG_LEVEL.debug,'possible name - '+aName);

                // TODO: consider a path approach here
                let res = aSpawn.createCreep(aBody.body,aName,{role: CREEP_ROLE.mineralHauler, target: aRoomID, spawn: aSpawn.pos.wpos.serialize()})
                this.log(LOG_LEVEL.info,'hauler createCreep - '+ErrorString(res));
            }
        }
        else
        {
            this.log(LOG_LEVEL.debug,'no spawn room has enough energy - needed: '+aBody.aCost);
        }
    }

    getBody()
    {
        var aCreepBody = new CreepBody();

        // TODO: the carry parts should be adjusted to the current task - so if the task is heavy un/loading
        //       to the terminal/storage it should have more parts otherwise just normal 1
        //
        var aSearch =
        {
            name: CARRY,
            max: 16,
        };
        var aBodyOptions =
        {
            hasRoads: true,
            moveBoost: '',
        };

        var aSpawn = _.max(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aS) => aS.room.energyCapacityAvailable);
        let aEnergy = aSpawn.room.energyCapacityAvailable;
        var aBody ={};
        var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);

        this.log(LOG_LEVEL.debug,'body: '+JS(aResult));
        return aResult;
    }
}
module.exports = MineralHaulerOperation;
