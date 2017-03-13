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
        this.mCacheUpdateDelta = 0;
        this.mDerpCacheMapper = {};

//        this._mCacheMapper = new ProxyCacheMapper(this._mCache);
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
        _.each(this._mCache, (aProxy,aID) =>
        {
            aProxy.entity.init(aProxy)
            //this._mCacheMapper.map(aProxy);
        });
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
                    if (!_.isUndefined(target['entity']))
                    {
                        res = target['entity'][name];
                    }
                    else return undefined;
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
            if (myEvents.hasOwnProperty('onUpdate'))
            {
                pProxy.entity.getEntityEvents().onUpdate(pProxy);
            }
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
                else if (res == INVALID_ACTION.save)
                {
                    // do something....
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
                _.each(myNewProxies, (aProxy) =>
                {
                    aProxy.entity.init(aProxy);
                    //this._mCacheMapper.map(aProxy);
                });
                // NOTE: the overall update happens after this in updateCache();
            }
        });


        _.each(Game.rooms, (aRoom) =>
        {
            _.each(aRoom.find(FIND_DROPPED_RESOURCES), (aDrop) =>
            {
                this.addEntity(aDrop,false);
            });
            _.each(aRoom.find(FIND_HOSTILE_CREEPS), (aCreep) =>
            {
                this.addEntity(aCreep,false);
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

    _updateSavedEntities()
    {
        _.each(Memory.reservations, (aR,aID) =>
        {
            if (_.isUndefined(this._mCache[aID]))
            {
                let derp = aR;
                Log(LOG_LEVEL.debug,'MEMORY UPDATE: '+JS(derp));
            }
        });
    }


    // -------------------------------- PUBLIC FUNCTIONS ----------------------------------------

    updateCache()
    {
        this.mCacheAge = Game.time - this.mFirstTick;
        this.mCacheUpdateDelta = Game.time - this.mLastTick;

        // TODO: remember this - this is ugly and dangerous
        this.mDerpCacheMapper = {};

        this._updateSavedEntities();
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
            //this._mCacheMapper.map(aProxy);
            if (withUpdate) this._updateEntityProxy(aProxy);
        }
    }

    // TODO: this is just the entrance to the cache - this should be pointing to a allready filtered Object
    // which holds all the related entities
    // -  for now we iterate over all to make it simple
    getFriendlyEntityCache(pType)
    {
        let result = undefined;
        Pro.register( () =>
        {
            result = _.get(this.mDerpCacheMapper,pType);
            if (_.isUndefined(result))
            {
                result = _.map(_.filter(this._mCache, (aProxy) => aProxy.entityType == pType && aProxy.isMy));
                _.set(this.mDerpCacheMapper,pType,result);
            }
            else
            {
                //Log(LOG_LEVEL.error,'CACHE '+pType+' reused!');
            }
        },'getFriendlyEntityCache()');
        return result;
    }

    getFriendlyEntityCacheByID(pID)
    {
        let aProxy = this._mCache[pID];
        if (!aProxy.isMy) return undefined;
        return aProxy;
    }



    getAllEntityCache(pType)
    {
        return _.map(_.filter(this._mCache, (aProxy) => aProxy.entityType == pType));
    }

    getHostileEntityCache(pType)
    {
        let result = undefined;
        Pro.register( () =>
        {
            result = _.get(this.mDerpCacheMapper,pType);
            if (_.isUndefined(result))
            {
                result = _.map(_.filter(this._mCache, (aProxy) => aProxy.entityType == pType && !aProxy.isMy));
                _.set(this.mDerpCacheMapper,pType,result);
            }
            else
            {
                //Log(LOG_LEVEL.error,'CACHE '+pType+' reused!');
            }
        },'getHostileEntityCache()');
        return result;    }


    printStats()
    {
        var aCount = {}
        Log(LOG_LEVEL.info,'--------- Cache Stats ---------');
        let myFriendly = _.filter(this._mCache, (aProxy) => aProxy.isMy);
        Log(LOG_LEVEL.info,'CACHE['+SNode.mNode+']: friendly - '+_.size(myFriendly));
        Log(LOG_LEVEL.debug,JS(_.countBy(_.map(myFriendly),'entityType')));

        let myHostile = _.filter(this._mCache, (aProxy) => !aProxy.isMy);
        Log(LOG_LEVEL.info,'CACHE['+SNode.mNode+']: hostile - '+_.size(myHostile));

        let aDerp = _.countBy(_.map(myHostile),'entityType');
        if (!_.isEmpty(aDerp))
        {
            Log(LOG_LEVEL.debug,JS(aDerp));
        }

        //this._mCacheMapper.printMapperStats();
        //Log(LOG_LEVEL.debug,JS(this._mCache));
        let aH = '';
        _.each(this.getHostileEntityCache(ENTITY_TYPES.creep), (aC) => aH = aH+' '+aC.owner.username+' '+aC.pos.toString()+' ,');
        if (!_.isEmpty(aH) ) Log(LOG_LEVEL.error,'ENEMYS: '+aH);
    }
}
module.exports = ProxyCache;
