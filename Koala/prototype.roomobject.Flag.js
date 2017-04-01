


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

Flag.prototype.init = function(pProxy)
{
    //Log(LOG_LEVEL.debug,'RoomObject: default init - '+this.entityType);
    pProxy.isMy = true;
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
    });
};
extend();
