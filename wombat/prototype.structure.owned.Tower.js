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
