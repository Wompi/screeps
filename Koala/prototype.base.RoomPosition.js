
RoomPosition.prototype.toString =  function (htmlLink = true) {
    if (htmlLink) {
        return `<a href="#!/room/${ this.roomName }">[${ this.roomName } ${ this.x },${ this.y }]</a>`;
    }
    return `[${ this.roomName } ${ this.x },${ this.y }]`;
};


RoomPosition.prototype.adjacentPositions = function(pRange)
{
    if (pRange < 1) return undefined;

    var AREA_RANGE = (pRange * 2 + 1);
    var AREA_OFFSET = _.floor(AREA_RANGE/2);

    var aArea = {};
    for (var i = 0; i < AREA_RANGE; i++)
    {
        var y = this.y - AREA_OFFSET + i;
        for (var j = 0; j < AREA_RANGE; j++)
        {
            var x = this.x - AREA_OFFSET + j;
            var aTerrain = Game.map.getTerrainAt(x,y,this.roomName);

            if (aTerrain != 'wall')
            {
                if (_.isUndefined(aArea[x]))
                {
                    aArea[x] = {};
                }
                aArea[x][y] = 0;
            }
        }
    }
    return aArea;
}


RoomPosition.prototype.inBoundPositions = function(pRange)
{
    var result = { max: -Infinity, area: undefined }

    if (pRange < 2) return result;

    result.area = this.adjacentPositions(pRange);

    if (_.isUndefined(result.area) ) return result;

    var AREA_INNER_RANGE = ((pRange-1) * 2 + 1);
    var AREA_INNER_OFFSET = _.floor(AREA_INNER_RANGE/2);

    var x = 0;
    var y = 0;

    for (var i = 0; i < AREA_INNER_RANGE; i++)
    {
        y = this.y - AREA_INNER_OFFSET + i;
        for (var j = 0; j < AREA_INNER_RANGE; j++)
        {
            x = this.x - AREA_INNER_OFFSET + j;
            if (!_.isUndefined(result.area[x]) && !_.isUndefined(result.area[x][y]))
            {
                _.forEach(DIRECTIONS, (a) =>
                {
                    var nX = x + LOCATION_TO_DIRECTION[a][0];
                    var nY = y + LOCATION_TO_DIRECTION[a][1];
                    if (!_.isUndefined(result.area[nX]) && !_.isUndefined(result.area[nX][nY]))
                    {
                        result.area[x][y] = result.area[x][y] + 1;
                    }
                });

                if (result.area[x][y] > result.max)
                {
                    result.max = result.area[x][y];
                }
            }
        }
    }
    return result;
}

RoomPosition.prototype.getEntityEvents = function()
{
    return {
        currentEntity: () => this,
        onInvalid: (pLastUpdate,pProxy) => INVALID_ACTION.delete,
    };
}

RoomPosition.prototype.init = function(pProxy)
{
    Log(LOG_LEVEL.debug,'RoomPosition: default init - '+this.entityType);
}

extend = function()
{
    Object.defineProperties(RoomPosition.prototype,
    {
        'entityType':
        {
            configurable: true,
            get: function()
            {
                return ENTITY_TYPES.roomPosition;
            },
        },
        'id':
        {
            configurable: true,
            get: function()
            {
                return this.toString(false);
            },
        },
        'wpos':
        {
            configurable: true,
        	enumerable: false,
            get: function () {
        		if(!this._wpos)
        			this._wpos = WorldPosition.fromRoomPosition(this);
        		return this._wpos;
            },
        },
        'rIndex':
        {
            configurable: true,
        	enumerable: false,
            get: function () {
        		if(!this._rIndex)
                {
                    // let aX = aIndex % 49;
                    // let aY = (aIndex - aX) / 49;
        			this._rIndex = (this.y * 49) + this.x
                }
        		return this._rIndex;
            },
        },
    });
};
extend();
