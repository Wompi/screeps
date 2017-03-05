
RoomObject.prototype.getEntityEvents = function()
{
    return {
        currentEntity: () => Game.getObjectById(this.id),
        onInvalid: (pLastUpdate,pProxy) => INVALID_ACTION.delete,
    };
}

RoomObject.prototype.getProxy = function()
{
    return PCache.getEntityProxy(this);
}

RoomObject.prototype.getEntityEvents = function()
{
    return {
        currentEntity: () => Game.getObjectById(this.id),
        onInvalid: (pLastUpdate,pProxy) => INVALID_ACTION.delete,
    };
}

RoomObject.prototype.init = function(pProxy)
{
    Log(LOG_LEVEL.debug,'RoomObject: default init - '+this.entityType);
    pProxy.isMy = isMine(this);
}



extend = function()
{
    Object.defineProperties(RoomObject.prototype,
    {
        'entityType':
        {
            configurable: true,
            get: function()
            {
                let res = _.findKey(ROOM_OBJECTS, (aClass,aKey) => this instanceof aClass);
                if (_.isUndefined(res))
                {
                    /// ERROR: maybe a new class was added to the API you have to adjust ROOM_OBJECTS for that
                    Log(LOG_LEVEL.error,'RoomObject.entityType - undefined FIX THIS!');
                    res = 'roomObject';
                }
                return res;
            },
        },
    });
};
extend();
