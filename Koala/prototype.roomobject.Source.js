Source.prototype.visualize = function()
{
    var aArea = this.possibleMiningPositions;

    Visualizer.visualizeArea(aArea, ({x,y}) =>
    {
        this.room.visual.circle(Number(x),Number(y), {fill: COLOR.green});
    });
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



// Source.prototype.init = function(pProxy)
// {
//     Log(LOG_LEVEL.info,'SOURCE: '+this.pos.toString()+' init - '+pProxy.id+' proxy: '+pProxy);
//     pProxy.homeSpawn = _.min(PCache.getEntityCache(ENTITY_TYPES.spawn), (aSpawn) => aSpawn.pos.getRangeTo(this.pos));
//
//     var aRange = 1;
//     var aArea = this.pos.adjacentPositions(aRange);
//     pProxy.possibleMiningPositions = aArea;
//
//     let aController = _.find(PCache.getEntityCache(ENTITY_TYPES.controller),
//                                     (aProxy) => aProxy.pos.roomName == this.pos.roomName);
//
//     // TODO: the distance check for the rooms needs a rework - diagonal rooms count as well and it should
//     //       better test for path length
//     pProxy.isMine = (_.isUndefined(aController) ? false : aController.isMine) && Game.map.getRoomLinearDistance(this.pos.roomName,pProxy.homeSpawn.pos.roomName) < 1;
// }


extend = function()
{
    Object.defineProperties(Source.prototype,
    {
        'possibleMiningPositions':
        {
            configurable: true,
            get: function()
            {
                var aRange = 1;
                return this.pos.adjacentPositions(aRange);
            },
        }
    });
};
extend();
