class MineralOperation
{
    constructor(pCount,pExtractor)
    {
        this.mExtractor = pExtractor;
        this.mRoom = this.mExtractor.room;
        this.mCreep = undefined;
        this.mCount = pCount;
        this.mResources =  _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.resource), (aR) => aR.pos.roomName == this.mRoom.name);

    }

    processOperation()
    {
        this.log(LOG_LEVEL.error,'processOperation() '+this.mCount+' extractor - '+this.mExtractor.pos.toString());
        this.spawnMiner();
        this.doMining();
    }

    doMining()
    {
        if (_.isUndefined(this.mCreep) || this.mCreep.spawning) return;

        if (this.mResources.length > 0)
        {
            var aResource = _.find(this.mResources, (aDrop) => aDrop.pos.isNearTo(this.mCreep));
            if (!_.isUndefined(aResource))
            {
                let res = this.mCreep.pickup(aResource.entity);
            }
        }

        if (!this.mExtractor.isReady())
        {
            this.mCreep.memory.role = CREEP_ROLE.upgrader;
            // TODO: the creep should have some mineral loaded get rid of it before you chnage it to upgrader back
            // because a upgrader can not handle minerals nad will dropp it on dead then the other upgrader
            // pick it up again and again
            let aBox = this.mExtractor.miningBox;
            let res = this.mCreep.transfer(aBox.entity,_.findKey(this.mCreep.carry));
            return;
        }



        if (!this.mCreep.pos.isNearTo(this.mExtractor))
        {
            let res = this.mCreep.travelTo(this.mExtractor);
            this.log(LOG_LEVEL.debug,this.mCreep.name+' moves to extractor '+this.mExtractor.pos.toString()+' res: '+ErrorString(res));
        }
        else
        {
            let aBox = this.mExtractor.miningBox;
            let aDelta =  this.mCreep.carryCapacity - _.sum(this.mCreep.carry);
            let aPower = this.mCreep.getHarvestPower(HARVEST_MINERAL_POWER);
            if (_.sum(aBox.store) < aBox.storeCapacity ) //&& _.lt(aDelta,aPower))
            {
                // TODO: this is a fallback when the mining position is not near the box - very unlikly but in case it happens
                // moveTo instead of travel because it should not ignore creeps and should be only 1-2 stepps
                if (!this.mCreep.pos.isNearTo(aBox))
                {
                    let res = this.mCreep.moveTo(aBox.entity, {reusePath: 0});
                    this.log(LOG_LEVEL.debug,this.mCreep.name+' moves to box '+aBox.pos.toString()+' res: '+ErrorString(res));

                }
                let res = this.mCreep.transfer(aBox.entity,_.findKey(this.mCreep.carry));
                this.log(LOG_LEVEL.debug,this.mCreep.name+' transfers to box '+aBox.pos.toString()+' res: '+ErrorString(res));
            }


            if (this.mExtractor.cooldown == 0 && _.gte(aDelta,aPower))
            {
                let res = this.mCreep.harvest(this.mExtractor.mineral.entity);
                this.log(LOG_LEVEL.debug,this.mCreep.name+' havests at extractor '+this.mExtractor.pos.toString()+' res: '+ErrorString(res));
            }
        }
    }

    spawnMiner()
    {

        var myCreeps = getCreepsForRole(CREEP_ROLE.mineral);
        this.mCreep = myCreeps[this.mCount]; // TODO: notsure if this is a good solution - every builderoperation has a number so it might work
        if (!this.mExtractor.isReady()) return;
        if (!_.isUndefined(this.mCreep)) return;

        // TODO: lets see if this works - if we have upgraders make them to minerals for the time the mineral site is valid
        var myUpgraderCreeps = getCreepsForRole(CREEP_ROLE.upgrader);
        if (myUpgraderCreeps.length > 0)
        {
            let aCreep = _.min(myUpgraderCreeps, (aC) =>
            {
                if (aC.spawning) return -Infinity;
                if (_.sum(aC.carry) > 0) return -Infinity; // let the upgrader finish his energy and then he can come over to mine mineral
                return aC.ticksToLive;
            });
            aCreep.memory.role = CREEP_ROLE.mineral;
            return;
        }
    }

    log(pLevel,pMsg)
    {
        Log(pLevel,'MineralOperation: '+pMsg);
    }
}
module.exports = MineralOperation;
