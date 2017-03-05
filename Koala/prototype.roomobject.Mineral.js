Mineral.prototype.miningPositions = function()
{
    var aRange = 1;
    var aArea = this.pos.adjacentPositions(aRange);
    return aArea;
}

Mineral.prototype.init = function(pProxy)
{
    Log(undefined,'MINERAL: '+this.pos.toString()+' init - '+pProxy.id+' proxy: '+pProxy);
    pProxy.mineralBox = _.find(PCache.getEntityCache(ENTITY_TYPES.container), (aProxy) => aProxy.pos.isNearTo(this.pos));
}


extend = function()
{
    Object.defineProperties(Mineral.prototype,
    {
        'isMy':
        {
            configurable: true,
            get: function()
            {
                let aController = this.room.controller;
                if (!_.isUndefined(aController))
                {
                    return aController.isMy // if it has a controller return the ownership
                }
                return false; // no controller not mine
            },
        }
    });
};
extend();
