StructureController.prototype.upgradePositions = function(pVisualize = false)
{
    var aRange = 3;
    var result = []
    var aArea = this.pos.inBoundPositions(aRange);

    if (pVisualize)
    {
        Visualizer.visualizeArea(aArea.area, ({x,y,value}) =>
        {
            var aColor = COLOR.yellow;
            if (value == aArea.max)
            {
                aColor = COLOR.green;
            }
            else if (value == 0)
            {
                aColor = COLOR.red;
            }
            this.room.visual.circle(Number(x),Number(y), {fill: aColor});            
        });
    }

    _.forEach(aArea.area, (a,x) =>
    {
        _.forEach(a, (value,y) =>
        {
            if (value == aArea.max)
            {
                result.push([Number(x),Number(y)]);
            }
        });
    });
    return result;
}