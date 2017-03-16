class ReserveOperation extends Operation
{
    constructor(pNames,pRoom)
    {
        super('ReserveOperation');
        this.RESERVE_ROOM = pRoom[0];
        this.mCreepNames = pNames
        this.mCreeps = undefined;

        this.mReservePosition = this.searchReserveRoom();
    }

    processOperation()
    {
        this.log(LOG_LEVEL.error,'processOperation() ');
        this.spawnReserver();

        _.each(this.mCreeps, (aCreep) => this.doReserving(aCreep));
    }

    doReserving(pCreep)
    {
        if (pCreep.spawning) return;

        if (_.isUndefined(this.mReservePosition))
        {
            this.log(LOG_LEVEL.info,'reserver is IDLE! - move it somewhere! FIX THIS');
            return;
        }

        if (!pCreep.pos.isNearTo(this.mReservePosition))
        {
            let res = pCreep.travelTo({pos: this.mReservePosition});
            this.log(LOG_LEVEL.debug,pCreep.name+' moves to '+this.mReservePosition.toString()+' res: '+ErrorString(res));
        }
        else
        {
            let aController = _.find(PCache.getAllEntityCache(ENTITY_TYPES.controller), (aC) => aC.pos.isNearTo(pCreep.pos));

            if (_.isUndefined(aController))
            {
                //aController = PCache.derpRegisterEntity(this.mCreep.room.controller); // TODO: this is just a fallback for not registered controllers - fix this
            }

            this.log(LOG_LEVEL.info,'CONTROLLER: '+aController.pos.toString()+JS(aController));
            let res = pCreep.reserveController(aController.entity);
            this.log(LOG_LEVEL.debug,pCreep.name+' reserve '+aController.pos.toString()+' res: '+ErrorString(res));
        }
    }

    spawnReserver()
    {
        if (_.isUndefined(this.mReservePosition)) return; // INFO: none of our controllers needs reserving

        var myCreeps = getCreepsForRole(CREEP_ROLE.reserver);   // can be 0-none 1-normal 2-reinforced
        this.mCreeps = _.filter(myCreeps, (aC) => _.find(this.mCreepNames, (aN) => aC.name == aN)); // filter for this operation

        if (this.mCreeps.length > 1) return; // we have a reinforced creep allready

        let aName = this.mCreepNames[0];
        if (this.mCreeps.length == 1) // check the one for live time
        {
            this.log(LOG_LEVEL.debug, 'WHAT!');
            // TODO: the distance by range is not very good but it has to do for now
            let aCreep = this.mCreeps[0];
            let aTravelRange = _.isUndefined(aCreep.memory.travelRange) ? 0 : aCreep.memory.travelRange;
            let aRest = aCreep.ticksToLive - aTravelRange - aCreep.spawnTime;
            if (_.gt(aRest,0))
            {
                this.log(LOG_LEVEL.debug, 'all good ('+aRest+'|'+aCreep.ticksToLive+'|'+(aCreep.ticksToLive-aRest)+')!');
                return; // the creep is still healthy no need to spawn the next one
            }
            if (aName == aCreep.name) aName = this.mCreepNames[1];
        }

        this.log(LOG_LEVEL.debug, 'DERP!');
        let aBody = this.getBody();

        let mySpawns = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aS) =>
        {
            return  aS.room.energyAvailable >= aBody.aCost;
        })

        if (mySpawns.length > 0)
        {
            // TODO: consider path length instead of range - can be trouble with complicated rooms
            let aSpawn = _.min(mySpawns, (aS) => aS.pos.getRangeTo(this.mReservePosition));

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
                let aRange = PMan.getCleanPath(aSpawn.pos,this.mReservePosition).path.length;
                let res = aSpawn.createCreep(aBody.body,aName,{role: CREEP_ROLE.reserver, travelRange: aRange, spawn: aSpawn.pos.wpos.serialize()});
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
        var aSearch = {};
        var aBodyOptions = { hasRoads: false, moveBoost: '',};
        var aBody = { [CLAIM]: { count: 2,}}
        var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);

        this.log(LOG_LEVEL.debug,'body: '+JS(aResult));
        return aResult;
    }

    searchReserveRoom()
    {
        return new RoomPosition(35,23,this.RESERVE_ROOM);
    }
}
module.exports = ReserveOperation;
