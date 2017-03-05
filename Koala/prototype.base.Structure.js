


Structure.prototype.getEntityBehavior = function()
{
    return {
        currentEntity: () => Game.getObjectById(this.id),
        onInvalid: (pLastUpdate) => false,
        //onChange: (pLastEntity) => false, // here we could check for deltas to the last state and react on it
    };
}


extend = function()
{
    Object.defineProperties(Structure.prototype,
    {
        'entityType':
        {
            configurable: true,
            get: function()
            {
                return  this.structureType;;
            },
        },
    });
};
extend();
