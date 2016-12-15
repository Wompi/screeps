var modControllerManager =
{

    runHauler: function(miningBox)
    {
        var myContainers = this.getControllerContainers();
        for (var creepID in Game.creeps)
        {
            var aCreep = Game.creeps[creepID];
            if (!aCreep.spawning && aCreep.memory.role == 'hauler')
            {
                if (myContainers.length > 0)
                {
                    var aRoadBox = Game.rooms['E66N49'].find(FIND_STRUCTURES,
                    {
                        filter: (aBox) =>
                        {
                            return (aBox.structureType == STRUCTURE_CONTAINER && aBox.pos.isEqualTo(45,29) && aBox.store[RESOURCE_ENERGY] >= aCreep.carryCapacity);
                        }
                    });
                    var aDerpBox = Game.rooms['E66N49'].find(FIND_STRUCTURES,
                    {
                        filter: (aBox) =>
                        {
                            return (aBox.structureType == STRUCTURE_CONTAINER && aBox.pos.isEqualTo(45,29));
                        }
                    });
                    //logERROR('DERP!');

                    if (aCreep.carry.energy < aCreep.carryCapacity && aCreep.pos.isNearTo(miningBox.pos))
                    {
                        var result = aCreep.withdraw(miningBox,RESOURCE_ENERGY);
                        logDEBUG('HAULER  waits for refill...'+ErrorSting(result));
                    }
                    else if (aCreep.pos.isNearTo(Game.spawns['Casepool'].pos) && (aCreep.getLiveRenewTicks() > 0))
                    {
                        // wait till full repair
                        logDEBUG('HAULER  rpair wait');
                    }
                    else if (aCreep.carry.energy == 0 && aRoadBox.length > 0 && aCreep.ticksToLive > 300 && myContainers[0].store[RESOURCE_ENERGY] < 1200)
                    {
                        var result = aCreep.withdraw(aRoadBox[0],RESOURCE_ENERGY);
                        if (result == ERR_NOT_IN_RANGE)
                        {
                            var result = aCreep.moveTo(aRoadBox[0],{ignoreCreeps: true});
                        }
                        logDEBUG('HAULER withdraws from roadbox - '+ErrorSting(result));
                    }
                    else if (aCreep.carry.energy == 0)
                    {
                        var result = aCreep.moveTo(miningBox,{ ignoreCreeps: true });
                        logDEBUG('HAULER returns to cargocreep....'+ErrorSting(result));
                    }
                    else if (myContainers[0].store[RESOURCE_ENERGY] < 1500)
                    {
                        var result = aCreep.transfer(myContainers[0],RESOURCE_ENERGY);
                        if (result == ERR_NOT_IN_RANGE)
                        {
                            var result = aCreep.moveTo(myContainers[0],{ ignoreCreeps: true });
                        }
                        logDEBUG('HAULER moves to refill the controller box .....'+ErrorSting(result));
                    }
                    else
                    {
                        var result = aCreep.transfer(aDerpBox[0],RESOURCE_ENERGY);
                        if (result == ERR_NOT_IN_RANGE)
                        {
                            var result = aCreep.moveTo(aDerpBox[0],{ ignoreCreeps: true });
                        }
                        logERROR('HAULER moves to refill the road box .....'+ErrorSting(result));
                    }
                }
            }
        }

    },

    runMineralMiner: function(room)
    {
        if (_.isUndefined(room)) return;
        var myCreeps = _.filter(room.myCreeps,(a) => { return a.memory.role == 'mineral miner' && !a.spawning});
        if (myCreeps.length == 0 ) return;
        var aCreep  = myCreeps[0];

        var myMineralSources = room.myMineralSources;
        if (myMineralSources.length == 0 )
        {
            logERROR('ROOM '+room.name+' has no mineral source! No need for a MINERAL_MINER!');
            return;
        }
        var aMineral = myMineralSources[0];

        if (!aMineral.hasExtractor)
        {
            logERROR('ROOM '+room.name+' needs an EXTRACTOR to harvest the mineral!' );
            return;
        }
        var aExtractor = aMineral.myExtractor;

        var aStorage = room.storage;
        if (_.isUndefined(aStorage))
        {
            logERROR('ROOM '+room.name+' has no storage build .. this is needed for mineral mining!');
            return;
        }

        if (aCreep.ticksToLive < 150)
        {
            var result = aCreep.moveTo(room.mySpawns[0]);
            logDEBUG('MINERAL MINER needs emergency repair .. '+ErrorSting(result));
            return;
        }

        if (aCreep.pos.isNearTo(room.mySpawns[0]) && aCreep.getLiveRenewTicks() > 0)
        {
            logDEBUG('MINERAL MINER waits for full repair .. '+ErrorSting(result));
            return;
        }

        if (aMineral.mineralAmount == 0)
        {
            logWARN('MINERAL source in room '+room.name+' is exausted .. cooldown: '+aMineral.ticksToRegeneration+' consider recycle the miner!');
            return;
        }

        var aMiningPos = aMineral.hasMiningBox ? aMineral.myMiningBoxes[0] : undefined;

        if (_.isUndefined(aMiningPos))
        {
            logWARN('MINERAL HAULER the mineral source has no mining box - not supported!');
            return;
        }

        if (_.sum(aCreep.carry) == 0 && !aCreep.pos.isEqualTo(aMiningPos))
        {
            var result = aCreep.moveTo(aMiningPos,{ignoreCreeps: true});
            logDEBUG('MINERAL MINER moves to mineral source .. '+ErrorSting(result));
        }

        var aMiningAmount = aCreep.getActiveBodyparts(WORK);

        if (_.sum(aCreep.carry) == 0
                && _.isUndefined(aExtractor.cooldown)
                && aCreep.pos.isEqualTo(aMiningPos)
                && (_.sum(aMineral.myMiningBoxes[0].store) + aMiningAmount)  < aMineral.myMiningBoxes[0].storeCapacity
            )
        {
            var result = aCreep.harvest(aMineral);
            logDEBUG('MINERAL MINER harvests mineral source .. '+ErrorSting(result));
        }
        else if (!_.isUndefined(aExtractor.cooldown))
        {
            logDEBUG('MINERAL MINER extractor is on cooldown '+aExtractor.cooldown);
        }
        else
        {
            logDEBUG('MINERAL MINER has nothing to do IDLE!');
        }

        // if (_.sum(aCreep.carry) > 0 && aCreep.pos.isNearTo(aStorage))
        // {
        //     var aMax = _.max(aCreep.carry);
        //     var aKey = _.findKey(aCreep.carry,(a) => { return a == aMax});
        //     var result = aCreep.transfer(aStorage,aKey);
        //     logDEBUG('MINERAL MINER transfers resource '+aKey+' to storage .. '+ErrorSting(result));
        // }
    },

    runTowerHauler: function(miningBox, room)
    {
        if (_.isUndefined(room)) return;
        var filterCreep = _.filter(room.myCreeps,(a) => { return (a.memory.role == 'towerHauler') && !a.spawning;})
        if (filterCreep.length == 0) return;
        var aCreep = filterCreep[0];

        var myTowers = _.sortBy
        (
            _.filter(room.myTowers, (a) =>  { return (a.energy < a.energyCapacity);}),
            (b) => { return aCreep.pos.getRangeTo(b)}
        );
        // var myExtensions = _.sortBy
        // (
        //     _.filter(room.myStructureExtensions, (a) =>  { return (a.energy < a.energyCapacity);}),
        //     (b) => { return aCreep.pos.getRangeTo(b)}
        // );
        var hasConstructionSites = room.myConstructionSites.length > 0;


        var myBuilders = [];
        if (hasConstructionSites)
        {
            myBuilders = _.filter(room.myCreeps, (a) => { return (a.carry.energy < a.carryCapacity && a.memory.role == 'constructor');});
        }

        var myLinks = _.filter(room.myLinks, (a) => { return aCreep.pos.isNearTo(a);});

        var myGrabBoxes = [];
        var mySupplyBoxes = [];
        var aGrabBox = undefined;
        //var aExtension = (myExtensions.length == 0) ? undefined : myExtensions[0];
        var aTower = (myTowers.length == 0) ? undefined : myTowers[0];
        var aBuilder = (myBuilders.length == 0) ? undefined : myBuilders[0];
        var aLink = (myLinks.length == 0) ? undefined : myLinks[0];

        var aMiningBox = room.myMiningSources[0].getMiningBox();

        var myContainers = room.myContainers;
        if(!_.isUndefined(room.storage) && (aMiningBox.store > 1000 || aCreep.pos.inRangeTo(room.storage,5)))
        {
            myContainers.push(room.storage);
        }

        var containerLoop = (aBox) =>
        {
            var aRange = aBox.pos.getRangeTo(aCreep);
            if (aBox.store[RESOURCE_ENERGY] > 0)
            {
                myGrabBoxes.push(aBox);
                if ( _.isUndefined(aGrabBox) || aRange < aBox.pos.getRangeTo(aGrabBox) )
                {
                    aGrabBox = aBox;
                }
            }
        };
        _.forEach(myContainers,containerLoop);
        if (_.isUndefined(aGrabBox) && !_.isUndefined(room.storage))
        {
            aGrabBox = room.storage;
        }

        if (_.isUndefined(aGrabBox))
        {
            // in the future consider resource grabbing from ground or other buildings with energy
            logERROR('ROOM '+room.name+' HAS NO CONTAINER TO GRAB ENERGY FROM .. can not process the towerHauler!');
            return;
        }


        if (aCreep.carry.energy == 0 && !aCreep.pos.isNearTo(aGrabBox.pos))
        {
            var result = aCreep.moveTo(aGrabBox, {ignoreCreeps: true});
            logDEBUG('TOWER_HAULER '+aCreep.name+' moves to closest box ['+aGrabBox.pos.x+' '+aGrabBox.pos.y+'] .. ' +ErrorSting(result));
        }
        else
        {
            if (!room.mySpawns[0].spawning && aCreep.pos.isNearTo(room.mySpawns[0].pos) && (aCreep.getLiveRenewTicks() > 0))
            {
                logDEBUG('TOWER_HAULER '+aCreep.name+' waites for full repair .. ');
                // wait till full repair
                return;
            }

            if (aCreep.ticksToLive < 100 )
            {
                var result = aCreep.moveTo(room.mySpawns[0].pos,{ignoreCreeps: true});
                logDEBUG('TOWER_HAULER '+aCreep.name+' back to spawn for emergency repair ... '+ErrorSting(result));
                return;
            }

            if (aCreep.ticksToLive < 500 && aCreep.pos.getRangeTo(room.mySpawns[0].pos) < 3)
            {
                var result = aCreep.moveTo(room.mySpawns[0].pos,{ignoreCreeps: true});
                logDEBUG('TOWER_HAULER '+aCreep.name+' back to spawn for fixup repair ... '+ErrorSting(result));
            }

            var isNearLink = !_.isUndefined(aLink) && aCreep.pos.isNearTo(aLink.pos);
            if (!_.isUndefined(aLink) && isNearLink )//&& _.isUndefined(aExtension))
            {
                var result = aCreep.withdraw(aLink,RESOURCE_ENERGY);
                logDEBUG('TOWER_HAULER '+aCreep.name+' resupply from link .. ' +ErrorSting(result));
            }

            var isReloading = aCreep.pos.isNearTo(aGrabBox.pos) && aCreep.carry.energy < aCreep.carryCapacity;
            if (isReloading)
            {
                var result = aCreep.withdraw(aGrabBox,RESOURCE_ENERGY);
                logDEBUG('TOWER_HAULER '+aCreep.name+' grabs from  closest box .. ' +ErrorSting(result));
            }


            //var isNearExtension = !_.isUndefined(aExtension) && aCreep.pos.isNearTo(aExtension.pos);
            var isNearTower = !_.isUndefined(aTower) && aCreep.pos.isNearTo(aTower.pos);
            var isNearBuilder =  !_.isUndefined(aBuilder) && aCreep.pos.isNearTo(aBuilder.pos);

            if (!isReloading)
            {
                // if (!_.isUndefined(aExtension) && !isNearExtension || myExtensions.length > 1)
                // {
                //     var result = aCreep.moveTo(aExtension,{ignoreCreeps: true,range: 1});
                //     logDEBUG('TOWER_HAULER '+aCreep.name+' moves to extension .. ' +ErrorSting(result));
                // }
                if (!_.isUndefined(aTower) && !isNearTower)
                {
                    var result = aCreep.moveTo(aTower,{ignoreCreeps: true, range: 1});
                    logDEBUG('TOWER_HAULER '+aCreep.name+' moves to tower .. ' +ErrorSting(result));
                }
                else if (!_.isUndefined(aBuilder) && !isNearBuilder)
                {
                    var result = aCreep.moveTo(aBuilder,{ignoreCreeps: true, range: 1});
                    logDEBUG('TOWER_HAULER '+aCreep.name+' moves to builder .. ' +ErrorSting(result));
                }
                else
                {
                    var idlePos = Room.IDLE_POSITIONS[room.name];
                    if (!_.isUndefined(idlePos))
                    {
                        var result = aCreep.moveTo(new RoomPosition(idlePos[0].x,idlePos[0].y,room.name),{ignoreCreeps: true});
                        logDEBUG('TOWER_HAULER '+aCreep.name+' moves to idle posiotion .. ' +ErrorSting(result));
                    }
                    else
                    {
                        logERROR('ROOM '+this.name+' HAS NO IDLE POSITIONS DEFINED !');
                    }

                }
            }

            // if (!_.isUndefined(aExtension) && isNearExtension)
            // {
            //     var result = aCreep.transfer(aExtension,RESOURCE_ENERGY);
            //     logDEBUG('TOWER_HAULER '+aCreep.name+' resupply extension .. ' +ErrorSting(result));
            // }

            if (!_.isUndefined(aTower) && isNearTower)
            {
                var result = aCreep.transfer(aTower,RESOURCE_ENERGY);
                logDEBUG('TOWER_HAULER '+aCreep.name+' resupply tower .. ' +ErrorSting(result));
            }

            if (!_.isUndefined(aBuilder) && isNearBuilder)
            {
                var result = aCreep.transfer(aBuilder,RESOURCE_ENERGY);
                logDEBUG('TOWER_HAULER '+aCreep.name+' resupply builder .. ' +ErrorSting(result));
            }



            // if (!_.isUndefined(aLink) && isNearLink)
            // {
            //     var result = aCreep.transfer(aLink,RESOURCE_ENERGY);
            //     logDEBUG('TOWER_HAULER '+aCreep.name+' resupply link .. ' +ErrorSting(result));
            // }
        }
    },

    runCargo: function(myCargoCreep)
    {
        if (!myCargoCreep.spawning)
        {
            var mySpawn = Game.spawns['Casepool'];
            var myContainers = Game.rooms['E66N49'].find(FIND_STRUCTURES,
            {
                filter: (myBox) =>
                {
                    return (myBox.structureType == STRUCTURE_CONTAINER);
                }
            });

            var myExtensions = myCargoCreep.pos.findInRange(FIND_MY_STRUCTURES,1,
            {
                filter: (myExt) =>
                {
                    return (myExt.structureType == STRUCTURE_EXTENSION);
                }
            });

            var droppedResources = Game.rooms['E66N49'].droppedResources;
            var isPickingUP = false;
            if (droppedResources.length > 0)
            {
                for (var aID in droppedResources)
                {
                    if (myCargoCreep.pos.getRangeTo(droppedResources[aID]) < 2)
                    {
                        var result = myCargoCreep.pickup(droppedResources[aID]);
                        isPickingUP = true;
                        break;
                    }
                }
            }

            if (myContainers.length > 0 && !isPickingUP)
            {
                for (var boxID in myContainers)
                {
                    var myBox = myContainers[boxID];
                    if (myCargoCreep.pos.isNearTo(myBox.pos))
                    {
                        var result = myCargoCreep.withdraw(myBox,RESOURCE_ENERGY);
                        logDEBUG('Cargo Withdraws from miningbox - '+ErrorSting(result));
                    }
                }
            }

            if (mySpawn.isEnergyNeeded())
            {
                var result = myCargoCreep.transfer(mySpawn,RESOURCE_ENERGY);
                logDEBUG('Cargo transfers energy to spawn - '+ErrorSting(result));
            }

            if (myExtensions.length > 0)
            {
                for (var extID in myExtensions)
                {
                    var myExt = myExtensions[extID];
                    var deltaEnergy = myExt.energyCapacity - myExt.energy;
                    if (deltaEnergy > 0 && myCargoCreep.carry.energy >= deltaEnergy)
                    {
                        var result = myCargoCreep.transfer(myExt,RESOURCE_ENERGY);
                        logDEBUG('Cargo transfers energy to extension - '+ErrorSting(result));
                    }
                    else if (deltaEnergy > 0)
                    {
                        logWARN('Cargo has not enough energy to fill extension - '+deltaEnergy);
                    }
                }
            }
        }
    },

    runConstructor: function(miningBox, room)
    {
        if (_.isUndefined(room)) return;
        var filterCreep = _.filter(room.myCreeps,(a) => { return (a.memory.role == 'constructor') && !a.spawning;})
        if (filterCreep.length == 0) return;
        var aCreep = filterCreep[0];

        var myConstructionSites = room.myConstructionSites.reverse();
        if (myConstructionSites.length == 0)
        {
            var recyclePos = Room.RECYCLE_POSITIONS[room.name];

            if (_.isUndefined(recyclePos))
            {
                logERROR('ROOM '+room.name+' HAS NO RECYCLE POSITION - adjust this in Room.RECYCLE_POSITIONS!');
                return;
            }

            if (aCreep.pos.isEqualTo(recyclePos[0].x,recyclePos[0].y))
            {
                var result = room.mySpawns[0].recycleCreep(aCreep);
                logWARN('CONSTRUCTOR '+aCreep.name+' is recycled  .. ' +ErrorSting(result));
            }
            else
            {
                var result = aCreep.moveTo(new RoomPosition(recyclePos[0].x,recyclePos[0].y,room.name),{ignoreCreeps: true});
                logWARN('CONSTRUCTOR '+aCreep.name+' moves to recycle postion .. ' +ErrorSting(result));
            }
            return;
        }


        var myFlagNames = (Flag.findName(Flag.FLAG_COLOR.construction.primaryConstruction,room));
        var myAllFlags = undefined;
        if (myFlagNames.length == 0)
        {
            myAllFlags = myFlagNames.concat(Flag.findName(Flag.FLAG_COLOR.construction,room));
        }
        else
        {
            myAllFlags = myFlagNames;
        }
        if (myAllFlags.length == 0 )
        {
            logERROR('CONSTRUCTOR RUN '+room.name+' has construction sites but NO FLAGS .. place some to start!');
            return;
        }

        var aFlag = Flag.getClosestFlag(aCreep.pos,myAllFlags);

        var isValid = false;
        var aSite = undefined;
        for (var bSite of myConstructionSites)
        {
            if (bSite.pos.inRangeTo(aFlag.pos,3))
            {
                isValid = true;
                aSite = bSite;
                break;
            }
            // here we could try some priority but it should be ok to just take whater is last inthe list
        }

        if (!isValid)
        {
             // not quite the solution - if the construction point is finished we remove the flag and
             // wait for the next tick
            aFlag.remove();
            return;
        }

        var aBox = undefined; /// find the closes full box
        var myContainers = _.filter(room.myContainers,(a) => { return (a.store[RESOURCE_ENERGY] > 0);});
        var myLinks = _.filter(room.myLinks,(a) => { return (a.energy > 0);});
        if (myContainers.length == 0)
        {
            //hmmm think about what to do when wehave no box
            // this needs adjustment the first source might not the one who has the miner on it
            // allso if it has normining box - well derp
            aBox = room.myMiningSources[0].myMiningBoxes[0];
        }
        else
        {
            aBox = myContainers[0];
            for (var aID of myContainers)
            {
                if (aID.pos.getRangeTo(aCreep) < aBox.pos.getRangeTo(aCreep) )
                {
                    aBox = aID;
                }
            }
        }

        for (var aLink of myLinks)
        {
            if (_.isUndefined(aBox) || aLink.pos.getRangeTo(aCreep) < aBox.pos.getRangeTo(aCreep) )
            {
                aBox = aLink;
            }
        }

        var aStorage = aCreep.room.storage;
        if (!_.isUndefined(aStorage))
        {
            if (!_.isUndefined(aBox) && aCreep.pos.getRangeTo(aStorage) < aCreep.pos.getRangeTo(aBox))
            {
                aBox = aStorage;
            }
        }


        var ignore = true;
        if (aCreep.pos.inRangeTo(aCreep.room.mySpawns[0],4))
        {
            ignore = false;
        }

        if (aCreep.pos.isNearTo(room.mySpawns[0].pos) && (aCreep.getLiveRenewTicks() > 0))
        {
            logDEBUG('CONSTRUCTOR '+aCreep.name+' waites for full repair .. ');
            // wait till full repair
            return;
        }

        if (aCreep.ticksToLive < 100 )
        {
            var result = aCreep.moveTo(room.mySpawns[0].pos,{ignoreCreeps: ignore});
            logDEBUG('CONSTRUCTOR '+aCreep.name+' back to spawn for emergency repair ... '+ErrorSting(result));
            return;
        }

        if (aCreep.carry.energy == 0 && !aCreep.pos.isNearTo(aBox.pos))
        {
            var result = aCreep.moveTo(aBox, {ignoreCreeps: ignore});
            logDEBUG('CONSTRUCTOR '+aCreep.name+' moves to closest box ['+aBox.pos.x+' '+aBox.pos.y+'] .. ' +ErrorSting(result));
        }
        else
        {
            // adjust this when we have more spawns in a room


            if (aCreep.ticksToLive < 500 && aCreep.pos.getRangeTo(room.mySpawns[0].pos) < 3)
            {
                var result = aCreep.moveTo(room.mySpawns[0].pos,{ignoreCreeps: ignore});
                logDEBUG('CONSTRUCTOR '+aCreep.name+' back to spawn for fixup repair ... '+ErrorSting(result));
            }

            var isReloading = aCreep.pos.isNearTo(aBox.pos) && aCreep.carry.energy < aCreep.carryCapacity;
            if (isReloading)
            {
                var result = aCreep.withdraw(aBox,RESOURCE_ENERGY);
                logDEBUG('CONSTRUCTOR '+aCreep.name+' grabs from  closest box .. ' +ErrorSting(result));
            }

            if (!aCreep.pos.isEqualTo(aFlag.pos) && !isReloading)
            {
                var result = aCreep.moveTo(aFlag,{ignoreCreeps: ignore});
                logDEBUG('CONSTRUCTOR '+aCreep.name+' moves to flag .. ' +ErrorSting(result));
            }

            if (aCreep.pos.getRangeTo(aSite) < 4)
            {
                var result = aCreep.build(aSite);
                logDEBUG('CONSTRUCTOR '+aCreep.name+' builds a construction .. ' +ErrorSting(result));
            }
        }
    },


    getControllerContainers: function()
    {
        var myContainers = Game.rooms['E66N49'].find(FIND_STRUCTURES,
        {
            filter: (myBox) =>
            {
                return (myBox.structureType == STRUCTURE_CONTAINER
                    && myBox.pos.inRangeTo(Game.rooms['E66N49'].controller,3));
            }
        });
        return myContainers;
    }

};
module.exports = modControllerManager;
