




Flag.prototype.getEntityBehavior = function()
{
    return {
        currentEntity: () =>
        {
            let aFlag = Game.flags[this.name];
            if (_.isUndefined(aFlag)) return null;
            return aFlag;
        },
        onInvalid: (pLastUpdate) =>
        {
            Log(LOG_LEVEL.error,'FLAG: onInvalid - '+this.toString());
            return false;
        },
        //onChange: (pLastEntity) => false, // here we could check for deltas to the last state and react on it
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
        }
    });
};
extend();
