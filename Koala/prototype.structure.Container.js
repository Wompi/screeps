extend = function()
{
    Object.defineProperties(StructureContainer.prototype,
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
