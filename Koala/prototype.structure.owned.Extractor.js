
StructureExtractor.prototype.getEntityEvents = function()
{
    return {
        currentEntity: () => Game.getObjectById(this.id),
        onUpdate: (pProxy) =>
        {
            if (pProxy.isMy)
            {
                let aMineral = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.mineral), (aM) =>
                {
                    return this.pos.isEqualTo(aM.pos)
                });
                pProxy.mineral = aMineral;

                let aBox = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.container), (aC) =>
                {
                    return this.pos.isNearTo(aC.pos)
                });
                pProxy.miningBox = aBox;
            }
        },
        onInvalid: (pLastUpdate,pProxy) => INVALID_ACTION.delete,
    };
}

StructureExtractor.prototype.isReady = function()
{
    let aProxy = PCache.getFriendlyEntityCacheByID(this.id);
    if (_.isUndefined(aProxy)) return false;
    return (!_.isUndefined(aProxy.miningBox) && _.isUndefined(aProxy.mineral.ticksToRegeneration))
}


StructureExtractor.prototype.init = function(pProxy)
{
    //Log(LOG_LEVEL.debug,'OwnedStructure: default init - '+this.entityType);
    pProxy.isMy = this.my;

    let myMiningPositions = [];
    if (this.my)
    {
        var aRange = 1;
        myMiningPositions = this.pos.adjacentPositions(aRange);
    }
    pProxy.mineral = undefined;
    pProxy.miningBox = undefined;
    pProxy.miningPositions =  myMiningPositions;
}
