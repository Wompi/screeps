var mySC = require('case.SpawnCenter');

class TestCenter
{

    constructor()
    {
        //_.reduce(body, (result, type) => result += (type == C.CARRY) ? (C.CARRY_CAPACITY) : 0, 0)

    }


    storeTest(aID)
    {
        var aBox = Game.getObjectById(aID);
        if (_.isNull(aBox)) return;

        var aStore = aBox.store;
        logDERP('DERP STORE: '+JSON.stringify(aStore));
        var aResult = _.reduce(aStore, (result, type, key) =>
        {
            logDERP(' result = '+JSON.stringify(result)+' type = '+JSON.stringify(type)+' key = '+JSON.stringify(key));
            result += (key == RESOURCE_ENERGY) ?  0 : type;

            return result;
        },0);
        logDERP('DERP STORE: '+JSON.stringify(aResult));

    }



    /**
     * HTML table in console
     * ex: Log.table(['a','b'], [[1,2],[3,4]])
     */
    table(headers, rows) {

        let msg = '<table>';
        _.each(headers, h => msg += '<th width="90px">' + h + '</th>');
        _.each(rows, row =>  msg += '<tr>' + _.map(row, el => (`<th>${el}</th>`)) + '</tr>');
        msg += '</table>'
        // console.log(msg);
        return msg;
    }


    // storeTest(pID)
    // {
    //     var aBox = Game.getObjectById(pID);
    //     if (_.isNull(aBox)) return;
    //
    //     logDERP('STORE: '+JSON.stringify(aBox.store));
    //
    //     var aStore = _.filter(_.keys(aBox.store), (aKey) => { return (aKey != RESOURCE_ENERGY); });
    //
    //     var aDerp = {};
    //     _.forEach(aStore, (a) => { aDerp[a] = aBox.store[a]});
    //     logDERP('STORE: '+JSON.stringify(aDerp) +' sum = '+_.sum(aDerp));
    // }



    calculateRoomCreepCost()
    {
        for (var aID in Game.rooms)
        {
            var aRoom = Game.rooms[aID];
            var creepCost = 0;
            for (var aCreep of aRoom.myCreeps)
            {
                creepCost += aCreep.bodyCost;
            }

            logERROR('ROOM '+aRoom.name+' CREEP_COST: '+creepCost+' E/TICK: '+(creepCost/1500));
        }
    }

    caclulateRepairCosts(pRoomName)
    {
        var aRoom = Game.rooms[pRoomName];
        if (_.isUndefined(aRoom)) return;

        var result = aRoom.myMaintenanceCost;

        logDERP('--------------- COST: '+result+' ---------------------------');
    }


    newSpawnHelperTest(roomName)
    {
        var aRoom = Game.rooms[roomName];
        if (_.isUndefined(aRoom)) return;

        var derp = mySC.CREEP_SPAWN_BODY.TOWER_HAULER;

        var aTest = mySC.getSpawnCreepBody(aRoom,derp);
        logERROR('DERP TEST '+JSON.stringify(derp) );
    }

    calculateBuilder()
    {
        var builderNeed = 0;
        for ( var i=1; i<62 ; i++)
        {
            var dist = i*2;
            builderNeed += (300 / 15) ;
            var energy = 15 * dist;
            var neededHauler = _.ceil(energy/200);
            var haulerCost = 300 * neededHauler;
            logERROR('Dist: '+dist+' builderPos/time: '+builderNeed+' energy: '+energy+' neededHauler: '+neededHauler+' haulerCost: '+haulerCost);
        }
    }

    terminalTest()
    {
        var aTerminal = Game.getObjectById('5849be798119cb1102ef5c75');

        logDERP(' needsResource = '+aTerminal.needResource());
        logDERP(' neededResources = '+JSON.stringify(aTerminal.getNeededResources()));

    }

    checkRoadMap(pRoomName)
    {
        var aRoom = Game.rooms[pRoomName];
        if (_.isUndefined(aRoom)) return;

        var myRoomRoads = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.road);


        if (_.isUndefined(Memory.test))
        {
            Memory.test = { };
            Memory.test.roads = { id: { }, needsChange: true };
        }

        var a = Game.cpu.getUsed();
        var count = 0

