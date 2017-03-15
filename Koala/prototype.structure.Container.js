
StructureContainer.prototype.init = function(pProxy)
{
    Log(LOG_LEVEL.debug,'StructureContainer: init - '+this.entityType);
    pProxy.isMy = isMine(this);
}


// this one splits the minerals from the energy
// the result can be used as normal storage .. so _.sum(res);
StructureContainer.prototype.getMineralStore = function()
{
    var aStore = _.clone(this.store);
    delete aStore['energy'];
    return aStore;
}
