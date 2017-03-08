/**
 * Formulas are calculated from the api page and the values can change - so be aware of it
 *
 * REPAIR:
 *      x  = (800 - 200)/ (20 - 5)
 *      x = 40
 *
 * HEAL
 *      x  = (400 - 100)/ (20 - 5)
 *      x = 20
 *
 * ATTACK
 *      x  = (600 - 150)/ (20 - 5)
 *      x = 30
 *
 * THIS is unaffected from api changes - consider this maybe - simple linear regression
 *
 * var d_far = valueClose * (1 - TOWER_FALLOFF);
 * var d_close = valueClose;
 * var r_far = TOWER_FALLOFF_RANGE;
 * var r_close = TOWER_OPTIMAL_RANGE;
 * var result = _.max([ d_far , _.min( [d_close,((d_far - d_close)/(r_far-r_close))*(range-r_close)+d_close])]);
 * return result;
 */
StructureTower.prototype.calculateTowerEffectiveness = function(pRange, pTowerTaskPower)
{
    let POWER_FACTOR =
    {
        [TOWER_POWER_REPAIR]: 40,
        [TOWER_POWER_HEAL]: 20,
        [TOWER_POWER_ATTACK]: 30,
    }

    if (pRange <= TOWER_OPTIMAL_RANGE)
    {
        return pTowerTaskPower;
    }
    else if (pRange >= TOWER_FALLOFF_RANGE)
    {
        pRange = TOWER_FALLOFF_RANGE;
    }
    return pTowerTaskPower - ((pRange - 5) * POWER_FACTOR[pTowerTaskPower]);
};

/**
 * This one should caclulate the damage a tower can do till the target can reach the exit
 *
 */
StructureTower.prototype.calculateDamageTillBorder = function(pPos,pHealPower = 0)
{
    let aDmg = 0;
    Pro.profile( () =>
    {
        let myRoomExits = this.room.findLocalExits(true);
        Log(LOG_LEVEL.debug,'STRUCTURE TOWER: exits - '+JS(myRoomExits));


        let aRange = pPos.getRangeTo(this.pos);
        aDmg = this.calculateTowerEffectiveness(aRange,TOWER_POWER_ATTACK);

        let myClosestExits = _.map(myRoomExits, (aE,aKey) =>
        {
            let aMin =  _.min(aE, (a) => pPos.getRangeTo(a[0],a[1]));
            return aMin;
        });
        let aClosestExit = _.min(myClosestExits, (a) => pPos.getRangeTo(a[0],a[1]));

        let aPath = PathFinder.search(pPos,new RoomPosition(aClosestExit[0],aClosestExit[1],this.pos.roomName));

        this.room.visual.poly(aPath.path,{lineStyle: 'dashed'});

        Log(LOG_LEVEL.debug,JS(aPath));

        _.each(aPath.path, (aP) =>
        {
            let aTickDmg = this.calculateTowerEffectiveness(aP.getRangeTo(this.pos),TOWER_POWER_ATTACK);
            aDmg = aDmg + aTickDmg - pHealPower;
            Log(undefined,'DMG: '+aDmg+' aTickDmg: '+aTickDmg);
        })

        Log(LOG_LEVEL.debug,'CLOSEST: '+JS(aClosestExit)+' RANGE: '+aRange+' DMG: '+aDmg);
        this.room.visual.circle(pPos);

    },'tower');
    return aDmg;
}




StructureTower.prototype.getStatus = function()
{
    if (this.energy == this.energyCapacity)
    {
        return {status: FILL_STATUS.isFull, needs: 0};
    }
    else if (this.energy == 0)
    {
        return {status: FILL_STATUS.isEmpty, needs: this.energyCapacity};
    }
    else
    {
        return {status: FILL_STATUS.isPartial, needs: (this.energyCapacity - this.energy) };
    }
}
