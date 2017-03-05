StructureWall.prototype.init = function(pProxy)
{
    Log(LOG_LEVEL.debug,'StructureWall: init - '+this.entityType);

    pProxy.isMy = isMine(this);
}
