Source.prototype.possibleMiningPositions = function(pVisualize = false)
{
    var aRange = 1;
    var aArea = this.pos.adjacentPositions(aRange);

    if (pVisualize)
    {
        Visualizer.visualizeArea(aArea, ({x,y}) =>
        {
            this.room.visual.circle(Number(x),Number(y), {fill: COLOR.green});
        });
    }
    return aArea;
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
