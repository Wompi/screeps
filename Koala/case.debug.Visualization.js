'use strict'

class Vizualization
{
    constructor()
    {
    }

    visualizePoints(pRoomName,pPoints,pStyle = {fill: 'transparent', stroke: COLOR.yellow })
    {
        var aRoom = Game.rooms[pRoomName];
        _.forEach(pPoints, (aP) =>
        {
            aRoom.visual.circle(aP[0],aP[1],pStyle);
        });
    }

    visualizePath(pPath,pStyle = {fill: 'transparent', radius: 0.25, stroke: COLOR.green })
    {
        _.forEach(pPath, (aRoomPosition) =>
        {
            var aRoom = Game.rooms[aRoomPosition.roomName];
            if (!_.isUndefined(aRoom))
            {
                aRoom.visual.circle(aRoomPosition.x,aRoomPosition.y,pStyle);
            }
        });
    }

    visualizeCreep(pCreep)
    {
        if (_.isUndefined(pCreep)) return;

        let x = pCreep.pos.x - 0.125;
        let y = pCreep.pos.y - 0.5;

        let a = pCreep.ticksToLive/CREEP_LIFE_TIME ;
        Log(LOG_LEVEL.debug,JS(a))

        pCreep.room.visual.rect(x,y,0.25,1,{stroke: COLOR.yellow, opacity: 0.5})
        pCreep.room.visual.rect(x,y,0.25,a,{fill :COLOR.yellow,opacity:1 })
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

    /**
     *  You can use this to visualize a range to a certain point - the parameter can controll if the outline of the
     *  Area is painted or the notmal center outline
     *
     *   example: Visualizer.visalizeRange(new RoomPosition(37,36,'W47N84'),3,false)
     *
     */
    visalizeRange(pPos,pRange,pAsOutline = true, pStyle = {fill: 'transparent', stroke: COLOR.yellow })
    {
        let aPos = _.isUndefined(pPos.pos) ? pPos : pPos.pos;
        let aOff = pAsOutline ? 0.5 : 0;
        var x = _.max([0,aPos.x-pRange]);
        var y = _.max([0,aPos.y-pRange]);

        let pRange_X =  pRange*2 - ((x==0) ? aPos.x : 0);
        let pRange_Y =  pRange*2 - ((y==0) ? aPos.y : 0);

        Game.rooms[aPos.roomName].visual.rect(x-aOff, y-aOff, _.min([pRange_X,49-x])+2*aOff, _.min([pRange_Y,49-y])+2*aOff,pStyle);
        Game.rooms[aPos.roomName].visual.circle(pPos.x,pPos.y);
    }


    visualizeCostMatrix(pMatrix,pRoom, pStyle = {fill: 'transparent', stroke: COLOR.yellow })
    {
        _.times(50,(xIndex) =>
        {
            _.times(50,yIndex =>
            {
                let aValue = pMatrix.get(xIndex,yIndex);
                let aStyle = undefined;
                if (aValue == COSTMATRIX_BLOCK_VALUE)
                {
                    aStyle = { stroke: COLOR.red };
                }
                else if (aValue > 0)
                {
                    aStyle = pStyle;
                }

                if (!_.isUndefined(aStyle)) pRoom.visual.circle(xIndex,yIndex,aStyle);
            });
        });
    }
}
module.exports = Vizualization;
