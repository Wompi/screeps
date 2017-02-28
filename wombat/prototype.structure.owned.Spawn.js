StructureSpawn.prototype.getEntityBehavior = function()
{
    return {
        currentEntity: () => Game.getObjectById(this.id),
        onInvalid: () => false,
        onChange: (pLastUpdate,pLastEntity) =>
        {
            Log(undefined,'StructureSpawn: onChange()');
        },
    };
}
