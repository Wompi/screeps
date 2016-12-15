var mySC = require('case.SpawnCenter');

class TestCenter
{
    constructor()
    {
    }

    calcMineralCreep()
    {
        var aAmount = 57000;
        var harvestTicks = aAmount/EXTRACTOR_COOLDOWN;

        for (var i=1; i<20; i++)
        {
            var moveParts = _.ceil((i)/2);
            var bodyCost = moveParts*50  + i * 100;
            var ticksToClear = (56500/i ) * 5;
            var allCost = (ticksToClear/1500) * bodyCost;
            if (bodyCost > 2300) break;
            logERROR('BODY: ['+i+'|0|'+moveParts+'] BC: '+bodyCost.toFixed(2)+' TTC: '+ticksToClear.toFixed(2)+' AC: '+allCost.toFixed(2));
        }
    }


    /**
     * HTML table in console
     * ex: Log.table(['a','b'], [[1,2],[3,4]])
     */
    table(headers, rows) {

        let msg = '<table>';
        _.each(headers, h => msg += '<th width="50px">' + h + '</th>');
        _.each(rows, row =>  msg += '<tr>' + _.map(row, el => (`<th>${el}</th>`)) + '</tr>');
        msg += '</table>'
        // console.log(msg);
        return msg;
    }


    storeTest(pID)
    {
        var aBox = Game.getObjectById(pID);
        if (_.isNull(aBox)) return;

        logDERP('STORE: '+JSON.stringify(aBox.store));

        var aStore = _.filter(_.keys(aBox.store), (aKey) => { return (aKey != RESOURCE_ENERGY); });

        var aDerp = {};
        _.forEach(aStore, (a) => { aDerp[a] = aBox.store[a]});
        logDERP('STORE: '+JSON.stringify(aDerp) +' sum = '+_.sum(aDerp));
    }

