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
StructureTower.prototype.calculateDamageTillBorder = function(pPos, pTowerTaskPower)
{
    Pro.profile( () =>
    {
        let myRoomExits = this.room.findLocalExits(true);
        Log(LOG_LEVEL.debug,'STRUCTURE TOWER: exits - '+JS(myRoomExits));

        // TODO: I take the center as reference here but it should maybe the direction where the invader was coming from
        // not sure how reasonable it is that the invader escapes to the nearest exit
        let aPos = new RoomPosition(25,25,this.pos.roomName);
        let aDir = getCrossDirection(aPos.getDirectionTo(pPos)); // center for reference
        let aRoomMap = Game.map.describeExits(this.pos.roomName);


        this.room.visual.circle(pPos);

        Log(LOG_LEVEL.debug,'STRUCTURE TOWER: dir - '+JS(aDir)+' this: '+this.pos.roomName);
        Log(LOG_LEVEL.debug,'STRUCTURE TOWER: roomExits - '+JS(aRoomMap));

        let myCloseExits = myRoomExits[aRoomMap[aDir]]; // this can be undefined if ther is no exit in the searched direction
        Log(LOG_LEVEL.debug,'STRUCTURE TOWER: close exits - '+JS(myCloseExits));

        let aDerp = [];
        _.each(myCloseExits,(a) => aDerp.push(new RoomPosition(a[0],a[1],this.pos.roomName)));

        let aClosest = pPos.findClosestByPath(aDerp);
        Log(LOG_LEVEL.debug,'CLOSEST: '+JS(aClosest));
        this.room.visual.circle(aClosest);

        let aPath = pPos.findPathTo(aClosest);
        let aLen = aPath.length;
        //aPath.path = [];
        Log(LOG_LEVEL.debug,'CLOSEST: len: '+aLen);
    },'tower');

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
