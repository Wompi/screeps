class CaseConsole
{
    constructor()
    {

    }

    test()
    {
        console.log('DERP!');
    }

    move(id, direction)
    {
        var aObj = Game.getObjectById(id);
        if (_.isNull(aObj))
        {
            logERROR('Could not found Object ID!');
            return;
        }
        aObj.move(direction);
    }


    linkCost()
    {
        var linkRange = new RoomPosition(41,42,'E66N49').getRangeTo(new RoomPosition(14,31,'E66N49'));
        var miningAmount = 5 * 2 * 1500;

        var upgraderCost = (800/80 * 100) + 50 + (5 * 50);
        var minerCost = 650

        miningAmount -=  upgraderCost;
        miningAmount -=  minerCost;


        var linkAmount = 0;
        var transferAmount = 0
        var linkCooldown = 0;
        var ticks = 0;
        var wast = 0
        for (var i=0; i < (miningAmount/10); i++)
        {

            linkAmount = _.min([LINK_CAPACITY,linkAmount + 10]);
            //logERROR('linkAmount: '+linkAmount+' cooldown: '+linkCooldown);
            if (linkAmount == LINK_CAPACITY)
            {
                if (linkCooldown == 0)
                {
                    transferAmount += _.floor(linkAmount * (1-LINK_LOSS_RATIO));
                    wast += LINK_CAPACITY - _.floor(linkAmount * (1-LINK_LOSS_RATIO));

                    linkCooldown = linkRange;
                    linkAmount = 0;
                }
            }

            linkCooldown = _.max([0,linkCooldown-1]);
            ticks++;
        }

        logERROR('LINK: '+ticks+' transferAmount: '+transferAmount+' COOLDOWN: '+linkCooldown+' linkAmount: '+linkAmount+' miningAmount: '+miningAmount);
        logERROR('Link cost: '+wast+' minerCost: '+minerCost+' upgraderCost: '+upgraderCost);

    }


    pathCost()
    {
        var fromPos = new RoomPosition(43,40,'E66N49');
        var toPos = new RoomPosition(15,30,'E66N49');

        var myPath = PathFinder.search(fromPos,toPos,
        {
            plainCost: 2,
            swampCost: 10,
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
            }
        });

        var COST_STUFF =
        {
            'swamp': 10,
            'plain': 2,
            'road': 1
        }

        var havestEnergy = 10 * 1500;

        var maxEffEneergy = 0;
        for (var c = 1; c<25; c++)
        {
            for (var m = 1; m < 25; m++ )
            {
                var myBody = [];
                for ( var i = 0; i<c; i++)
                {
                    myBody.push({"type":"carry","hits":100});
                }
                for ( var i = 0; i<m; i++)
                {
                    myBody.push({"type":"move","hits":100});
                }

                var bodyCount = _.countBy(myBody,'type');

                var moveTicks = 0;
                var carryCapacity = bodyCount[CARRY] * 50;
                // // one way full

                for (var aPos of myPath.path)
                {
                    var terrainCost = 1;
                    var cost = bodyCount[CARRY] * terrainCost;
                    var gain = bodyCount[MOVE] * 2;

                    moveTicks = moveTicks + _.ceil(cost/gain);
                }
                var allTicks = moveTicks + myPath.path.length;
                var liveTrips = _.floor(1500/allTicks);
                var liveCapacity = liveTrips * carryCapacity;
                var neededHauler = _.floor(havestEnergy/liveCapacity);
                var haulerCost = myBody.length * 50 * neededHauler;
                var effEnergy = (havestEnergy-haulerCost);

                if (effEnergy > maxEffEneergy)
                {
                    maxEffEneergy = effEnergy;
                    logDEBUG('MOVE TICKS: to - '+moveTicks+' back -'+myPath.path.length+' all: '+allTicks+' TRIPS: '+liveTrips);
                    logDEBUG('CARRY_CAPACITY: '+carryCapacity+' TRIPS: '+liveCapacity);
                    logDEBUG('ENERGY: '+havestEnergy+' Hauler: '+neededHauler+' Haulercost: '+haulerCost+' EFF_ENERGY: '+effEnergy);


                    //logDEBUG('LENGTH: '+myPath.path.length+' '+JSON.stringify(myPath));
                    //logDEBUG('BODY_COUNT: '+JSON.stringify(bodyCount));
                    logDEBUG('BODY: '+JSON.stringify(bodyCount));
                }
            }
        }
    }

    printCombatStats()
    {
        var myInvaders = {};
        for (var aKey in Memory.rooms.E66N49.invaders)
        {
            var aInvader = JSON.parse(Memory.rooms.E66N49.invaders[aKey]);
            //logERROR('INVADER: '+aKey);
            if (_.isUndefined(myInvaders[aInvader.id]))
            {
                myInvaders[aInvader.id] = [];
            }
            aInvader.spotTime = aKey;
            myInvaders[aInvader.id].push(aInvader);
        }
//        var aInvader = _.countBy(Memory.rooms.E66N49.invaders,aKey => { return JSON.parse(aKey).id;});
        var lastSpottime = undefined;
        var attackIntervall = [];
        _.forEach(myInvaders, aInvaders =>
        {
            // _.forEach(aInvaders, aInvader =>
            // {
            //     //var index = _.floor((aInvader.length-1)/2);
            //     var derp = _.filter(aInvader.body, a => { return (a.hits != 0);});
            //     var bodyCount = _.countBy(derp,'type');
            //     //logERROR('INVADERS STATS: '+JSON.stringify(bodyCount,null, ' '));
            //     logERROR('INVADERS STATS: '+JSON.stringify(bodyCount));
            //
            // });

            if (!_.isUndefined(lastSpottime))
            {
                attackIntervall.push(aInvaders[0].spotTime-lastSpottime);
            }
            lastSpottime = aInvaders[0].spotTime;


            logERROR('INVADERS STATS: '+JSON.stringify(_.countBy(aInvaders[0].body,'type'))+' SPOTTIME: '+aInvaders[0].spotTime+' Owner: '+JSON.stringify(aInvaders[0].owner));
        });

        logERROR('Attackintervals: '+JSON.stringify(attackIntervall,undefined,' '));
    }

    flagCheck()
    {
        var aRoom = Game.rooms['E66N49'];
        var aCreep = _.filter(aRoom.myCreeps, (a) => { return (a.memory.role == 'construction')})

        var pFlag = Flag.findClosest(Flag.FLAG_COLOR.construction.primaryConstruction,aCreep.pos,aRoom);

        var myConstructionSites = aRoom.myConstructionSites;
        if (myConstructionSites.length == 0)
        {
            pFlag.remove();
            pFlag = undefined;
        }
        else
        {
            var isValid = false;
            for (var aSite of myConstructionSites)
            {
                if (aSite.pos.inRangeTo(pFlag.pos,3))
                {
                    isValid = true;
                    break;
                }
            }

            if (!isValid)
            {
                pFlag.remove();
                pFlag = undefined;
            }
        }
        logERROR('FLAGS: '+JSON.stringify(pFlag));
    }

    printRepairStats()
    {
        var ticks = Memory.myRepairStats.road.ticks;
        var derp = ticks.slice(1,ticks.length);

        var bla = ticks-derp;
        var myDiff  = [];

        for (var i=0 ; i<ticks.length-1 ; i++)
        {
            myDiff.push(ticks[i+1]-ticks[i]);
        }

        var deltaTime = ticks[ticks.length-1]-ticks[0];
        var ratio = Memory.myRepairStats.road.cost / deltaTime;

        console.log(myDiff);
        console.log('TIME: '+deltaTime+' RATION: '+ratio);
    }

    findMinRepairSpot()
    {
        var myWalkables = [];
        var myFixables = Game.rooms['E66N49'].find(FIND_STRUCTURES,
        {
            filter: (aFixable) =>
            {
                var result = (
                       aFixable.structureType == STRUCTURE_ROAD
                    || aFixable.structureType == STRUCTURE_CONTAINER
                );
                return result;
            }
        });

        for (var x=0; x<=49; x++ )
        {
            for (var y=0; y<=49; y++ )
            {
                var myTerrain = Game.map.getTerrainAt(x,y,'E66N49');
                if (myTerrain != 'wall')
                {
                    myWalkables.push(new RoomPosition(x,y,'E66N49'));
                }
            }
        }

        var minFixPos = undefined;
        var minFixCosts = 1000000;

        Memory.myRepairStats.fixCost = {};

        for (var aRoomPos of myWalkables)
        {
            var myFixCosts = 0.0;
            for (var aFixable of myFixables)
            {
                //console.log(JSON.stringify(aFixable));
                var decayTicks = 0 ;
                var decayAmount = 0;
                var myRange = aFixable.pos.getRangeTo(aRoomPos);
                var repairEffectivness = StructureTower.calculateTowerEffectiveness(myRange,TOWER_POWER_REPAIR)/TOWER_ENERGY_COST;
                if (aFixable.structureType == STRUCTURE_ROAD)
                {
                    myTerrain = Game.map.getTerrainAt(aFixable.pos);
                    if ( myTerrain == 'swamp')
                    {
                        decayTicks = ROAD_DECAY_TIME;
                        decayAmount = ROAD_DECAY_AMOUNT * CONSTRUCTION_COST_ROAD_SWAMP_RATIO/repairEffectivness;
                    }
                    else
                    {
                        decayTicks = ROAD_DECAY_TIME;
                        decayAmount = ROAD_DECAY_AMOUNT/repairEffectivness;
                    }
                }
                else if (aFixable.structureType == STRUCTURE_CONTAINER)
                {
                    decayTicks = CONTAINER_DECAY_TIME_OWNED;
                    decayAmount = CONTAINER_DECAY/repairEffectivness;
                }

                myFixCosts = myFixCosts + (decayAmount/decayTicks);
            }

            if (myFixCosts < minFixCosts)
            {
                minFixCosts = myFixCosts;
                minFixPos = aRoomPos;
            }
            //console.log('COST: ['+aRoomPos.x+' '+aRoomPos.y+'] '+myFixCosts);
            if (myFixCosts < 1.0)
            {
                Memory.myRepairStats.fixCost[myFixCosts] = aRoomPos;
                //Memory.myRepairStats.fixCost[Memory.myRepairStats.fixCost.length-1].cost = myFixCosts;
            }

        }

        console.log('MIN_REPAIR_POS: '+JSON.stringify(minFixPos)+' COST: '+minFixCosts);
        console.log('Fields to test: '+myWalkables.length);
    }


    printMaintenanceCosts()
    {
        var myFixables = Game.rooms['E66N49'].find(FIND_STRUCTURES,
        {
            filter: (aFixable) =>
            {
                var result = (
                       aFixable.structureType == STRUCTURE_ROAD
                    || aFixable.structureType == STRUCTURE_CONTAINER
                );
                //console.log('DEBUG: '+ aFixable.structureType+' RESULT: '+result);
                return result;
            }
        });

        var myTower = Game.rooms['E66N49'].find(FIND_STRUCTURES,
        {
            filter: (aTower) =>
            {
                return (aTower.structureType == STRUCTURE_TOWER);
            }
        });


        console.log('FIXABLES: '+JSON.stringify(myFixables));
        console.log('FIXABLES TOWER: '+JSON.stringify(myTower));

        var myFixCosts = 0.0;
        if (!_.isUndefined(myFixables) && !_.isUndefined(myTower[0]))
        {
            for (var aID in myFixables)
            {
                var aFixable = myFixables[aID];
                var myTerrain = undefined;
                var decayTicks = 0 ;
                var decayAmount = 0;
                var repairDistance = aFixable.pos.getRangeTo(myTower[0].pos);
                var repairEffectivness = StructureTower.calculateTowerEffectiveness(repairDistance,TOWER_POWER_REPAIR)/TOWER_ENERGY_COST;

                if (aFixable.structureType == STRUCTURE_ROAD)
                {
                    myTerrain = Game.map.getTerrainAt(aFixable.pos);
                    if ( myTerrain == 'swamp')
                    {
                        decayTicks = ROAD_DECAY_TIME;
                        decayAmount = ROAD_DECAY_AMOUNT * CONSTRUCTION_COST_ROAD_SWAMP_RATIO/repairEffectivness;
                    }
                    else
                    {
                        decayTicks = ROAD_DECAY_TIME;
                        decayAmount = ROAD_DECAY_AMOUNT/repairEffectivness;
                    }
                }
                else if (aFixable.structureType == STRUCTURE_CONTAINER)
                {
                    decayTicks = CONTAINER_DECAY_TIME_OWNED;
                    decayAmount = CONTAINER_DECAY/repairEffectivness;
                }

                myFixCosts = myFixCosts + (decayAmount/decayTicks);
                console.log(
                    'DEBUG: '+myFixCosts+
                    ' TYPE: '+aFixable.structureType+
                    ' TERRAIN: '+myTerrain+
                    ' DECAYTIME: '+decayTicks+
                    ' DECAYAMOUNT: '+decayAmount+
                    ' E/T:'+(decayAmount/decayTicks)+
                    ' DISATNCE: '+repairDistance+
                    ' EFFECT: '+repairEffectivness
                );
            }
        }
        else
        {
            console.log('DERP!');
        }
        console.log('ROAD_COST: '+myFixCosts);

        for (var aID in Game.creeps)
        {
            var aCreep = Game.creeps[aID];
            var creepCost = aCreep.bodyCost/CREEP_LIFE_TIME;
            console.log('DEBUG: CREEP: '+aCreep.name+' COST: '+creepCost);
            myFixCosts = myFixCosts + creepCost;
        }



        console.log('FIXING COSTS: '+myFixCosts);
    }


    flagDroppedResources()
    {
        for (var roomID in Game.rooms)
        {
            var aRoom = Game.rooms[roomID];
            var myRoomDroppedResources = aRoom.droppedResources;
            if (myRoomDroppedResources.length > 0)
            {
                for (var aID in myRoomDroppedResources)
                {
                    var aResource = myRoomDroppedResources[aID];
                    var name = 'R: '+aResource.amount;
                    aRoom.createFlag(aResource.pos,name,COLOR_YELLOW);
                }
                //console.log('INFO: marked dropped resource in '+aRoom.name);

            }
            else
            {
                console.log(dye(CRAYON.death,'INFO: no dropped resources in room '+aRoom.name));
            }
        }
    }

    availableEnergy(roomName)
    {
        console.log(dye(CRAYON.birth,'INFO: AvailableEnergy '+Game.rooms[roomName].energyAvailable+'/'+Game.rooms[roomName].energyCapacityAvailable+' in room '+roomName));
    }

    clearAllFlags()
    {
        for ( var flagID in Game.flags)
        {
            var myFlag = Game.flags[flagID];
            myFlag.remove();
        }
    }
};
module.exports = CaseConsole;