    gravityTest(pRoomName)
    {
        var aRoom = Game.rooms[pRoomName];
        if (_.isUndefined(pRoomName)) return;

        var myRoomContainers = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.container);
        var myRoomCreeps = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.creep);

        var myCreeps = _.filter(myRoomCreeps, (a) => { return a.memory.role == 'supplier'});
        if (myCreeps.length == 0 ) return;

        var aCreep = myCreeps[0];


        var derp = [];

        _.forEach(myRoomContainers, (a) =>
        {
            var aPath = aCreep.pos.findPathTo(a,{ignoreCreeps: true, range: 1});
            var aG = 10;
            var aM1 = _.max([1,_.sum(a.store)]);
            var aM2 = _.max([1,_.sum(aCreep.carry)]);
            var aR = _.max([1,aPath.length]);
            var aF = aG * (aM1 * aM2)/ (aR * aR);

            if (aM2 == 1)
            {
                if (a.isOUT())
                {
                    logDERP('OUT ['+a.pos.x+' '+a.pos.y+'] aF:'+aF.toFixed(2)+'    \taM1: '+aM1+'\t   aM2:'+aM2+'\taR: '+aR);
                }
            }
            else
            {
                if (a.isIN())
                {
                    logDERP(' IN ['+a.pos.x+' '+a.pos.y+'] aF:'+aF.toFixed(2)+'    \taM1: '+aM1+'\t   aM2:'+aM2+'\taR: '+aR);
                }
            }



        })

    }


    claimPath()
    {
        var aFlagRole = Flag.FLAG_COLOR.remote.miner;
        var pFlag = _.filter(Game.flags,aFlagRole.filter);

        logERROR('FLAG: pioneer - '+JSON.stringify(pFlag));

        if (pFlag.length == 0)
        {
            logERROR('FLAG: not found!');
            return;
        }

        var aFlag = pFlag[0];

        var a = Game.cpu.getUsed();
        var fromPos = Game.spawns['Casepool'].pos;
        var toPos = aFlag.pos;

        var myPath = PathFinder.search(fromPos,toPos,
        {
            plainCost: 2,
            swampCost: 5,
            costCallback: function(roomName)
            {
                let room = Game.rooms[roomName];
                // In this example `room` will always exist, but since PathFinder
                // supports searches which span multiple rooms you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;

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
            },
            maxOps: 3000,
        });

        logERROR('FLAG PATH: '+myPath.path.length);
        var b = Game.cpu.getUsed();
        logERROR('PROFILE CLAIM PATH: '+(b-a));
        for (var aPath of myPath.path)
        {

        }


        myPath.path = [];
        logERROR('FLAG PATH: '+JSON.stringify(myPath));
    }

    calculateDistanceByPath(pos1,pos2)
    {
        var aPath = pos1.findPathTo(pos2,
        {
            ignoreCreeps: true,
            range: 1
        })
        //logERROR('PATH LENGTH: '+JSON.stringify(aPath));
        logERROR('PATH LENGTH: '+aPath.length);
    }

    calcMiner()
    {
        var ENERGY = 3000;

        var aEnergy = Game.rooms['E66N49'].energyAvailable;

        var MAX_CARRY_MODULES = 1
        var MAX_WORK_MODULE = _.floor((aEnergy-MAX_CARRY_MODULES*BODYPART_COST[CARRY])/BODYPART_COST[WORK]);
        var MAX_MOVE_MODULE = _.floor((aEnergy-MAX_CARRY_MODULES*BODYPART_COST[CARRY])/BODYPART_COST[MOVE]);

        logERROR('TEST MINER CARRY: '+MAX_CARRY_MODULES+' WORK: '+MAX_WORK_MODULE+' MOVE: '+MAX_MOVE_MODULE);
        var myBodys = [];
        for (var myWork=1; myWork < (MAX_WORK_MODULE+1); myWork++)
        {
            var aBody = [{"type":CARRY}];
            var aBodyCost = BODYPART_COST[CARRY];
            for (var i=0; i<myWork ; i++)
            {
                // aBody.push({"type":WORK});
                // aBody.push({"type":MOVE});
                // aBodyCost = aBodyCost + BODYPART_COST[MOVE] + BODYPART_COST[WORK];
                aBody.push({"type":WORK});
                //aBody.push({"type":MOVE});
                aBodyCost = aBodyCost + BODYPART_COST[WORK];

            }

            if (aBodyCost > aEnergy) break;
            myBodys.push(aBody);
        }

        _.forEach(myBodys, (a) =>
        {
            logERROR('TEST MINER: '+JSON.stringify(_.countBy(a,'type')));
        });

        var minBody = undefined;
        var minDeltaRepair = 10000000;
        for (var aBody of myBodys)
        {
            var myParts = _.countBy(aBody,'type');
            //logERROR('DERP '+JSON.stringify(myParts));
            var aHarvestAmount = myParts.work * HARVEST_POWER;
            var aRepairAmount = myParts.work * UPGRADE_CONTROLLER_POWER; //BUILD_POWER;
            var aCapacity = SOURCE_ENERGY_CAPACITY;

            var aTicks = _.floor(aCapacity/aHarvestAmount);
            var aRepair = (ENERGY_REGEN_TIME - _.min([aTicks,ENERGY_REGEN_TIME])) * aRepairAmount;

            var delta = SOURCE_ENERGY_CAPACITY - aRepair;
            if (delta < 0) delta = delta * (-1);
            if ( minDeltaRepair > delta)
            {
                minDeltaRepair = delta;
                minBody = aBody;
            }


            logERROR('HARVEST TICKS ['+myParts.work+']: '+aTicks+' REST: '+(aCapacity-(aTicks*aHarvestAmount))+' BUILD: '+aRepair);

        }

        var aBodyCount = _.countBy(minBody,'type');
        var aBodyCost = 0
        for (var aID in aBodyCount)
        {
            aBodyCost = aBodyCost + BODYPART_COST[aID] * aBodyCount[aID];
        }

        logERROR('HARVEST '+JSON.stringify(aBodyCount)+' COST: '+aBodyCost);
    }

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

    showChaedMarketReport()
    {
        for (var aID in Memory.market)
        {
            var aRoom = Memory.market[aID].roomName;
            var aAmount = Memory.market[aID].amount;
            var aPrice = Memory.market[aID].price;
            var aCost = Game.market.calcTransactionCost(aAmount,'E66N49',aRoom);
            var aRange = Game.map.getRoomLinearDistance('E66N49',aRoom,true);
            var aMargin = (aAmount * aPrice);

            var derp = aMargin / (aAmount + aCost);
            logERROR('ROOM: '+aRoom+'\tRANGE: '+aRange+'\tAMOUNT: '+aAmount+'\tCOST: '+aCost+'\tCREDITS: '+aMargin.toFixed(2)+'\tDERP: '+derp.toFixed(2));
        }
    }


    showCachedMarketOrder(id)
    {
        var aOrder = Game.market.getOrderById(id);
        logERROR('ORDER: '+JSON.stringify(aOrder));
    }

    showMarketOrders()
    {
        //if (_.isUndefined(range)) return;



        var myOrders = Game.market.getAllOrders(
        {
            type: ORDER_BUY,
            //resourceType: RESOURCE_ENERGY,
            resourceType: RESOURCE_ZYNTHIUM
        });


        if (myOrders.length == 0)
        {
            logERROR('No market orders in range!');
            return;
        }
        else
        {
            logERROR('ORDERS: length - '+myOrders.length);
        }


        if (_.isUndefined(Memory.market))
        {
            Memory.market = {};
        }

        for (var aOrder of myOrders)
        {
            Memory.market[aOrder.id] = aOrder;
        }

        logERROR('Ready .. check Memory.market');




        // var myOrders = Game.market.getAllOrders();
        //
        //
        //
        //
        //
        //
        // var myNames = [];
        // for (var aOrder of myOrders)
        // {
        //     //var aDist = Game.map.getRoomLinearDistance('E66N49',aOrder.roomName);
        //     if (aOrder.type == 'buy')
        //     {
        //         //logERROR('DIST: ' +aOrder.roomName+' '+aDist );
        //         logERROR(JSON.stringify(aOrder));
        //     }
        //
        //     // if (Game.map.getRoomLinearDistance('E66N49',aOrder.roomName) < range)
        //     // {
        //     //     logERROR(JSON.stringify(aOrder));
        //     // }
        //     // else
        //     // {
        //     //     myNames.push(aOrder.roomName);
        //     // }
        // }
        // logERROR('ORDERS: '+JSON.stringify(myNames));
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
