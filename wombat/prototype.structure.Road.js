
StructureRoad.prototype.getEntityBehavior = function()
{
    return {
        currentEntity: () => Game.getObjectById(this.id),
        onInvalid: () => false,
        onChange: (pLastUpdate,pLastEntity) =>
        {
            if (this.hits < (this.hitsMax * 0.5))
            {
                let aDeltaHits = this.hitsMax - this.hits;
                Log(undefined,'StructureRoad: onChange - hits: '+aDeltaHits);
            }
        },
    };
}
