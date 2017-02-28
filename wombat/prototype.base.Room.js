
Room.prototype.test = function()
{
    console.log('ROOM PROTOTYPE TEST');
}

Room.prototype.getRoomType = function()
{
    return getRoomType(this.name);
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
        }
    });
};
extend();


//
// var memGet = _.memoize(() =>
// {
//     console.log('memoize room test');
//     return 'a super derp memoize test';
// },() => 'testHash');
//
//
// var extend = function()
// {
//     Object.defineProperties(Room.prototype,
//     {
//         'mineral':
//         {
//             configurable: true,
//             get: function()
//             {
//                 if (!this._mineral)
//                 {
//                     var aArr = this.find(FIND_MINERALS);
//                     this._mineral = aArr[0];
//                 }
//                 else
//                 {
//                     console.log('MINERAL CACHE......');
//                 }
//                 return this._mineral;
//
//             }
//         },
//         'test':
//         {
//             configurable: true,
//             get: memGet,
//             set: (pValue) =>
//             {
//                 memGet.cache.set('testHash',pValue);
//             },
//         },
//
//     });
// }
// extend();
// //module.exports = extend;
