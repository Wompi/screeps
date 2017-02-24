StructureExtension.prototype.getEntityBehavior = function()
{
    return {
        currentEntity: () => Game.getObjectById(this.id),
        onInvalid: () => false,
        onChange: (pLastUpdate,pLastEntity) =>
        {
            if (this.energy < this.energyCapacity)
            {
                let aDeltaEnergy = this.energyCapacity - this.energy;
                Log(undefined,'StructureExtension: onChange - needs: '+aDeltaEnergy);
            }
        },
    };
};
