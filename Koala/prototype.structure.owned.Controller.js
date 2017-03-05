
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
        onInvalid: (pLastUpdate) =>
        {
            // var aDownTick = Game.time - (pLastUpdate + this.ticksToDowngrade);
            // var aCoolTick = Game.time - (pLastUpdate + this.safeModeCooldown);

            // Log(undefined,'StructureController: not visible - downGrade: '+aDownTick+' saveModeCool: '+aCoolTick);
            return true;
        },
        onChange: (pLastUpdate,pLastEntity) =>
        {
            let aDeltaProgress = this.progress - pLastEntity.progress;
            let aDeltaUpdate = Game.time - pLastUpdate;
            let deltaRCL = this.progressTotal - this.progress;
            let aAvg = _.floor(aDeltaProgress/aDeltaUpdate);
            Log(undefined,'StructureController: '+this.pos.toString()+' onChange - deltaProgress: '+aDeltaProgress+' age: '+aDeltaUpdate+' avg: '+aAvg+' needs: '+deltaRCL+' saveMode: '+this.saveMode+' down: '+this.ticksToDowngrade+' saveCool: '+this.safeModeCooldown);
        },
    };
}




StructureController.prototype.init = function(pProxy)
{
    Log(LOG_LEVEL.info,'STRUCTURE CONTROLLER: '+this.pos.toString()+' init - '+pProxy.id+' proxy: '+pProxy.toString());
    var aRange = 3;
    var aArea = this.pos.inBoundPositions(aRange);
    pProxy.upgradePositions = aArea;
    pProxy.isMine = this.my || (!_.isUndefined(this.reservation) && this.reservation.username == USER_NAME);
}
