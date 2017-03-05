
StructureContainer.prototype.init = function(pProxy)
{
    Log(LOG_LEVEL.debug,'StructureContainer: init - '+this.entityType);
    pProxy.isMy = isMine(this);
}
