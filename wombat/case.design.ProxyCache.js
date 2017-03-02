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
        _.each(Game.flags, (aFlag,aFlagName) =>
        {
            this.registerEntity(aFlag);
        });
        this.initProxyCache();
    }

    initProxyCache()
    {
        _.each(this.mInitList, (aProxy) => aProxy.entity.init(aProxy));
    }

    getEntityCache(pEntityType)
    {
        return _.map(_.filter(this.mCache[pEntityType],(aEntity) => aEntity.update), (aProxy,aKey) =>
        {
            // Log(LOG_LEVEL.error,'aKEY: '+aKey);
            // Log(LOG_LEVEL.error,'aProxy: '+JS(aProxy));
            return aProxy;
        });
    }

    getEntityProxyForType(pEntityType,pID)
    {
        var aProxy = this.mCache[pEntityType][pID];
        aProxy.update;
        return aProxy;
    }

    getEntityProxy(pEntity)
    {
        // Log(LOG_LEVEL.error,'type: '+pEntity.entityType+' id: '+pEntity.id);
        var aProxy = this.mCache[pEntity.entityType][pEntity.id];
        // Log(LOG_LEVEL.error,'proxy: '+JS(aProxy));
        return aProxy;
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
                // if (typeof name === 'symbol')
                // {
                //     Log(LOG_LEVEL.debug,'symbol')
                // }
                // else
                // {
                //     Log(LOG_LEVEL.debug,'PROXY: '+name+' - '+target['entity'].entityType+' ID: '+target['entity'].id);
                // }

                // TODO: the time check is a fallback and should be removed when I have another idear
                // - problem here is when you register another proxy to this one it can be that this proxy is not
                //   updated acordingly
                // - a global update at tickstart couls solve this - but meh
                // - nope its not working - then you ask for a name property but gets updated and returns false/true - super meh
                if ( name == 'update' /*|| Game.time > target['lastUpdate'] */)
                {

                    //Log(LOG_LEVEL.debug,'PROXY: '+name+' - '+target['entity'].entityType+' ID: '+target['entity'].id);

                    let isNotInvalid = true;
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
                            }
                            else
                            {
                                //Log(undefined,'DERP: '+name);
                                if (aEntityBehavior.hasOwnProperty('onInvalid'))
                                {
                                    isNotInvalid = aEntityBehavior.onInvalid(target['lastUpdate']);
                                }
                            }
                        }
                        target['lastUpdate'] = Game.time;
                    }
                    return isNotInvalid;
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
                    Log(LOG_LEVEL.debug, 'PROXY: set '+name+' '+target['entity'].entityType+' value: '+value);
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
