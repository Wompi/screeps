'use strict'

class Vizualization
{
    constructor()
    {
    }

    visualizePoints(pRoomName,pPoints,pStyle = {})
    {
        var aRoom = Game.rooms[pRoomName];
        _.forEach(pPoints, (aP) =>
        {
            aRoom.visual.circle(aP[0],aP[1],pStyle);
        });
    }

    visualizeArea(pArea, pCallback)
    {
        var args = {};
        _.forEach(pArea, (a,x) =>
        {
            _.forEach(a, (ia,y) =>
            {
                _.set(args,'x',x);
                _.set(args,'y',y);
                _.set(args,'value',ia);
                pCallback.call(this,args);
            });
        });
    }
}
module.exports = Vizualization;
