
RoomObject.prototype.getEntityBehavior = function()
{
    return {
        currentEntity: () => Game.getObjectById(this.id),
        onInvalid: () => false,
        //onChange: (pLastEntity) => false, // here we could check for deltas to the last state and react on it
    };
}


RoomObject.prototype.getProxy = function()
{
    return PCache.getEntityProxy(this);
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
                    Log(undefined,'ERROR: RoomObject.entityType - undefined FIX THIS!');
                    res = 'roomObject';
                }
                return res;
            },
        },
    });
};
extend();
