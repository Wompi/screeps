
StructureRoad.prototype.getEntityBehavior = function()
{
    return {
        currentEntity: () => Game.getObjectById(this.id),
        onInvalid: () => false,
        onChange: (pLastUpdate,pLastEntity) =>
        {
            if (this.hits < (this.hitsMax * 0.5))
            {
                let aDeltaHits = this.hitsMax - this.hits;
                Log(undefined,'StructureRoad: onChange - hits: '+aDeltaHits);
            }
        },
    };
}


extend = function()
{
    Object.defineProperties(StructureRoad.prototype,
    {
        'isMy':
        {
            configurable: true,
            get: function()
            {
                // TODO: this is a tricky one - what if I build roads through neutral territory?

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
