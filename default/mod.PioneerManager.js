var modPioneerManager =
{
    runPioneerMiner: function(room)
    {
        var myMiners = _.filter(room.myCreeps, (a) => {return a.memory.role == 'pioneer miner' && !a.spawning});
        if (myMiners.length == 0) return;
        var aFlagRole = Flag.FLAG_COLOR.pioneer.miner;
        var pFlag = _.filter(Game.flags,aFlagRole.filter);

        if (pFlag.length == 0 ) return;

        var aFlag = pFlag[0];
        var aCreep = myMiners[0];

        if (!aCreep.pos.isEqualTo(aFlag.pos))
        {
            var result = aCreep.moveTo(aFlag,
            {
                ignoreCreeps: true,
                reusePath: 100,
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

                    if (roomName == 'E66N49')
                    {
                        costs.set(15, 31, 0xff);
                    }
                    return costs;
                }
            });
            if (result != OK)
            {
                aCreep.moveTo(new RoomPosition(44,40,'E66N49'));
            }
            logERROR('PIONEER MINER moves to pioneer miner flag .. '+ErrorSting(result));

            if (_.isUndefined(aCreep.memory.travelTime))
            {
                aCreep.memory.travelTime = 0;
            }
            aCreep.memory.travelTime++;
        }
        else
        {
            var mySources = _.filter(room.myMiningSources, (a) => { return aCreep.pos.isNearTo(a);});
            var mySpawns = _.filter(room.mySpawns, (a) => { return aCreep.pos.isNearTo(a) && a.isEnergyNeeded();});
            var myConstSites = _.filter(room.myConstructionSites, (a) => { return aCreep.pos.getRangeTo(a) < 4;});
            var myResources = _.filter(room.droppedResources, (a) => {return aCreep.pos.getRangeTo(a) < 2;})

            var aSpawn = (mySpawns.length == 0) ? undefined : mySpawns[0];
            var aConstSite = (myConstSites.length == 0) ? undefined : myConstSites[0];
            var aSource = (mySources.length == 0) ? undefined : mySources[0];
            var aResource = (myResources.length == 0) ? undefined : myResources[0];

            if (!_.isUndefined(aSpawn))
            {
                var result = aCreep.transfer(aSpawn,RESOURCE_ENERGY);
                logDEBUG('PIONEER MINER refills spawn   .. '+ErrorSting(result));
            }

            if (!_.isUndefined(aResource))
            {
                var result = aCreep.pickup(aResource);
                logDEBUG('PIONEER MINER picks up near resource  .. '+ErrorSting(result));

            }

            if (!_.isUndefined(aConstSite) && aCreep.carry.energy >= 35)
            {
                var result = aCreep.build(aConstSite);
                logDEBUG('PIONEER MINER builds something .. '+ErrorSting(result));
            }

            if (!_.isUndefined(aSource))
            {
                if (aSource.hasMiningBox && _.isUndefined(aSpawn))
                {
                    var myParts = _.countBy(aCreep.body,'type');
                    var myRepairBoxes  = _.filter(aSource.myMiningBoxes, (a) =>
                    {
                        return (a.hitsMax - a.hits) >= (REPAIR_POWER * myParts[WORK]);
                    });
                    var myMiningBoxes  = _.filter(aSource.myMiningBoxes, (a) =>
                    {
                        return (a.store[RESOURCE_ENERGY] > 0);
                    });

                    if (myRepairBoxes.length > 0)
                    {
                        var result = aCreep.repair(myRepairBoxes[0]);
                        logDEBUG('PIONEER MINER repairs mining box .. '+ErrorSting(result));
                    }

                    var needMiningBoxRefill = myMiningBoxes.length > 0 && myMiningBoxes[0].store[RESOURCE_ENERGY] < 500;

                    if (myMiningBoxes.length > 0 && _.isUndefined(aResource))
                    {
                        if (aCreep.carry.energy < aCreep.carryCapacity && !needMiningBoxRefill)
                        {
                            var result = aCreep.withdraw(myMiningBoxes[0],RESOURCE_ENERGY);
                            logDEBUG('PIONEER MINER grabs stuff from mining box .. '+ErrorSting(result));
                        }
                    }

                    if (room.controller.ticksToDowngrade < 1000 || ((Game.time % 300) == 0) ||  (_.isUndefined(aConstSite) && !needMiningBoxRefill))
                    {
                        var result = aCreep.upgradeController(room.controller);
                        logDEBUG('PIONEER MINER upgrades controller  .. '+ErrorSting(result));
                    }

                    if (needMiningBoxRefill)
                    {
                        var result = aCreep.drop(RESOURCE_ENERGY);
                        logDEBUG('PIONEER MINER drops energy because box is almost empty  .. '+ErrorSting(result));
                    }
                }

                var result = aCreep.harvest(aSource);
                logDEBUG('PIONEER MINER harvests something .. '+ErrorSting(result));
            }

            logERROR('PIONEER MINER reached destination !');
        }
    },

    runPioneerClaimer: function(room)
    {
        var myClaimers = _.filter(room.myCreeps, (a) => {return a.memory.role == 'pioneer claimer' && !a.spawning});
        if (myClaimers.length == 0) return;

        var aFlagRole = Flag.FLAG_COLOR.pioneer.claim;
        var pFlag = _.filter(Game.flags,aFlagRole.filter);

        if (pFlag.length == 0 ) return;

        var aFlag = pFlag[0];
        var aCreep = myClaimers[0];

        if (!aCreep.pos.isEqualTo(aFlag.pos))
        {
            var result = aCreep.moveTo(aFlag,
            {
                ignoreCreeps: true,
                reusePath: 100,
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

                    if (roomName == 'E66N49')
                    {
                        costs.set(15, 31, 0xff);
                    }
                    return costs;
                }
            });
            if (result != OK)
            {
                aCreep.moveTo(new RoomPosition(44,40,'E66N49'));
            }
            logERROR('CLAIMER moves to pioneer claim flag .. '+ErrorSting(result));

            if (_.isUndefined(aCreep.memory.travelTime))
            {
                aCreep.memory.travelTime = 0;
            }
            aCreep.memory.travelTime++;
        }
        else
        {
            var result = aCreep.claimController(aCreep.room.controller);
            logERROR('CLAIMER reached destination ! .. '+ErrorSting(result));
        }
    },

    runScout: function(room)
    {
        if (_.isUndefined(room)) return;
        var myScout = _.filter(room.myCreeps, (a) => {return a.memory.role == 'scout' && !a.spawning});
        if (myScout.length == 0) return;

        var aFlagRole = Flag.FLAG_COLOR.pioneer.claim;
        var pFlag = _.filter(Game.flags,aFlagRole.filter);

        logERROR('SCOUT: flag - '+JSON.stringify(pFlag));
        logERROR('SCOUT: scout - '+JSON.stringify(myScout));

        if (pFlag.length == 0 ) return;

        var aFlag = pFlag[0];
        var aCreep = myScout[0];

        if (!aCreep.pos.isEqualTo(aFlag.pos))
        {
            var result = aCreep.moveTo(aFlag,
            {
                ignoreCreeps: true,
                reusePath: 100,
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

                    if (roomName == 'E66N49')
                    {
                        costs.set(15, 31, 0xff);
                    }
                    return costs;
                }
            });
            if (result != OK)
            {
                aCreep.moveTo(new RoomPosition(44,40,'E66N49'));
            }
            logERROR('SCOUT moves to pioneer flag .. '+ErrorSting(result));

            if (_.isUndefined(aCreep.memory.travelTime))
            {
                aCreep.memory.travelTime = 0;
            }
            aCreep.memory.travelTime++;
        }
        else
        {
            logERROR('SCOUT reached destination!');
        }
    }
};
module.exports = modPioneerManager;
