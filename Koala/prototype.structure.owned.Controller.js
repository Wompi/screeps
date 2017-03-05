
StructureController.prototype.visualize = function()
{
    var aArea = this.upgradePositions;

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

// StructureController.prototype.init = function(pProxy)
// {
//     Log(LOG_LEVEL.info,'STRUCTURE CONTROLLER: '+this.pos.toString()+' init - '+pProxy.id+' proxy: '+pProxy.toString());
//     var aRange = 3;
//     var aArea = this.pos.inBoundPositions(aRange);
//     pProxy.upgradePositions = aArea;
//     pProxy.isMine = this.my || (!_.isUndefined(this.reservation) && this.reservation.username == USER_NAME);
// }

extend = function()
{
    Object.defineProperties(StructureController.prototype,
    {
        'upgradePositions':
        {
            configurable: true,
            get: function()
            {
                var aRange = 3;
                return this.pos.inBoundPositions(aRange);
            },
        }

    });
};
extend();
