class ReactionManager
{
    constructor()
    {
        this.mRoomMap =
        {
            'W47N84': 'KHO2',
        };

        this.mComponentTable  = this.getComponentsMap();
    }

    getMineralStorage()
    {
        let aSum = {};

        let myContainer = PCache.getFriendlyEntityCache(ENTITY_TYPES.container);
        let myStorages = PCache.getFriendlyEntityCache(ENTITY_TYPES.storage);
        let myTerminals = PCache.getFriendlyEntityCache(ENTITY_TYPES.terminal);

        _.each(myContainer, (aC) =>
        {
            aSum = this.sumMineralStore(aSum,aC.getMineralStore());
        })

        _.each(myStorages, (aC) =>
        {
            aSum = this.sumMineralStore(aSum,aC.getMineralStore());
        })

        _.each(myTerminals, (aC) =>
        {
            aSum = this.sumMineralStore(aSum,aC.getMineralStore());
        })

        Log(LOG_LEVEL.debug,'aSum = '+JSON.stringify(aSum));
        return aSum;
    }


    sumMineralStore(pSum,pStore)
    {
        return _.reduce(pStore, (res,a,b) =>
        {
            res[b] = _.isUndefined(res[b]) ? a : res[b] + a;
            return res;
        },pSum);
    }


    getPossibleReactions(pMinerals)
    {
        let myMineralNames = _.keys(pMinerals);
        let result = [];

        _.each(myMineralNames, (aName) =>
        {
            _.each(myMineralNames, (bName) =>
            {
                if (aName != bName)
                {
                    let aReaction = undefined;
                    if (!_.isUndefined(REACTIONS[aName])) aReaction = REACTIONS[aName][bName];

                    if (!_.isUndefined(aReaction)) result.push(aReaction);
                }
            });
        });
        return _.uniq(result);
    }


    getExportComponents(pRoomName)
    {
        let result = [];

        _.each(this.mRoomMap, (aReaction, aImportRoom) =>
        {
            let aComponentMap = this.getComponentsForReaction(aReaction,aImportRoom);
            if (!_.isUndefined(aComponentMap.components))
            {
                // Log(undefined,'derp - '+JS(aComponentMap.components));
                let aExport = aComponentMap.components[pRoomName];
                // Log(undefined,'aExport - '+JS(aExport));
                if (!_.isUndefined(aExport))
                {
                    result = result.concat(aExport);
                }
            }
        });
        return result;
    }


    getComponentsForReaction(pReaction, pRoomName)
    {
        let result = {};
        result.components = {};

        let myComoponents = this.mComponentTable[pReaction];
        let myStorages = PCache.getFriendlyEntityCache(ENTITY_TYPES.storage);

        _.each(myStorages, (aStore) =>
        {
            if(aStore.pos.roomName != pRoomName)
            {
                _.each(myComoponents, (aComponent) =>
                {
                    if (!_.isUndefined(aStore.store[aComponent]))
                    {
                        if (_.isUndefined(result.components[aStore.pos.roomName]))
                        {
                            result.components[aStore.pos.roomName] = [];
                        }
                        result.components[aStore.pos.roomName].push(aComponent);
                    }
                });
            }
        });

        result.reaction = pReaction;

        return result;
    }


    getComponentsMap()
    {
        let result = {};
        _.each(REACTIONS, (aMap,aCompA) =>
        {
            _.each(aMap, (aReaction,aCompB) =>
            {
                result[aReaction] = [aCompA,aCompB];
            });
        });
        return result;
    }


    getAttributesForReactions(pReactions)
    {
        let result = {};
        _.each(pReactions, (aR) =>
        {
            _.each(BOOSTS, (myPartReactions,aPart) =>
            {
                let aAttribute =  myPartReactions[aR];
                if (!_.isUndefined(aAttribute))
                {
                    if (_.isUndefined(result[aPart]))
                    {
                        result[aPart] = {};
                    }
                    result[aPart][aR] = aAttribute;
                }
            })
        })
        return result;
    }

    getReactions()
    {

    }

}
module.exports = ReactionManager;
