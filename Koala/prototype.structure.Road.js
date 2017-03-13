


StructureRoad.prototype.getEntityEvents = function()
{
    return {
        currentEntity: () => Game.getObjectById(this.id),
        onUpdate: (pProxy) =>
        {
            let aDelta = pProxy.hitsMax - pProxy.hits;
            if (aDelta > 0)
            {
                RMan.registerRepairRoad(pProxy);
            }
        },
        onInvalid: (pLastUpdate,pProxy) => INVALID_ACTION.delete,
    };
}


StructureRoad.prototype.getNearRoads = function()
{
    let myRoads = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.road), (aR) => aR.pos.getRangeTo(this.pos) == 1)
    return myRoads;
}


StructureRoad.prototype.init = function(pProxy)
{
    //Log(LOG_LEVEL.debug,'StructureRoad: init - '+this.entityType);

    pProxy.isMy = isMine(this);
}
