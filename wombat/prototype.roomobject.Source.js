Source.prototype.possibleMiningPositions = function(pVisualize = false)
{
    var aRange = 1;
    var aArea = this.pos.adjacentPositions(aRange);

    return aArea;
}

Source.prototype.visualize = function()
{
    var aArea = this.getProxy().possibleMiningPositions;

    Visualizer.visualizeArea(aArea, ({x,y}) =>
    {
        this.room.visual.circle(Number(x),Number(y), {fill: COLOR.green});
    });
}


Source.prototype.getEntityBehavior = function()
{
    return {
        currentEntity: () => Game.getObjectById(this.id),
        onInvalid: () => false,
        onChange: (pLastUpdate,pLastEntity) =>
        {
            let aDeltaEnergy = pLastEntity.energy - this.energy;
            let aDeltaUpdate = Game.time - pLastUpdate;
            let aAvg = _.floor(aDeltaEnergy/aDeltaUpdate);

            //Log(undefined,'Source: onChange - '+this.homeSpawn.name+' deltaEnergy: '+aDeltaEnergy+' age: '+aDeltaUpdate+' avg: '+aAvg);
            Log(undefined,'Source: '+this.id+' onChange - deltaEnergy: '+aDeltaEnergy+' age: '+aDeltaUpdate+' avg: '+aAvg);
        },
    };
}


Source.prototype.getSourceType = function()
{
    var aLink = _.find(GameMan.getStructureForRoom('link',this.room), (aLink) => aLink.pos.inRangeTo(this.pos,2));
    var aBox = _.find(GameMan.getStructureForRoom('container',this.room), (aBox) => aBox.pos.isNearTo(this.pos));

    if (!_.isUndefined(aLink))
    {
        Log(undefined,'SOURCE '+this.pos.roomName+' ['+this.pos.x+' '+this.pos.y+']: hasLink');
        return SOURCE_TYPE.link;
    }
    else if (!_.isUndefined(aBox))
    {
        Log(undefined,'SOURCE '+this.pos.roomName+' ['+this.pos.x+' '+this.pos.y+']: hasBox');
        return SOURCE_TYPE.box;
    }

    Log(undefined,'SOURCE '+this.pos.roomName+' ['+this.pos.x+' '+this.pos.y+']: drop source');
    return OURCE_TYPE.drop;
}

Source.prototype.init = function(pProxy)
{
    Log(undefined,'SOURCE: init - '+pProxy.id+' proxy: '+JS(pProxy));
    pProxy.homeSpawn = _.min(PCache.getCache()[ENTITY_TYPES.spawn], (aSpawn) => aSpawn.pos.getRangeTo(this.pos));

    var aRange = 1;
    var aArea = this.pos.adjacentPositions(aRange);
    pProxy.possibleMiningPositions = aArea;
}
