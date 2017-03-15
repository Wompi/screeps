class ReactionManager
{
    constructor()
    {

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
