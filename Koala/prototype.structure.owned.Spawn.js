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


StructureSpawn.prototype.getEntityEvents = function()
{
    return {
        currentEntity: () => Game.getObjectById(this.id),
        onUpdate: (pProxy) =>
        {
            if (this.spawning)
            {
                let aRole = _.get(Game.creeps[this.spawning.name],['memory','role']);
                if (!_.isUndefined(aRole) && !_.isEmpty(aRole))
                {
                    this.room.visual.text(aRole,this.pos.x,this.pos.y-4);
                }
            }
        },
        onInvalid: (pLastUpdate,pProxy) => INVALID_ACTION.delete,
    };
}
