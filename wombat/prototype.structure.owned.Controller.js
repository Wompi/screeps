
StructureController.prototype.visualize = function()
{
    var aArea = this.getProxy().upgradePositions;

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

// StructureController.prototype.upgradePositions = function(pVisualize = false)
// {
//     var aRange = 3;
//     var result = []
//     var aArea = this.pos.inBoundPositions(aRange);
//
//     if (pVisualize)
//     {
//         Visualizer.visualizeArea(aArea.area, ({x,y,value}) =>
//         {
//             var aColor = COLOR.yellow;
//             if (value == aArea.max)
//             {
//                 aColor = COLOR.green;
//             }
//             else if (value == 0)
//             {
//                 aColor = COLOR.red;
//             }
//             this.room.visual.circle(Number(x),Number(y), {fill: aColor});
//         });
//     }
//
//     _.forEach(aArea.area, (a,x) =>
//     {
//         _.forEach(a, (value,y) =>
//         {
//             if (value == aArea.max)
//             {
//                 result.push([Number(x),Number(y)]);
//             }
//         });
//     });
//     return result;
// }


StructureController.prototype.getEntityBehavior = function()
{
    return {
        currentEntity: () => Game.getObjectById(this.id),
        onInvalid: () => false,
        onChange: (pLastUpdate,pLastEntity) =>
        {
            let aDeltaProgress = this.progress - pLastEntity.progress;
            let aDeltaUpdate = Game.time - pLastUpdate;
            let deltaRCL = this.progressTotal - this.progress;
            let aAvg = _.floor(aDeltaProgress/aDeltaUpdate);
            Log(undefined,'StructureController: onChange - deltaProgress: '+aDeltaProgress+' age: '+aDeltaUpdate+' avg: '+aAvg+' needs: '+deltaRCL);
        },
    };
}


StructureController.prototype.init = function(pProxy)
{
    Log(undefined,'STRUCTURE CONTROLLER: init - '+pProxy.id+' proxy: '+JS(pProxy));

    var aRange = 3;
    var aArea = this.pos.inBoundPositions(aRange);
    pProxy.upgradePositions = aArea;
}
