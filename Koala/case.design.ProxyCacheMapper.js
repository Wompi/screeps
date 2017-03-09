class ProxyCacheMapper
{
    constructor(pCache)
    {
        this.mCache = pCache;
        this.mMapCache = {};
    }

    map(pProxy)
    {
        let aID = pProxy.id;
        let aType = pProxy.entityType;
        let aMy = pProxy.isMy;

        let myPaths = [[(aMy) ? 'my' : 'notMy',aType]]
        if (!_.isUndefined(pProxy.pos))
        {
            myPaths.push([(aMy) ? 'my' : 'notMy',pProxy.pos.roomName,aType]);
        }

        var aProxy = new Proxy(
        {
            type: aType,
            id: aID,
            path: myPaths,
            cacheMap: this.mMapCache,
            cache: this.mCache,
            my: aMy,
        },
        {
            get: function(target, name)
            {
                let myProxy = target.cache[target.id];
                if (_.isUndefined(myProxy))
                {
                    // TODO: remove the object from the mapper - all pathes
                    //Log(undefined, 'WRAPPER DERP');
                    //delete target['cacheMap'][target.my][target.type][target.id];
                    return undefined;
                }
                return myProxy[name];
            },
        });


        _.each(myPaths, (aP) =>
        {
            aP.push(aID);
            Log(undefined,'PATH: '+JS(aP));
            _.set(this.mMapCache,aP,aProxy);
        });
    }

    getFriendlyCacheByEntityType(pType)
    {
        return this.mMapCache['my'][pType];
    }

    printMapperStats()
    {
        var aCount = {}
        Log(LOG_LEVEL.info,'--------- Cache Mapper Stats ---------');
        _.each(this.mMapCache, (aMap, aKey) =>
        {
            Log(LOG_LEVEL.debug,aKey+' - > '+_.size(aMap));
            _.each(aMap, (aTypeMap,aTypeKey) =>
            {
                Log(LOG_LEVEL.debug,'\t'+aTypeKey+' - > '+_.size(aTypeMap)+' '+JS(_.find(aTypeMap)));
                if (_.isUndefined(ENTITY_TYPES[aTypeKey]))
                {
                    _.each(aMap, (aRoomTypeMap,aRoomTypeKey) =>
                    {
                        Log(LOG_LEVEL.debug,'\t\t'+aRoomTypeKey+' - > '+_.size(aRoomTypeMap)+' '+JS(_.find(aRoomTypeMap)));
                    })
                }
            })
        });
        Log(LOG_LEVEL.info,'MAPPER CACHE: '+JS(this.mMapCache));


    }
}
module.exports = ProxyCacheMapper;
