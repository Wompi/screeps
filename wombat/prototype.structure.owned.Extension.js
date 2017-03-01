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
