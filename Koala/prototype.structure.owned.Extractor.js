
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
            }
        },
        onInvalid: (pLastUpdate,pProxy) => INVALID_ACTION.delete,
    };
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
    pProxy.miningPositions =  myMiningPositions;
}
