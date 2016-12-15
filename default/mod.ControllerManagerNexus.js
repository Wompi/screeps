var mod =
{
    runBrawler: function(room)
    {
        if (_.isUndefined(room)) return;
        var myFixers = _.filter(room.myCreeps, (a) => {return (a.memory.role == 'brawler' && !a.spawning);});
        if (myFixers.length == 0) return;
        // for starters we only handle one fixer
        var aCreep = myFixers[0];

        if (room.hasInvaders)
        {
            var invaderCreeps = room.myInvaders;

            if (!aCreep.pos.isNearTo(invaderCreeps[0]))
            {
                var result = aCreep.moveTo(invaderCreeps[0])
                logDEBUG('Brawler engages .....'+ErrorSting(result));
            }
            var result = aCreep.attack(invaderCreeps[0]);

            logWARN('ATTACK: '+ErrorSting(result));
        }
        else
        {
            var recyclePos = Room.RECYCLE_POSITIONS[room.name];
            var aPos = new RoomPosition(recyclePos[0].x,recyclePos[0].y,room.name);
            var result = aCreep.moveTo(aPos);

            if (aCreep.pos.isNearTo(aPos))
            {
                var result = room.mySpawns[0].recycleCreep(aCreep);
            }

        }

    },


    runTowerHauler: function(room)
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
        var myExtensions = _.sortBy
        (
            _.filter(room.myStructureExtensions, (a) =>  { return (a.energy < a.energyCapacity);}),
            (b) => { return aCreep.pos.getRangeTo(b)}
        );
        var mySpawns = _.filter(room.mySpawns,(a) => { return a.getEnergyNeeded() >=  130 ; });
        var myBuilders = _.filter(room.myCreeps, (a) => { return (a.carry.energy < a.carryCapacity && a.memory.role == 'constructor');});
        var myResources = _.filter(room.droppedResources, (a) => {return aCreep.pos.inRangeTo(a,1);})
        var aResource = myResources.length == 0 ? undefined : myResources[0];

        var myGrabBoxes = [];
        var mySupplyBoxes = [];
        var aGrabBox = undefined;
        var aSupplyBox = undefined;
        var aExtension = (myExtensions.length == 0) ? undefined : myExtensions[0];
        var aTower = (myTowers.length == 0) ? undefined : myTowers[0];
        var aBuilder = (myBuilders.length == 0) ? undefined : myBuilders[0];
        var aSpawn = (mySpawns.length == 0) ? undefined : mySpawns[0];

        var containerLoop = (aBox) =>
        {
            var aRange = aBox.pos.getRangeTo(aCreep);
            if (aBox.store[RESOURCE_ENERGY] > 0)
            {
                myGrabBoxes.push(aBox);
                if ( _.isUndefined(aGrabBox) || aRange < aBox.pos.getRangeTo(aGrabBox))
                {
                    aGrabBox = aBox;
                }
            }

            if (aBox.store[RESOURCE_ENERGY] < aBox.storeCapacity)
            {
                mySupplyBoxes.push(aBox);
                if (!_.isUndefined(aGrabBox) && aBox.id != aGrabBox.id)
                {
                    if ( _.isUndefined(aSupplyBox) || aRange < aBox.pos.getRangeTo(aSupplyBox))
                    {
                        aSupplyBox = aBox;
                    }
                }
            }
        };
        _.forEach(room.myContainers,containerLoop);

        if (aGrabBox.store[RESOURCE_ENERGY] > 1000)
        {
            aSupplyBox = room.storage;
        }

        if (_.isUndefined(aGrabBox) && aCreep.pos.getRangeTo(aGrabBox) > aCreep.pos.getRangeTo(room.storage) && room.storage.store[RESOURCE_ENERGY] > 0)
        {
            //aGrabBox = room.storage;
            logDEBUG('TOWER_HAULER grabs from storage....');
        }

        if (_.isUndefined(aGrabBox))
        {
            // in the future consider resource grabbing from ground or other buildings with energy
            logERROR('ROOM '+room.name+' HAS NO CONTAINER TO GRAB ENERGY FROM .. can not process the towerHauler!');
            return;
        }

        if (!_.isUndefined(aResource) && aCreep.pos.isNearTo(aResource))
        {
            var result = aCreep.pickup(aResource);
            logDEBUG('TOWER_HAULER '+aCreep.name+' pickup supply position .. ' +ErrorSting(result));
            //return;
        }


        if (aCreep.carry.energy == 0 && !aCreep.pos.isNearTo(aGrabBox.pos))
        {
            var result = aCreep.moveTo(aGrabBox, {ignoreCreeps: ignore});
            logDEBUG('TOWER_HAULER '+aCreep.name+' moves to closest box  .. ' +ErrorSting(result));
        }
        else
        {
            if (aCreep.pos.isNearTo(room.mySpawns[0].pos) && (aCreep.getLiveRenewTicks() > 0))
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

            var isReloading = aCreep.pos.isNearTo(aGrabBox.pos) && aCreep.carry.energy < aCreep.carryCapacity;
            if (isReloading)
            {
                var result = aCreep.withdraw(aGrabBox,RESOURCE_ENERGY);
                logDEBUG('TOWER_HAULER '+aCreep.name+' grabs from  closest box .. ' +ErrorSting(result));
            }

            var isNearExtension = !_.isUndefined(aExtension) && aCreep.pos.isNearTo(aExtension.pos);
            var isNearTower = !_.isUndefined(aTower) && aCreep.pos.isNearTo(aTower.pos);
            var isNearBuilder =  !_.isUndefined(aBuilder) && aCreep.pos.isNearTo(aBuilder.pos);
            var isNearSupplyBox = !_.isUndefined(aSupplyBox) && aCreep.pos.isNearTo(aSupplyBox.pos);
            var isNearSpawn = !_.isUndefined(aSpawn) && aCreep.pos.isNearTo(aSpawn.pos);


            if (!isReloading)
            {
                var ignore = true;
                if (aCreep.pos.inRangeTo(aCreep.room.mySpawns[0],4))
                {
                    ignore = false;
                }

                if (!_.isUndefined(aSpawn) && !isNearSpawn)
                {
                    var result = aCreep.moveTo(aSpawn,{ignoreCreeps: ignore});
                    logDEBUG('TOWER_HAULER '+aCreep.name+' moves spawn .. ' +ErrorSting(result));
                }
                else if (!_.isUndefined(aExtension) && !isNearExtension)
                {
                    var result = aCreep.moveTo(aExtension,{ignoreCreeps: ignore});
                    logDEBUG('TOWER_HAULER '+aCreep.name+' moves to extension .. ' +ErrorSting(result));
                }
                else if (!_.isUndefined(aTower) && !isNearTower)
                {
                    var result = aCreep.moveTo(aTower,{ignoreCreeps: ignore});
                    logDEBUG('TOWER_HAULER '+aCreep.name+' moves to tower .. ' +ErrorSting(result));
                }
                else if (!_.isUndefined(aBuilder) && !isNearBuilder)
                {
                    var result = aCreep.moveTo(aBuilder,{ignoreCreeps: ignore});
                    logDEBUG('TOWER_HAULER '+aCreep.name+' moves to builder .. ' +ErrorSting(result));
                }
                else
                {
                    var idlePos = Room.IDLE_POSITIONS[room.name];
                    if (!_.isUndefined(idlePos))
                    {
                        var result = aCreep.moveTo(new RoomPosition(idlePos[0].x,idlePos[0].y,room.name),{ignoreCreeps: ignore});
                        logDEBUG('TOWER_HAULER '+aCreep.name+' moves to idle position .. ' +ErrorSting(result));
                    }
                    else
                    {
                        logERROR('ROOM '+this.name+' HAS NO IDLE POSITIONS DEFINED !');
                    }

                }
                // else if (!_.isUndefined(aSupplyBox) && !isNearSupplyBox)
                // {
                //     var result = aCreep.moveTo(aSupplyBox,{ignoreCreeps: true});
                //     logDEBUG('TOWER_HAULER '+aCreep.name+' moves to supplybox .. ' +ErrorSting(result));
                // }
            }

            if (!_.isUndefined(aSpawn) && isNearSpawn)
            {
                var result = aCreep.transfer(aSpawn,RESOURCE_ENERGY);
                logDEBUG('TOWER_HAULER '+aCreep.name+' resupply spawn .. ' +ErrorSting(result));
            }


            if (!_.isUndefined(aExtension) && isNearExtension)
            {
                var result = aCreep.transfer(aExtension,RESOURCE_ENERGY);
                logDEBUG('TOWER_HAULER '+aCreep.name+' resupply extension .. ' +ErrorSting(result));
            }

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

            if (!_.isUndefined(aSupplyBox) && isNearSupplyBox)
            {
                var result = aCreep.transfer(aSupplyBox,RESOURCE_ENERGY);
                logDEBUG('TOWER_HAULER '+aCreep.name+' resupply supplybox .. ' +ErrorSting(result));
            }
            logERROR('DERP TOWER_HAULER');
        }
    },

    runBasicHauler: function(room)
    {
        if (_.isUndefined(room)) return;
        var filterCreeps = _.filter(room.myCreeps,(a) => { return (a.memory.role == 'basic hauler') && !a.spawning;})
        if (filterCreeps.length == 0) return;

        var hasConstructionSites = (room.myConstructionSites.length > 0);
        var aStorage = room.storage;

        var myContainers = _.filter(room.myContainers,(a) =>
        {
            return (a.pos.inRangeTo(room.controller,3));
        });
        var aContainer = myContainers[0];

        var mySupplys = _.filter(room.myContainers,(a) =>
        {
            return ( aContainer.id != a.id && a.store[RESOURCE_ENERGY] > 0 );
        });
        var aSupply = mySupplys[0];

        for (var aCreep of filterCreeps)
        {
            var myResources = _.filter(room.droppedResources, (a) => {return aCreep.pos.inRangeTo(a,1);})
            var aResource = myResources.length == 0 ? undefined : myResources[0];

            var ignore = true;
            if (aCreep.pos.inRangeTo(aCreep.room.mySpawns[0],3))
            {
                ignore = false;
            }

            if (aCreep.ticksToLive < 100 )
            {
                var result = aCreep.moveTo(room.mySpawns[0].pos,{ignoreCreeps: ignore});
                logDEBUG('BASIC_HAULER '+aCreep.name+' back to spawn for emergency repair ... '+ErrorSting(result));
                return;
            }

            if (aCreep.ticksToLive < 500 && aCreep.pos.getRangeTo(room.mySpawns[0].pos) < 3)
            {
                var result = aCreep.moveTo(room.mySpawns[0].pos,{ignoreCreeps: ignore});
                logDEBUG('BASIC_HAULER '+aCreep.name+' back to spawn for fixup repair ... '+ErrorSting(result));
                return;
            }

            if (!_.isUndefined(aResource) && aCreep.pos.isNearTo(aResource))
            {
                var result = aCreep.pickup(aResource);
                logDEBUG('BASIC_HAULER '+aCreep.name+' pickup supply position .. ' +ErrorSting(result));
            }
            else if (!_.isUndefined(aSupply) && aCreep.pos.isNearTo(aSupply))
            {
                var result = aCreep.withdraw(aSupply,RESOURCE_ENERGY);
                logDEBUG('BASIC_HAULER '+aCreep.name+' grabs from supply position .. ' +ErrorSting(result));
            }

            if (!_.isUndefined(aContainer) && aCreep.pos.isNearTo(aContainer))
            {
                var result = aCreep.transfer(aContainer,RESOURCE_ENERGY);
                logDEBUG('BASIC_HAULER '+aCreep.name+' transfers to controller supply position .. ' +ErrorSting(result));
            }

            if (aCreep.carry.energy < aCreep.carryCapacity)
            {
                if (!_.isUndefined(aSupply))
                {
                    var result = aCreep.moveTo(aSupply,{ignoreCreeps: ignore,range: 1});
                    logDEBUG('BASIC_HAULER '+aCreep.name+' moves to supply position .. ' +ErrorSting(result));
                }
                else
                {
                    var idlePos = Room.IDLE_POSITIONS[room.name];

                    if (!_.isUndefined(idlePos))
                    {
                        var result = aCreep.moveTo(new RoomPosition(idlePos[0].x,idlePos[0].y,room.name),{ignoreCreeps: ignore});
                        logDEBUG('BASIC_HAULER '+aCreep.name+' moves to idlePos .. ' +ErrorSting(result));
                    }
                    else
                    {
                        logERROR('IDLE DERP');
                    }
                }
            }
            else
            {
                if (!_.isUndefined(aContainer) && _.sum(aContainer.store) < (aContainer.storeCapacity * 0.5))
                {
                    var result = aCreep.moveTo(aContainer,{ignoreCreeps: ignore,range: 1});
                    logDEBUG('BASIC_HAULER '+aCreep.name+' moves to controller position .. ' +ErrorSting(result));
                }
                else if (!hasConstructionSites && !_.isUndefined(aStorage))
                {
                    var result = aCreep.moveTo(aStorage,{ignoreCreeps: ignore, range: 1});
                    logDEBUG('BASIC_HAULER '+aCreep.name+' moves storage.. ' +ErrorSting(result));
                    result = aCreep.transfer(aStorage,RESOURCE_ENERGY);
                    logDEBUG('BASIC_HAULER '+aCreep.name+' transfer to storage  .. ' +ErrorSting(result));
                }
                else
                {
                    var idlePos = Room.IDLE_POSITIONS[room.name];

                    if (!_.isUndefined(idlePos))
                    {
                        var result = aCreep.moveTo(new RoomPosition(idlePos[0].x,idlePos[0].y,room.name),{ignoreCreeps: ignore});
                        logDEBUG('BASIC_HAULER '+aCreep.name+' moves to idlePos .. ' +ErrorSting(result));
                    }
                    else
                    {
                        logERROR('IDLE DERP');
                    }
                }
            }
        }

    },


    // runSpecialMiner: function(room)
    // {
    //     if (_.isUndefined(room)) return;
    //     var filterCreep = _.filter(room.myCreeps,(a) => { return (a.memory.role == 'special miner') && !a.spawning;})
    //     if (filterCreep.length == 0) return;
    //     var aCreep = filterCreep[0];
    //
    //     var mySources = _.filter(room.myMiningSources,(a) => { return (a.energy > 0);});
    //     if (mySources.length == 0)
    //     {
    //         mySources = _.sortBy(room.myMiningSources, (a) => { return a.ticksToRegeneration});
    //     }
    //
    //     var aSource = mySources[0];
    //
    //     // var myContainers = _.filter(room.myContainers,(a) =>
    //     // {
    //     //     return (_.sum(a.store) < a.storeCapacity) && aCreep.pos.isEqualTo(a);
    //     // });
    //
    //
    //
    //     if (aCreep.pos.isNearTo(aSource))
    //     {
    //         //if (myContainers.length > 0)
    //         {
    //             var result = aCreep.harvest(aSource);
    //             logDEBUG('SPECIAL MINER '+aCreep.name+' moves to source ['+aSource.pos.x+' '+aSource.pos.y+'] .. ' +ErrorSting(result));
    //         }
    //         //else
    //         {
    //         //    logDEBUG('SPECIAL MINER '+aCreep.name+' box full ['+aSource.pos.x+' '+aSource.pos.y+'] .. ');
    //
    //         }
    //     }
    //     else
    //     {
    //             var result = aCreep.moveTo(aSource,{ignoreCreeps: true});
    //             logDEBUG('SPECIAL MINER '+aCreep.name+' harvests source ['+aSource.pos.x+' '+aSource.pos.y+'] .. ' +ErrorSting(result));
    //     }
    //
    //
    // },

    runConstructor: function(room)
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

        var ignore = true;
        if (aCreep.pos.inRangeTo(aCreep.room.mySpawns[0],4))
        {
            ignore = false;
        }


        if (aCreep.carry.energy == 0 && !aCreep.pos.isNearTo(aBox.pos))
        {
            var result = aCreep.moveTo(aBox, {ignoreCreeps: ignore});
            logDEBUG('CONSTRUCTOR '+aCreep.name+' moves to closest box ['+aBox.pos.x+' '+aBox.pos.y+'] .. ' +ErrorSting(result));
        }
        else
        {
            // adjust this when we have more spawns in a room
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

};
module.exports = mod;
