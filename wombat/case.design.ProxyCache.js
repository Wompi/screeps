class ProxyCache
{
    constructor()
    {
        this.mCache = {};
        this.mInitList = [];
        this.makeCache();
    }

    makeCache()
    {
        let CACHE_FIND = [FIND_STRUCTURES, FIND_SOURCES];

        _.each(Game.rooms, (aRoom,aRoomName) =>
        {
            _.each(CACHE_FIND, (aFindKey) =>
            {
                _.each(aRoom.find(aFindKey), (aEntity) =>
                {
                    let aProxy = this.makeProxy();
                    _.set(this.mCache,[aEntity.entityType,aEntity.id],aProxy);

                    aProxy.entity = aEntity;
                    if ('init' in aEntity )
                    {
                        this.mInitList.push(aProxy);
                    }
                    else
                    {
                        //Log(undefined, 'PROXY: '+aStruct.entityType+' has no Init!');
                    }

                });
            });
        });
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
                        var aEntity = aEntityBehavior.currentEntity();
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



}
module.exports = ProxyCache;
