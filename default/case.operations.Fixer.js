class OperationsFixer
{
    constructor()
    {
        this.mOperationEntities = {};
        this.FIXER_GRAPH =
        [
            {   x: 42,   y: 41, roomName:"E66N49", next:  1, },
            {   x: 44,   y: 26, roomName:"E66N49", next:  2, },
            {   x: 31,   y: 25, roomName:"E66N49", next:  3, },
            {   x: 13,   y: 39, roomName:"E66N49", next:  4, },
            {   x:  1,   y: 36, roomName:"E66N49", next:  5, },

            {   x: 48,   y: 36, roomName:"E65N49", next:  6, },
            {   x: 33,   y: 25, roomName:"E65N49", next:  7, },
            {   x: 30,   y: 43, roomName:"E65N49", next:  8, },
            {   x: 28,   y: 48, roomName:"E65N49", next:  9, },
            {   x: 20,   y: 18, roomName:"E65N49", next: 10, },
            {   x: 45,   y: 27, roomName:"E65N49", next: 11, },
            {   x:  1,   y: 11, roomName:"E65N49", next: 12, },

            {   x: 12,   y: 48, roomName:"E66N49", next: 13, },

            {   x: 12,   y:  1, roomName:"E66N48", next: 14, },
            {   x: 45,   y: 25, roomName:"E66N48", next: 15, },
            {   x: 37,   y: 40, roomName:"E66N48", next: 16, },
            {   x: 32,   y: 43, roomName:"E66N48", next: 17, },
            {   x: 29,   y: 43, roomName:"E66N48", next:  0, },
        ];
    }


    processOperation()
    {
        logDERP('Roads: '+this.getEntities(ROOM_OBJECT_TYPE.road).length);
        logDERP('Container: '+this.getEntities(ROOM_OBJECT_TYPE.container).length);
        this.roadGraph();
    }

    getEntities(pEntityType)
    {
        if (_.isUndefined(pEntityType)) return;
        var result = this.mOperationEntities[pEntityType];
        return ( result == undefined ? [] : result );
    }


    registerEntity(pEntity, pEntityType)
    {
        if (_.isUndefined(pEntity)) return;
        if (_.isUndefined(pEntityType)) return;

        if (!(
                    pEntityType == ROOM_OBJECT_TYPE.road
                ||  pEntityType == ROOM_OBJECT_TYPE.container
                ||  (pEntityType == ROOM_OBJECT_TYPE.creep && pEntity.myRole.myName == 'fixer')
            ))
        {
            logERROR('OperationsFixer - registerStructure: only STRUCTURE_ROAD || STRUCTURE_CONTAINER allowed!');
            return;
        }

        var value = this.mOperationEntities[pEntityType];

        if (_.isUndefined(value))
        {
            this.mOperationEntities[pEntityType] = [];
        }
        this.mOperationEntities[pEntityType].push(pEntity);
        return this.mOperationEntities[pEntityType];
    };

    findAdjacentRoads(pPos)
    {
        //console.log('Prototype: ['+sourcePos.x+' '+sourcePos.y+']');
        var dX = [ 0, 1, 1, 1, 0,-1,-1,-1];
        var dY = [-1,-1, 0, 1, 1, 1, 0,-1];

        var result = [];
        for (var i=0; i<dX.length; i++)
        {
            var nX = pPos.x+dX[i];
            var nY = pPos.y+dY[i];
            var derp = _.forEach(Game.rooms[pPos.roomName].lookForAt(LOOK_STRUCTURES,nX,nY), (a) =>
            {
                if (a.structureType == STRUCTURE_ROAD)
                {
                    result.push(a);
                }
            });
        };
        return result;
    }

    roadGraph()
    {
        //var aRoad = this.mRoads[100];
        //var aRes = this.findAdjacentRoads(aRoad.pos);

        _.forEach(this.getEntities(ROOM_OBJECT_TYPE.road), (aRoad) =>
        {
            // var aNearRoads = _.filter(this.mRoads, (a) => { return aRoad.pos.getRangeTo(a) == 1});
            // if (aNearRoads.length == 1)
            // {
            //     logDERP(' aEndNode: '+JSON.stringify(aNearRoads[0].pos));
            // }
            var aNearRoads = this.findAdjacentRoads(aRoad.pos);
            //logDERP(' aEndNode: '+aNearRoads.length);
            //logDERP(' aEndNode: '+JSON.stringify(aNearRoads[0].pos));

            if (aNearRoads.length == 1)
            {
                //logDERP(' aEndNode: '+JSON.stringify(aRoad.pos));
                var aLook = aRoad.room.lookForAt(LOOK_FLAGS,aRoad.pos.x,aRoad.pos.y);
                if (aLook.length == 0)
                {
                    //logDERP('aLook = '+JSON.stringify(aLook));
                    aRoad.room.createFlag(aRoad.pos.x,aRoad.pos.y,undefined,COLOR_YELLOW,COLOR_YELLOW);
                }
            }
            if (aNearRoads.length > 2)
            {
                //logDERP(' aEndNode: '+JSON.stringify(aNearRoads[0].pos));
                var aLook = aRoad.room.lookForAt(LOOK_FLAGS,aRoad.pos.x,aRoad.pos.y);
                if (aLook.length == 0)
                {
                    //logDERP('aLook = '+JSON.stringify(aLook));
                    aRoad.room.createFlag(aRoad.pos.x,aRoad.pos.y,undefined,COLOR_YELLOW,COLOR_RED);
                }
            }
        });
    }

    calcGraph()
    {
        var aGraph = this.FIXER_GRAPH;

        var aTripLength = 0;
        var p = undefined;
        _.forEach(aGraph, (a) =>
        {
            var aRoom = Game.rooms[a.roomName];
            var buffy = new RoomPosition(a.x,a.y,a.roomName);

            var aLook = aRoom.lookForAt(LOOK_FLAGS,a.x,a.y);
            if (aLook.length == 0)
            {
                logDERP('aLook = '+JSON.stringify(aLook));
                aRoom.createFlag(a.x,a.y);
            }

            if (!_.isUndefined(p))
            {
                var aPath = Util.getPath(p,buffy);
                logDERP('['+a.x+' '+a.y+']\t'+aPath.path.length+'\ttrip: '+aTripLength);
                aTripLength += aPath.path.length;
            }
            p = buffy;
        });
        logDERP('TRIP: '+aTripLength);

    }

    markFixables()
    {
        var myRoads = [];
        _.forEach(Game.rooms, (aRoom) =>
        {
            var myRoomRoads = _.filter(aRoom.getRoomObjects(ROOM_OBJECT_TYPE.road), (aRoad) =>
            {
                myRoads.push(aRoad);
                return true;
            });
        });


        _.forEach(myRoads, (a) =>
        {
            //logDERP(JSON.stringify(a));

            var aLook = a.room.lookForAt(LOOK_FLAGS,a.pos.x,a.pos.y);
            if (aLook.length == 0)
            {
                //logDERP('aLook = '+JSON.stringify(aLook));
                var aDelta =  (a.hitsMax - a.hits);
                if (aDelta >= 100 && aDelta < 200 ) a.room.createFlag(a.pos.x,a.pos.y,undefined,COLOR_BLUE,COLOR_YELLOW);
                else if (aDelta >= 200 ) a.room.createFlag(a.pos.x,a.pos.y,undefined,COLOR_BLUE,COLOR_RED);
            }
            else
            {
                var aFlag = aLook[0];
                var aDelta =  (a.hitsMax - a.hits);
                if (aDelta < 100)
                {
                    if (aFlag.color != COLOR_WHITE)
                    {
                        aFlag.remove();
                    }
                }
                else if (aDelta >= 100 && aDelta < 200 ) aFlag.setColor(COLOR_BLUE,COLOR_YELLOW);
                else if (aDelta >= 200 ) aFlag.setColor(COLOR_BLUE,COLOR_RED);
            }
        });

    }
}
module.exports = OperationsFixer;
