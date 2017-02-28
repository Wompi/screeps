class ProxyCache
{
    constructor()
    {
        this.mCache = {};
        this.mFirstTick = Game.time;
        this.mLastTick = Game.time;

        this.mCacheAge = 0;
        this.mCacheUpdateDelta = 0


        this.mInitList = [];
    }

    makeCache(pReset)
    {
        let CACHE_FIND = [FIND_STRUCTURES,
							FIND_SOURCES,
							FIND_DROPPED_RESOURCES,
							FIND_MY_CONSTRUCTION_SITES,
							FIND_NUKES,
							FIND_MINERALS];

        _.each(Game.rooms, (aRoom,aRoomName) =>
        {
            _.each(CACHE_FIND, (aFindKey) =>
            {
                _.each(aRoom.find(aFindKey), (aEntity) =>
                {
                    this.registerEntity(aEntity);
                });
            });
            this.registerEntity(aRoom);
        });
        this.initProxyCache();
    }

    initProxyCache()
    {
        _.each(this.mInitList, (aProxy) => aProxy.entity.init(aProxy));
    }

    getCache()
    {
        return this.mCache;
    }

    getEntityCache(pEntityType)
    {
        return _.map(this.mCache[pEntityType]);
    }

    getEntityProxy(pEntity)
    {
        return this.mCache[pEntity.entityType][pEntity.id];
    }

    registerEntity(pEntity)
    {
        let aProxy = this.makeProxy();
        _.set(this.mCache,[pEntity.entityType,pEntity.id],aProxy);
        aProxy.entity = pEntity;
        if ('init' in pEntity )
        {
            this.mInitList.push(aProxy);
        }
        else
        {
            //Log(undefined, 'PROXY: '+aStruct.entityType+' has no Init!');
        }
    }

    makeProxy()
    {
        return new Proxy({},
        {
            get: function(target, name)
            {
                if (Game.time > target['lastUpdate'])
                {
                    var aEntityBehavior = target['entity'].getEntityBehavior();

                    // not all entities need to be updated aka RoomPositions
                    if (!_.isUndefined(aEntityBehavior))
                    {
                        let aEntity = aEntityBehavior.currentEntity();
                        if (aEntity != null)
                        {
                            if (aEntityBehavior.hasOwnProperty('onChange'))
                            {
                                aEntity.getEntityBehavior().onChange(target['lastUpdate'],target['entity']);
                            }
                            target['entity'] = aEntity;
                            target['lastUpdate'] = Game.time;
                            //Log(undefined,'PROXY: update - '+aEntity.entityType+' ID: '+aEntity.id);
                        }
                        else
                        {
                            if (aEntityBehavior.hasOwnProperty('onInvalid'))
                            {
                                // if (aEntity != null)
                                // {
                                //     aEntity.onInvalid();

                            }
                        }
                    }
                }
                let res = target[name];
                if (_.isUndefined(res))
                {
                    res = target['entity'][name];
                }
                return res;
            },
            set: function(target,name,value)
            {
                target[name] = value;

                if (name == 'entity')
                {
                    target['lastUpdate'] = Game.time;
                }
                else
                {
                    Log(undefined, 'PROXY: set '+name+' '+JS(value));
                }
                return true;
            },
        });
    }

    updateCache()
    {
        this.mCacheAge = Game.time - this.mFirstTick;
        this.mCacheUpdateDelta = Game.time - this.mLastTick;
        this.mLastTick = Game.time;
    }

    printStats()
    {
        var aCount = {}
        _.each(this.mCache,(aValue,aKey) => aCount[aKey] = _.size(aValue));
        Log(LOG_LEVEL.info, 'CACHE['+SNode.mNode+'] age: '+this.mCacheAge+' last: '+this.mCacheUpdateDelta);
        Log(LOG_LEVEL.debug,JS(aCount));
    }
}
module.exports = ProxyCache;
