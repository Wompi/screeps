Source.prototype.possibleMiningPositions = function(pVisualize = false)
{
    var aRange = 1;
    var aArea = this.pos.adjacentPositions(aRange);

    return aArea;
}

Source.prototype.visualize = function()
{
    var aArea = this.getProxy().possibleMiningPositions;

    Visualizer.visualizeArea(aArea, ({x,y}) =>
    {
        this.room.visual.circle(Number(x),Number(y), {fill: COLOR.green});
    });
}


Source.prototype.getEntityBehavior = function()
{
    return {
        currentEntity: () => Game.getObjectById(this.id),
        onInvalid: (pLastUpdate) => false,
        onChange: (pLastUpdate,pLastEntity) =>
        {
            let aDeltaEnergy = pLastEntity.energy - this.energy;
            let aDeltaUpdate = Game.time - pLastUpdate;
            let aAvg = _.floor(aDeltaEnergy/aDeltaUpdate);

            //Log(undefined,'Source: onChange - '+this.homeSpawn.name+' deltaEnergy: '+aDeltaEnergy+' age: '+aDeltaUpdate+' avg: '+aAvg);
            Log(undefined,'Source: '+this.pos.toString()+' onChange - deltaEnergy: '+aDeltaEnergy+' age: '+aDeltaUpdate+' avg: '+aAvg);
        },
    };
}

Source.prototype.getNeededWorkParts = function()
{
    return _.ceil(this.energyCapacity / HARVEST_POWER / ENERGY_REGEN_TIME);
}


Source.prototype.getSourceType = function()
{
    var aLink = _.find(PCache.getEntityCache(ENTITY_TYPES.link), (aLink) => aLink.pos.roomName == this.pos.roomName && aLink.pos.inRangeTo(this.pos,2));
    var aBox = _.find(PCache.getEntityCache(ENTITY_TYPES.container), (aBox) => aBox.pos.roomName == this.pos.roomName && aBox.pos.isNearTo(this.pos));

    if (!_.isUndefined(aLink))
    {
        Log(LOG_LEVEL.debug,'SOURCE '+this.pos.toString()+': hasLink');
        return {type:SOURCE_TYPE.link, target: aLink};
    }
    else if (!_.isUndefined(aBox))
    {
        Log(LOG_LEVEL.debug,'SOURCE '+this.pos.toString()+': hasBox');
        return {type:SOURCE_TYPE.box, target: aBox};
    }

    Log(LOG_LEVEL.debug,'SOURCE '+this.pos.toString()+': drop source');
    // TODO: the drop target should be one of the possibleMiningPositions
    return {type:SOURCE_TYPE.drop, target: undefined};
}

Source.prototype.init = function(pProxy)
{
    Log(LOG_LEVEL.info,'SOURCE: '+this.pos.toString()+' init - '+pProxy.id+' proxy: '+pProxy);
    pProxy.homeSpawn = _.min(PCache.getEntityCache(ENTITY_TYPES.spawn), (aSpawn) => aSpawn.pos.getRangeTo(this.pos));

    var aRange = 1;
    var aArea = this.pos.adjacentPositions(aRange);
    pProxy.possibleMiningPositions = aArea;

    let aController = _.find(PCache.getEntityCache(ENTITY_TYPES.controller),
                                    (aProxy) => aProxy.pos.roomName == this.pos.roomName);

    // TODO: the distance check for the rooms needs a rework - diagonal rooms count as well and it should
    //       better test for path length
    pProxy.isMine = (_.isUndefined(aController) ? false : aController.isMine)    && Game.map.getRoomLinearDistance(this.pos.roomName,pProxy.homeSpawn.pos.roomName) < 1;
}
