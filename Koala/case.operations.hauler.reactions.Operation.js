class ReactionsHaulerOperation extends Operation
{
    constructor(pRoom)
    {
        super('ReactionsHaulerOperation');
        this.mRoom = pRoom;
        this.mCreep = undefined;
        this.mLabs = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.lab), (aL) => aL.pos.roomName == this.mRoom.name);
        this.mStorage = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.storage), (aS) => aS.pos.roomName == this.mRoom.name);
    }

    processOperation()
    {
        this.log(LOG_LEVEL.error,'processOperation()');
        this.spawnHauler();
        this.doHauling();
    }

    // TODO: this is entierly hardcoded for now so don't bother with it
    doHauling()
    {
        if (_.isUndefined(this.mCreep) || this.mCreep.spawning) return;

        let L1 = Game.getObjectById('58c5c13b5db9be905ff56242');  // 20 33
        let L2 = Game.getObjectById('58c7cf5fb92edd4d1f2468fd');  // 21 32
        let L3 = Game.getObjectById('58c69c436d32f4c443c76bcb');  // 22 33

        this.log(undefined,JS(L3.cooldown));
        if (L3.cooldown == 0)
        {
            let aReaction = L3.runReaction(L1,L2);
        }


        let aGrabType = 'L';

        if ((L1.mineralAmount > 100 && L2.mineralAmount > 100)
                || _.isUndefined(this.mStorage.store['L']) || this.mStorage.store['L'] < 50
                || _.isUndefined(this.mStorage.store['H']) || this.mStorage.store['H'] < 50
                )
        {
            // TODO: move to a proper idle position;
            this.mCreep.travelTo({pos: new RoomPosition(28,36,this.mCreep.pos.roomName)});
            return;
        }

        if (_.sum(this.mCreep.carry) == 0)
        {
            if(!this.mCreep.pos.isNearTo(this.mStorage))
            {
                let res = this.mCreep.travelTo(this.mStorage.entity);
            }
        }

        if (_.isUndefined(this.mCreep.carry['H']) && this.mCreep.pos.isNearTo(this.mStorage))
        {
            let res = this.mCreep.withdraw(this.mStorage.entity,'H',_.floor(this.mCreep.carryCapacity/2));
            //this.log(undefined,'H - '+ErrorString(res));
            return;
        }
        if (_.isUndefined(this.mCreep.carry['L']) && this.mCreep.pos.isNearTo(this.mStorage))
        {
            let res = this.mCreep.withdraw(this.mStorage.entity,'L',_.floor(this.mCreep.carryCapacity/2));
            //this.log(undefined,'L - '+ErrorString(res));
            return;
        }




        this.log(undefined,'derp');
        if (!_.isUndefined(this.mCreep.carry['H']))
        {
            if (!this.mCreep.pos.isNearTo(L1))
            {
                let res = this.mCreep.travelTo(L1);
            }
            let res = this.mCreep.transfer(L1,'H');
            this.log(undefined,'H derp - '+ErrorString(res));
        }
        else if (!_.isUndefined(this.mCreep.carry['L']))
        {
            if (!this.mCreep.pos.isNearTo(L2))
            {
                let res = this.mCreep.travelTo(L2);
            }
            let res = this.mCreep.transfer(L2,'L');
            this.log(undefined,'L derp - '+ErrorString(res));
        }
    }

    spawnHauler()
    {
        var myCreeps = getCreepsForRole(CREEP_ROLE.reactionHauler);
        var aRoomID = this.mRoom.id;
        this.mCreep = _.find(myCreeps, (aCreep) => aCreep.memory.target == aRoomID);
        if (this.mLabs.length == 0) return;

        if (!_.isUndefined(this.mCreep)) return;

        var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        {
            if (_.isUndefined(aCreepMem.target)) return false;
            if (!_.isUndefined(Game.creeps[aCreepName])) return false;
            return aCreepMem.target == aRoomID && aCreepMem.role == CREEP_ROLE.reactionHauler;
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
            let aRoomCenter = new RoomPosition(25,25,this.mRoom.name);
            let aSpawn = _.min(mySpawns, (aS) => aS.pos.wpos.getRangeTo(aRoomCenter.wpos));

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
                let res = aSpawn.createCreep(aBody.body,aName,{role: CREEP_ROLE.reactionHauler, target: aRoomID, spawn: aSpawn.pos.wpos.serialize()});
                this.log(LOG_LEVEL.info,'reserver createCreep - '+ErrorString(res));
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

        var aSpawn = _.max(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aS) => aS.room.energyCapacityAvailable);
        let aEnergy = aSpawn.room.energyCapacityAvailable;
        var aSearch =
        {
            name: CARRY,
            max: 2,
        };
        var aBodyOptions = { hasRoads: true, moveBoost: '',};
        var aBody = { }
        var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);

        this.log(LOG_LEVEL.debug,'body: '+JS(aResult));
        return aResult;
    }
}
module.exports = ReactionsHaulerOperation;