        if (Memory.test.roads.needsChange)
        {
            _.forEach(myRoomRoads, (aRoad) =>
            {
                var myConnects = _.filter(myRoomRoads, (a) =>
                {
                    count++;
                    return aRoad.pos.getRangeTo(a) == 1;
                });

                _.forEach(myConnects, (a) =>
                {
                    if (_.isUndefined(Memory.test.roads.id[aRoad.id]))
                    {
                        Memory.test.roads.id[aRoad.id] = [];
                    }
                    Memory.test.roads.id[aRoad.id].push(aRoad.pos.getDirectionTo(a));
                });
                //logDERP(' connects = '+myConnects.length+' x = '+aRoad.pos.x+' y = '+aRoad.pos.y);
            });
            Memory.test.roads.needsChange = false;
        }
        var b = Game.cpu.getUsed();
        logERROR('PROFILE ('+count+') roadMap - lookAt '+(b-a)+' tick: '+((b-a)/myRoomRoads.length));


    }

    nearAreaTest(x,y,name)
    {
        var a = Game.cpu.getUsed();
        for (var aRoad of Game.rooms[name].myRoads)
        {
            var derp = Game.rooms[name].lookAtArea(aRoad.pos.x-1,aRoad.pos.y-1,aRoad.pos.x+1,aRoad.pos.y+1);
            //logERROR('DERP: '+JSON.stringify(derp,undefined,'          '));
        }
        var b = Game.cpu.getUsed();
        logERROR('PROFILE lookAreaNear - '+(b-a)+' tick: '+((b-a)/Game.rooms[name].myRoads.length));
    }

    getPath(pos1, pos2)
    {
        var myPath = PathFinder.search(pos1,pos2,
        {
            plainCost: 2,
            swampCost: 5,
            range: 1,
            maxOps: 3000,
            roomCallback: function(roomName)
            {
                let room = Game.rooms[roomName];
                // In this example `room` will always exist, but since PathFinder
                // supports searches which span multiple rooms you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;

                //logDERP(' pathroom = '+room.name);
                room.find(FIND_STRUCTURES).forEach(function(structure)
                {
                    if (structure.structureType === STRUCTURE_ROAD)
                    {
                        // Favor roads over plain tiles
                        costs.set(structure.pos.x, structure.pos.y, 1);
                    }
                    else if (structure.structureType !== STRUCTURE_CONTAINER && (structure.structureType !== STRUCTURE_RAMPART || !structure.my))
                    {
                        // Can't walk through non-walkable buildings
                        costs.set(structure.pos.x, structure.pos.y, 0xff);
                    }
                });

                // Avoid creeps in the room
                // room.find(FIND_CREEPS).forEach(function(creep)
                // {
                //     costs.set(creep.pos.x, creep.pos.y, 0xff);
                // });
                return costs;
            }
        });
        return myPath;
    }

    calculatePathLength(flagName1, flagName2)
    {
        var fromPos = Game.flags[flagName1];
        var toPos = Game.flags[flagName2];

        if (_.isUndefined(fromPos))
        {
            logERROR('Could not found flag '+flagName1);
            return;
        }
        if (_.isUndefined(toPos))
        {
            logERROR('Could not found flag '+flagName2);
            return;
        }


        var myPath = PathFinder.search(fromPos.pos,toPos.pos,
        {
            plainCost: 2,
            swampCost: 5,
            range: 1,
            maxOps: 3000,
            roomCallback: function(roomName)
            {
                let room = Game.rooms[roomName];
                // In this example `room` will always exist, but since PathFinder
                // supports searches which span multiple rooms you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;

                logDERP(' pathroom = '+room.name);
                room.find(FIND_STRUCTURES).forEach(function(structure)
                {
                    if (structure.structureType === STRUCTURE_ROAD)
                    {
                        // Favor roads over plain tiles
                        costs.set(structure.pos.x, structure.pos.y, 1);
                    }
                    else if (structure.structureType !== STRUCTURE_CONTAINER && (structure.structureType !== STRUCTURE_RAMPART || !structure.my))
                    {
                        // Can't walk through non-walkable buildings
                        costs.set(structure.pos.x, structure.pos.y, 0xff);
                    }
                });

                // Avoid creeps in the room
                // room.find(FIND_CREEPS).forEach(function(creep)
                // {
                //     costs.set(creep.pos.x, creep.pos.y, 0xff);
                // });
                return costs;
            }
        });
        var len = myPath.path.length;

        logDERP('DERP '+JSON.stringify(myPath.path));

        _.forEach(myPath.path, (a) =>
        {
            var aRoom = Game.rooms[a.roomName];
            aRoom.createFlag(a.x,a.y);
        });


        myPath.path = [];

        logERROR('Path: '+len+' Config: '+JSON.stringify(myPath));

    }

};
module.exports = TestCenter;
