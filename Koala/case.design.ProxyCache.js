class ProxyCache
{
    constructor()
    {
        this._mFriendlyCache = {};
        this._mHostileCache = {};



        this.mFirstTick = Game.time;
        this.mLastTick = Game.time;
        this.mCacheAge = 0;
        this.mCacheUpdateDelta = 0
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
                    this._registerEntity(aEntity);
                });
            });
            this._registerEntity(aRoom);
        });
        _.each(Game.flags, (aFlag,aFlagName) =>
        {
            this._registerEntity(aFlag);
        });
    }

    _registerEntity(pEntity)
    {
        if (pEntity.isMy)
        {
            return this._setEntity(pEntity,this._mFriendlyCache);
        }
        else
        {
            return this._setEntity(pEntity,this._mHostileCache);
        }
    }

    _setEntity(pEntity,pCache)
    {
        let aProxy = undefined;
        if (_.isUndefined(pCache[pEntity.id]))
        {
            aProxy = this._makeEntityProxy();
            _.set(pCache,[pEntity.id],aProxy);
            aProxy.entity = pEntity;
        }
        return aProxy;
    }

    _makeEntityProxy()
    {
        return new Proxy({},
        {
            get: function(target, name)
            {
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
                //Log(LOG_LEVEL.debug, 'PROXY: set '+name+' '+target['entity'].entityType+' value: '+value);
                return true;
            },
        });
    }

    _updateEntityProxy(pProxy)
    {
        var aEntityBehavior = pProxy.entity.getEntityBehavior();
        let aEntity = aEntityBehavior.currentEntity();
        if (aEntity != null)
        {
            pProxy.lastUpdate = Game.time;
        }
        else
        {
            Log(LOG_LEVEL.debug,'PROXY CACHE: _updateEntityProxy - entity: '+pProxy.entityType+' is invalid!');
        }
    }

    _updateClientEntities()
    {
        /// construction Sites can be places by the gui and need to be inserted if they changed as well flags
        _.each(Game.flags, (aFlag) =>
        {
            this.addEntity(aFlag);
        })

        _.each(Game.constructionSites, (aSite) =>
        {
            this.addEntity(aSite);
        });
    }

    // -------------------------------- PUBLIC FUNCTIONS ----------------------------------------

    updateCache()
    {
        this.mCacheAge = Game.time - this.mFirstTick;
        this.mCacheUpdateDelta = Game.time - this.mLastTick;

        _.each(this._mFriendlyCache, (aProxy,aID) => this._updateEntityProxy(aProxy));
        _.each(this._mHostileCache, (aProxy,aID) => this._updateEntityProxy(aProxy));

        this._updateClientEntities();

        this.mLastTick = Game.time;
    }

    addEntity(pEntity)
    {
        if (_.isUndefined(pEntity)) return;
        let aProxy = this._registerEntity(pEntity);
        if (!_.isUndefined(aProxy))
        {
            Log(LOG_LEVEL.debug,'PROXY CACHE: addEntity - new entity '+pEntity.entityType+' found!');
            this._updateEntityProxy(aProxy);
        }
    }

    printStats()
    {
        var aCount = {}
        Log(LOG_LEVEL.info,'--------- Cache Stats ---------');
        Log(LOG_LEVEL.info,'CACHE['+SNode.mNode+']: friendly - '+_.size(this._mFriendlyCache));
        Log(LOG_LEVEL.debug,JS(_.countBy(_.map(this._mFriendlyCache),'entityType')));


        Log(LOG_LEVEL.info,'CACHE['+SNode.mNode+']: hostile - '+_.size(this._mHostileCache));
        Log(LOG_LEVEL.debug,JS(_.countBy(_.map(this._mHostileCache),'entityType')));


        // _.each(this.mCache,(aValue,aKey) => aCount[aKey] = _.size(aValue));
        // Log(LOG_LEVEL.info, 'CACHE['+SNode.mNode+'] age: '+this.mCacheAge+' last: '+this.mCacheUpdateDelta);
        // Log(LOG_LEVEL.debug,JS(aCount));
    }
}
module.exports = ProxyCache;
