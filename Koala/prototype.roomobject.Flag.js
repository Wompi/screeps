


Flag.prototype.getEntityEvents = function()
{
    return {
        currentEntity: () =>
        {
            let aFlag = Game.flags[this.name];
            if (_.isUndefined(aFlag)) return null;
            return aFlag;
        },
        onInvalid: (pLastUpdate,pProxy) => INVALID_ACTION.delete,
    };
}

extend = function()
{
    Object.defineProperties(Flag.prototype,
    {
        'id':
        {
            configurable: true,
            get: function()
            {
                return this.name;
            },
        },
        'isMy':
        {
            configurable: true,
            get: function()
            {
                return true; // a flag can only be mine
            },
        }
    });
};
extend();
