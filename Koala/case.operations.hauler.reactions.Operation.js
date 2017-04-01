class ReactionsHaulerOperation extends Operation
{
    constructor(pRoom,pName,pLabIDs,pTypes,pPos,pUnload)
    {
        super('ReactionsHaulerOperation');
        this.mLabIDs = pLabIDs;
        this.mTypes = pTypes;
        this.mUnload = pUnload;
        this.mPos = pPos;
        this.mRoom = pRoom;
        this.mName = pName;
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

        let L1 = Game.getObjectById(this.mLabIDs[0]);  // 20 33
        let L2 = Game.getObjectById(this.mLabIDs[1]);  // 21 32
        let L3 = Game.getObjectById(this.mLabIDs[2]);  // 22 33

        this.log(undefined,JS(L3.cooldown));
        if (L3.cooldown == 0)
        {
            let aReaction = L3.runReaction(L1,L2);
        }


        let aGrabType = this.mTypes[0];


        let derpRes = this.doResultHauling(L3);


        //this.log(undefined,'result empty - no reaction type '+JS(aResult)+' '+this.mTypes[2]);

        if (_.sum(this.mCreep.carry) == 0 && L3.mineralAmount < 1000)
        {
            if ((L1.mineralAmount > 100 && L2.mineralAmount > 100)
                    || _.isUndefined(this.mStorage.store[this.mTypes[0]]) || this.mStorage.store[this.mTypes[0]] < 50
                    || _.isUndefined(this.mStorage.store[this.mTypes[1]]) || this.mStorage.store[this.mTypes[1]] < 50

                    )
            {
                    // TODO: move to a proper idle position;
                    this.mCreep.travelTo({pos: new RoomPosition(this.mPos[0],this.mPos[1],this.mCreep.pos.roomName)});
                    return;
            }
        }

        if (_.sum(this.mCreep.carry) == 0 || !_.isUndefined(this.mCreep.carry[this.mTypes[2]]))
        {
            if(!this.mCreep.pos.isNearTo(this.mStorage))
            {
                let res = this.mCreep.travelTo(this.mStorage.entity);
            }
            else
            {
                if (!_.isUndefined(this.mCreep.carry[this.mTypes[2]]))
                {
                    let res = this.mCreep.transfer(this.mStorage.entity,this.mTypes[2]);
                    return;
                }
            }
        }

        // if (!_.isUndefined(this.mCreep.carry[this.mTypes[2]]) && this.mCreep.pos.isNearTo(this.mStorage))
        // {
        //     let res = this.mCreep.transfer(this.mStorage.entity,this.mTypes[2]);
        //     return;
        // }

        if (!_.isUndefined(this.mStorage.store[this.mTypes[1]]) && _.isUndefined(this.mCreep.carry[this.mTypes[1]]) && this.mCreep.pos.isNearTo(this.mStorage))
        {
            this.log(undefined,'derp A');
            let res = this.mCreep.withdraw(this.mStorage.entity,this.mTypes[1],_.floor(this.mCreep.carryCapacity/2));

            // TODO: this whole reaction hauler thing is a mess - dont even try to understand it
            this.mCreep.cancelOrder('move');
            return;
        }
        if ( !_.isUndefined(this.mStorage.store[this.mTypes[0]]) && _.isUndefined(this.mCreep.carry[this.mTypes[0]]) && this.mCreep.pos.isNearTo(this.mStorage))
        {
            this.log(undefined,'derp B');
            let res = this.mCreep.withdraw(this.mStorage.entity,this.mTypes[0],_.min([this.mStorage.store[this.mTypes[0]],_.floor(this.mCreep.carryCapacity/2)]));
            return;
        }

        if (!_.isUndefined(this.mCreep.carry[this.mTypes[0]]))
        {
            if (!this.mCreep.pos.isNearTo(L1))
            {
                let res = this.mCreep.travelTo(L1);
            }
            let res = this.mCreep.transfer(L1,this.mTypes[0]);
        }
        else if (!_.isUndefined(this.mCreep.carry[this.mTypes[1]]))
        {
            if (!this.mCreep.pos.isNearTo(L2))
            {
                let res = this.mCreep.travelTo(L2);
            }
            let res = this.mCreep.transfer(L2,this.mTypes[1]);
        }
        else if (this.mUnload && L3.mineralAmount > 0 && _.sum(this.mCreep.carry) == 0)
        {
            if (!this.mCreep.pos.isNearTo(L3))
            {
                let res = this.mCreep.travelTo(L3);
            }
            let res = this.mCreep.withdraw(L3,this.mTypes[2]);
        }
    }

    doResultHauling(pL3)
    {
        if (!this.mUnload) return false;
        if (_.sum(this.mCreep.carry) > 0) return false;

        if (pL3.mineralAmount > 0)
        {
            if (!this.mCreep.pos.isNearTo(pL3))
            {
                let res = this.mCreep.travelTo(pL3);
            }
            else
            {
                let res = this.mCreep.withdraw(pL3,this.mTypes[2]);
                return true;
            }
        }
        return false;
    }



    spawnHauler()
    {
        var myCreeps = getCreepsForRole(CREEP_ROLE.reactionHauler);
        var aRoomID = this.mRoom.id;
        this.mCreep = _.find(myCreeps, (aCreep) => aCreep.memory.target == aRoomID && aCreep.name == this.mName);
        if (this.mLabs.length == 0) return;

        if (!_.isUndefined(this.mCreep)) return;

        // var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        // {
        //     if (_.isUndefined(aCreepMem.target)) return false;
        //     if (!_.isUndefined(Game.creeps[aCreepName])) return false;
        //     return aCreepMem.target == aRoomID && aCreepMem.role == CREEP_ROLE.reactionHauler;
        // });

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
                //this.log(LOG_LEVEL.debug,'possible name - '+aName);

                // TODO: consider a path approach here
                let res = aSpawn.createCreep(aBody.body,this.mName,{role: CREEP_ROLE.reactionHauler, target: aRoomID, spawn: aSpawn.pos.wpos.serialize()});
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
