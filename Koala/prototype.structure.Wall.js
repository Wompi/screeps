extend = function()
{
    Object.defineProperties(StructureWall.prototype,
    {
        'isMy':
        {
            configurable: true,
            get: function()
            {
                if (!_.isUndefined(this.ticksToLive)) return false // automatic constructed walls have a timer

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
