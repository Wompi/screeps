class ProxyCache
{
    constructor()
    {
        this.CACHE_FIND = [FIND_STRUCTURES,
                            FIND_SOURCES,
                            FIND_DROPPED_RESOURCES,
                            FIND_CONSTRUCTION_SITES,
                            FIND_NUKES,
                            FIND_MINERALS,
                            FIND_HOSTILE_CREEPS];


        this._mCache = {};

        this.mFirstTick = Game.time;
        this.mLastTick = Game.time;
        this.mCacheAge = 0;
        this.mCacheUpdateDelta = 0
    }

    makeCache(pReset)
    {
        _.each(Game.rooms, (aRoom,aRoomName) =>
        {
            this._makeRoomCache(aRoom);
        });
        _.each(Game.flags, (aFlag,aFlagName) =>
        {
            this._registerEntity(aFlag);
        });
        this._initEntities()
    }

    _makeRoomCache(pRoom)
    {
        _.each(this.CACHE_FIND, (aFindKey) =>
        {
            _.each(pRoom.find(aFindKey), (aEntity) =>
            {
                this._registerEntity(aEntity);
            });
        });
        this._registerEntity(pRoom);
    }

    _initEntities()
    {
        _.each(this._mCache, (aProxy,aID) => aProxy.entity.init(aProxy));
    }

    _registerEntity(pEntity)
    {
        let aProxy = undefined;
        if (_.isUndefined(this._mCache[pEntity.id]))
        {
            aProxy = this._makeEntityProxy();
            _.set(this._mCache,[pEntity.id],aProxy);
            aProxy.entity = pEntity;
        }
        return aProxy;
    }

    _removeEntityProxy(pProxy)
    {
        delete this._mCache[pProxy.id];
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
        var myEvents = pProxy.entity.getEntityEvents();
        let aEntity = myEvents.currentEntity();
        if (aEntity != null)
        {
            pProxy.lastUpdate = Game.time;
            pProxy.entity = aEntity;
            pProxy.isValid = true;
        }
        else
        {

            if (myEvents.hasOwnProperty('onInvalid'))
            {
                let res = myEvents.onInvalid(pProxy.lastUpdate,pProxy);
                Log(LOG_LEVEL.debug,'PROXY CACHE: _updateEntityProxy - entity: '+pProxy.entityType+' is invalid: '+res);
                if (res == INVALID_ACTION.delete)
                {
                    this._removeEntityProxy(pProxy);
                }
            }
            pProxy.isValid = false;
        }
    }

    _updateChangingEntities()
    {
        _.each(Game.rooms, (aRoom) =>
        {
            // if we enter a new room all entities of this room will be added here - this is a bit messy
            // lets see how it works
            let aRoomProxy = this._mCache[aRoom.id];
            if (_.isUndefined(aRoomProxy) || !aRoomProxy.isValid)
            {
                let myNewProxies = [];

                _.each(this.CACHE_FIND, (aFindKey) =>
                {
                    _.each(aRoom.find(aFindKey), (aEntity) =>
                    {
                        let aProxy = this._registerEntity(aEntity);
                        if (!_.isUndefined(aProxy))
                        {
                            myNewProxies.push(aProxy);
                        }
                    });
                });
                let aProxy = this._registerEntity(aRoom);
                if (!_.isUndefined(aProxy))
                {
                    myNewProxies.push(aProxy);
                }
                _.each(myNewProxies, (aProxy) => aProxy.entity.init(aProxy));
                // NOTE: the overall update happens after this in updateCache();
            }
        });


        _.each(Game.rooms, (aRoom) =>
        {
            _.each(aRoom.find(FIND_DROPPED_RESOURCES), (aDrop) =>
            {
                this.addEntity(aDrop,false);
            });
        });



        /// construction Sites can be places by the gui and need to be inserted if they changed as well flags
        _.each(Game.constructionSites, (aSite) =>
        {
            this.addEntity(aSite,false);
        });
        _.each(Game.flags, (aFlag) =>
        {
            this.addEntity(aFlag,false);
        })
    }

    // -------------------------------- PUBLIC FUNCTIONS ----------------------------------------

    updateCache()
    {
        this.mCacheAge = Game.time - this.mFirstTick;
        this.mCacheUpdateDelta = Game.time - this.mLastTick;

        this._updateChangingEntities();

        // NOTE: make sure this comes after the _updateChangingEntities() so the new entities get a fresh update
        _.each(this._mCache, (aProxy,aID) => this._updateEntityProxy(aProxy));

        this.mLastTick = Game.time;
    }

    addEntity(pEntity, withUpdate = true)
    {
        if (_.isUndefined(pEntity)) return;
        let aProxy = this._registerEntity(pEntity);
        if (!_.isUndefined(aProxy))
        {
            Log(LOG_LEVEL.debug,'PROXY CACHE: addEntity - new entity '+pEntity.entityType+' found!');
            aProxy.entity.init(aProxy);
            if (withUpdate) this._updateEntityProxy(aProxy);
        }
    }

    // TODO: this is just the entrance to the cache - this should be pointing to a allready filtered Object
    // which holds all the related entities
    // -  for now we iterate over all to make it simple
    getFriendlyEntityCache(pType)
    {
        return _.map(_.filter(this._mCache, (aProxy) => aProxy.entityType == pType && aProxy.isMy));
    }

    getAllEntityCache(pType)
    {
        return _.map(_.filter(this._mCache, (aProxy) => aProxy.entityType == pType));
    }

    getHostileEntityCache(pType)
    {
        return _.map(_.filter(this._mCache, (aProxy) => aProxy.entityType == pType && !aProxy.isMy));
    }


    printStats()
    {
        var aCount = {}
        Log(LOG_LEVEL.info,'--------- Cache Stats ---------');
        let myFriendly = _.filter(this._mCache, (aProxy) => aProxy.isMy);
        Log(LOG_LEVEL.info,'CACHE['+SNode.mNode+']: friendly - '+_.size(myFriendly));
        Log(LOG_LEVEL.debug,JS(_.countBy(_.map(myFriendly),'entityType')));

        let myHostile = _.filter(this._mCache, (aProxy) => !aProxy.isMy);
        Log(LOG_LEVEL.info,'CACHE['+SNode.mNode+']: hostile - '+_.size(myHostile));
        Log(LOG_LEVEL.debug,JS(_.countBy(_.map(myHostile),'entityType')));

    }
}
module.exports = ProxyCache;
