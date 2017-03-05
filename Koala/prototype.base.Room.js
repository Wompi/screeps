Room.prototype.getRoomType = function()
{
    return getRoomType(this.name);
}


Room.prototype.getEntityEvents = function()
{
    return {
        currentEntity: () =>
        {
            let aRoom = Game.rooms[this.name];
            if (_.isUndefined(aRoom)) return null;
            return aRoom;
        },
        onInvalid: (pLastUpdate,pProxy) => INVALID_ACTION.none,
    };
}

Room.prototype.findLocalExits = function(pVisualize = false)
{
    var myRanges =
    {
        [TOP]: (i) => [i,0],
        [RIGHT]: (i) => [49,i],
        [BOTTOM]: (i) => [i,49],
        [LEFT]: (i) => [0,i],
    };

    var aResult = {};
    _.each(Game.map.describeExits(this.name), (aRoomName,aExitDirection) =>
    {
        aResult[aRoomName] = [];
        for (let i=1; i<49; i=i+1)  // corners don't have exits so we can save a bit here with starting at 1 and ending at 48
        {
            var aDerp = myRanges[aExitDirection](i);
            var aTerrain = Game.map.getTerrainAt(aDerp[0],aDerp[1],this.name);
            if (aTerrain != 'wall')
            {
                aResult[aRoomName].push(aDerp);
            }
        }
    });

    if (pVisualize)
    {
        _.each(aResult, (aPointArr,aRoomName) =>
        {
            Visualizer.visualizePoints(this.name,aPointArr, {fill: COLOR.blue});
        });
    }

    return aResult;
}

Room.prototype.init = function(pProxy)
{
    Log(LOG_LEVEL.info,'ROOM: init - '+pProxy.id+' proxy: '+pProxy.toString());
    pProxy.isMy = isMine(this);
}

extend = function()
{
    Object.defineProperties(Room.prototype,
    {
        'entityType':
        {
            configurable: true,
            get: function()
            {
                return ENTITY_TYPES.room;
            },
        },
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
                let aController = this.controller;
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
