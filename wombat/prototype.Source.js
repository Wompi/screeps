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
