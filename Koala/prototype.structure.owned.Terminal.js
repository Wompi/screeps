// this one splits the minerals from the energy
// the result can be used as normal storage .. so _.sum(res);
StructureTerminal.prototype.getMineralStore = function()
{
    var aStore = _.clone(this.store);
    delete aStore['energy'];
    return aStore;
}
