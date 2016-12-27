var FixerNode = require('case.operations.FixerNode');
var FixerRole = require('case.operations.FixerRole');

class OperationsFixer
{
    constructor()
    {
        this.mOperationEntities = {};
        this.mNode = new FixerNode();
        this.mRole = new FixerRole(this);
        this.FIXER_COST = 400;
    }

    processOperation()
    {
        this.printRepairState();

        this.roadGraph();
        //this.handleCreep();
    }

    handleCreep()
    {
        var myFixers = this.getEntities(ROOM_OBJECT_TYPE.creep);
        if (myFixers.length == 0)
        {
            var aSpawn = this.getSpawn();
            this.spawnCreep(aSpawn);
        }
        else
        {
            _.forEach(myFixers, (aFixer) => {this.mRole.processRole(aFixer)});
            logDERP('FIXER ROLE ..... ');
        }
    }

    getSpawn()
    {
        var aSpawn = _.min(Game.spawns, (a) =>
        {
            if (a.room.energyAvailable < this.FIXER_COST) return MAX_ROOM_RANGE
            var aSpawnPos = a.getSpawnPos();
            if (_.isUndefined(aSpawnPos)) return MAX_ROOM_RANGE;
            var aLen = Util.getPath(aSpawnPos,this.mNode.getCurrentNode()).path.length;
            //logDERP('a = '+a.name+' len = '+aLen+' pos = '+JSON.stringify(aSpawnPos));
            return aLen;
        });
        return aSpawn;
    }

    spawnCreep(pSpawn)
    {
        var aBody = [WORK,WORK,CARRY,CARRY,MOVE,MOVE];

        var aMem =
        {
            role: 'fixer',
        };

        logDERP('Fixer operations: '+pSpawn.name);
        // var result = pSpawn.createCreep(aBody,'Fixer',aMem);
        // if (typeof result === 'string')
        // {
        //     logWARN('New FIXER Creep '+result+' .. '+ErrorSting(result));
        //     Game.creeps[result].init();
        // }
        // else
        // {
        //     logERROR('Something is fishy with FIXER spawn in room '+pSpawn.room.name+' .. ');
        // }
    }

    getEntities(pEntityType)
    {
        if (_.isUndefined(pEntityType)) return;
        var result = this.mOperationEntities[pEntityType];
        return ( result == undefined ? [] : result );
    }


    printRepairState()
    {
        var myRoads = this.getEntities(ROOM_OBJECT_TYPE.road);

        var maxSumRoads = _.sum(myRoads,'hitsMax');
        var hitsSumRoads = _.sum(myRoads,'hits');
        logDERP('ROADS:\t'+`<progress style='width: 500px;' value='${ hitsSumRoads }' max='${ maxSumRoads }'/>`);

        var myContainer = this.getEntities(ROOM_OBJECT_TYPE.container)
        var maxSumBox = _.sum(myContainer,'hitsMax');
        var hitsSumBox = _.sum(myContainer,'hits');
        logDERP('BOXS:\t'+`<progress style='width: 500px;' value='${ hitsSumBox }' max='${ maxSumBox }'/>`);


        logDERP('Roads: '+myRoads.length);
        logDERP('Container: '+myContainer.length);
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
