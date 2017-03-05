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

StructureSpawn.prototype.getStatus = function()
{
    if (this.energy == this.energyCapacity)
    {
        return {status: FILL_STATUS.isFull, needs: 0};
    }
    else if (this.energy == 0)
    {
        return {status: FILL_STATUS.isEmpty, needs: this.energyCapacity};
    }
    else
    {
        return {status: FILL_STATUS.isPartial, needs: (this.energyCapacity - this.energy) };
    }
}
