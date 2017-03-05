


Structure.prototype.getEntityEvents = function()
{
    return {
        currentEntity: () => Game.getObjectById(this.id),
        onInvalid: (pLastUpdate,pProxy) => INVALID_ACTION.delete,
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
