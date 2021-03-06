StructureExtension.prototype.getEntityBehavior = function()
{
    return {
        currentEntity: () => Game.getObjectById(this.id),
        onInvalid: (pLastUpdate) => false,
        onChange: (pLastUpdate,pLastEntity) =>
        {
            if (this.energy < this.energyCapacity)
            {
                let aDeltaEnergy = this.energyCapacity - this.energy;
                Log(undefined,'StructureExtension: '+this.pos.toString()+' onChange - needs: '+aDeltaEnergy);
            }
        },
    };
};

StructureExtension.prototype.getStatus = function()
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
