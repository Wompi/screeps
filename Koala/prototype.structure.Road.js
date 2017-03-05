StructureRoad.prototype.init = function(pProxy)
{
    Log(LOG_LEVEL.debug,'StructureRoad: init - '+this.entityType);

    pProxy.isMy = isMine(this);
}
