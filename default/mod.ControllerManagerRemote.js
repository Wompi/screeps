var mySpawnCenter = require('case.SpawnCenter');

var mod =
{
    runRemoteMiner: function()
    {
        var myCreeps = _.filter(Game.creeps,(a) => { return (a.memory.role == 'remote miner') && !a.spawning;})
        if (myCreeps.length == 0) return;
        var aCreep = myCreeps[0];

        var myFlagNames = _.filter(Game.flags,Flag.FLAG_COLOR.remote.miner.filter);
        if (myFlagNames.length == 0 )
        {
            logDEBUG('REMOTE MINER: no remote construction flags ...');
            return;
        }
        var aFlag = myFlagNames[0];

        if (aCreep.room.name == aFlag.pos.roomName)
        {
            var myInvaders = aCreep.room.find(FIND_HOSTILE_CREEPS);
            var hasInvaderFlag = (_.filter(Game.flags,Flag.FLAG_COLOR.remote.invader.filter)).length > 0;

            var aInvader = myInvaders[0];

            if (myInvaders.length > 0)
            {
                var aColor = Flag.FLAG_COLOR.remote.invader.color;
                var bColor = Flag.FLAG_COLOR.remote.invader.secondaryColor;

                var result = aCreep.room.createFlag(aInvader.pos,'INVADED ROOM',aColor,bColor);
                logWARN('REMOTE MINER: places an invader flag in room '+aCreep.room.name+' ..'+ErrorSting(result));
            }
        }

        var ignore = true;
        if (aCreep.pos.inRangeTo(Game.rooms['E66N49'].mySpawns[0],3))
        {
            ignore = false;
        }

        if (aCreep.pos.isEqualTo(aFlag.pos))
        {
            var myContainers = aCreep.room.find(FIND_STRUCTURES,
            {
                filter: (a) =>
                {
                    return a.structureType == STRUCTURE_CONTAINER && aCreep.pos.isEqualTo(a)
                }
            });
            aBox = myContainers[0];

            var aSite = _.filter(Game.constructionSites, (a) =>
            {
                return aCreep.pos.inRangeTo(a,3);
            });

            var aSource = aCreep.room.find(FIND_SOURCES,
            {
                filter: (a) =>
                {
                    return aCreep.pos.isNearTo(a);
                }
            });

            if (aSite.length > 0 && aCreep.carry.energy >= 25)
            {
                var result = aCreep.build(aSite[0]);
                logDEBUG('REMOTER MINER builds  .. '+ErrorSting(result));
            }
            if (!_.isUndefined(aBox) && ((aBox.hits < aBox.hitsMax && aBox.store[RESOURCE_ENERGY] == aBox.storeCapacity) || aBox.hits < (aBox.hitsMax* 0.5)  ))
            {
                var result = aCreep.repair(aBox);
                logDEBUG('REMOTER MINER repairs the box  .. '+ErrorSting(result));
            }


            if (!_.isUndefined(aBox) && _.sum(aBox.store) < aBox.storeCapacity || aCreep.carry.energy < aCreep.carryCapacity)
            {
                var result = aCreep.harvest(aSource[0]);
                logDEBUG('REMOTER MINER harvests  .. '+ErrorSting(result));
            }
            else
            {
                logDEBUG('REMOTER MINER box is full  .. '+ErrorSting(result));
            }


        }
        else
        {
            if (aCreep.pos.inRangeTo(aFlag,4))
            {
                aCreep.honk();
            }

            var result = aCreep.moveTo(aFlag, {ignoreCreeps: ignore});
            logDEBUG('REMOTER MINER moves to flag  .. '+ErrorSting(result));
        }
    },

    runRemoteClaimer: function()
    {
        var myCreeps = _.filter(Game.creeps,(a) => { return (a.memory.role == 'remote claimer') && !a.spawning;})
        if (myCreeps.length == 0) return;
        var aCreep = myCreeps[0];

        var myFlagNames = _.filter(Game.flags,Flag.FLAG_COLOR.remote.claim.filter);
        if (myFlagNames.length == 0 )
        {
            logDEBUG('REMOTE CLAIMER: no remote construction flags ...');
            return;
        }
        var aFlag = myFlagNames[0];

        if (aCreep.room.name == aFlag.pos.roomName)
        {
            var myInvaders = aCreep.room.find(FIND_HOSTILE_CREEPS);
            var hasInvaderFlag = (_.filter(Game.flags,Flag.FLAG_COLOR.remote.invader.filter)).length > 0;

            var aInvader = myInvaders[0];

            if (myInvaders.length > 0)
            {
                var aColor = Flag.FLAG_COLOR.remote.invader.color;
                var bColor = Flag.FLAG_COLOR.remote.invader.secondaryColor;

                var result = aCreep.room.createFlag(aInvader.pos,'INVADED ROOM',aColor,bColor);
                logWARN('REMOTE CLAIMER: places an invader flag in room '+aCreep.room.name+' ..'+ErrorSting(result));
            }
        }





        var ignore = true;
        if (aCreep.pos.inRangeTo(Game.rooms['E66N49'].mySpawns[0],3))
        {
            ignore = false;
        }

        if (aCreep.pos.isEqualTo(aFlag.pos))
        {
            var aController = aCreep.room.controller;
            var result = aCreep.reserveController(aController);
            logDEBUG('REMOTER CLAIMER claims a room  .. '+ErrorSting(result));
        }
        else
        {
            var result = aCreep.moveTo(aFlag, {ignoreCreeps: ignore});
            logDEBUG('REMOTER CLAIMER moves to flag  .. '+ErrorSting(result));
        }
    },

    runRemoteHauler: function()
    {
        var myCreeps = _.filter(Game.creeps,(a) => { return a.memory.role == 'remote hauler';});
        if (myCreeps.length == 0) return;

        var myRemoteCreeps = _.filter(Game.creeps,(a) => { return a.memory.role == 'remote builder';});
        if (myRemoteCreeps.length == 0) return;
        var aRemoteCreep = myRemoteCreeps[0];

        for (var aCreep of myCreeps)
        {
            var aRoom = Game.rooms['E65N49'];
            var myStorage = aRoom.storage;

            var ignore = true;
            if (aCreep.pos.inRangeTo(aRoom.mySpawns[0],3))
            {
                ignore = false;
            }

            var myResources = aCreep.room.find(FIND_DROPPED_RESOURCES,
            {
                filter: (a) =>
                {
                    return aCreep.pos.isNearTo(a);
                }
            });
            var aResource =  myResources.length == 0 ? undefined : myResources[0];

            if (!_.isUndefined(aResource))
            {
                var result = aCreep.pickup(aResource);
                logDEBUG('REMOTER BUILDER grabs dropped resource  .. '+ErrorSting(result));
            }

            if (aCreep.getLiveRenewTicks() > 0 && aCreep.pos.isNearTo(aRoom.mySpawns[0]))
            {
                logDEBUG('REMOTER BUILDER wait till full repair  .. '+ErrorSting(result));

            }
            else if (aCreep.ticksToLive < 500 )
            {
                var result = aCreep.moveTo(aRoom.mySpawns[0],{ ignoreCreeps: ignore});
                logDEBUG('REMOTER HAULER needs repair and moves to spawn ... '+ErrorSting(result));
            }
            else if (aCreep.carry.energy == 0)
            {
                var result = aCreep.moveTo(myStorage,{ignoreCreeps: ignore, range: 1});
                logDEBUG('REMOTER HAULER moves to storage .. '+ErrorSting(result));
                result = aCreep.withdraw(myStorage,RESOURCE_ENERGY);
                logDEBUG('REMOTER HAULER moves to grab from storage .. '+ErrorSting(result));
            }
            else
            {
                var result = aCreep.moveTo(aRemoteCreep, {ignoreCreeps: ignore});
                logDEBUG('REMOTER HAULER moves to remoteCreep .. '+ErrorSting(result));

                if (aCreep.pos.isNearTo(aRemoteCreep))
                {
                    var result  = aCreep.transfer(aRemoteCreep,RESOURCE_ENERGY);
                    logDEBUG('REMOTER HAULER transfers to remoteCreep .. '+ErrorSting(result));
                }
            }

            if (!aCreep.room.my && aCreep.carry.energy > 0)
            {
                var aArea =
                {
                    top: (aCreep.pos.y-3),
                    left: (aCreep.pos.x-3),
                    bottom: (aCreep.pos.y+3),
                    right: (aCreep.pos.x+3)
                };
                var myStructuresInRange = aCreep.room.lookForAtArea(LOOK_STRUCTURES,aArea.top,aArea.left,aArea.bottom,aArea.right,true);
                if (myStructuresInRange.length > 0)
                {
                    var myFixables = _.filter(myStructuresInRange,(a) =>
                    {
                        var delta = a.structure.hitsMax - a.structure.hits;
                        return (delta >= (REPAIR_POWER * 2)); // chnage the 2 for the count of work parts
                    });
                    var myFix = undefined;
                    for (var aFix of myFixables)
                    {
                        var newFixState = aFix.hits * 100 / aFix.hitsMax;
                        var oldFixState = 100;
                        if (!_.isUndefined(myFix))
                        {
                            oldFixState = myFix.hits * 100 / myFix.hitsMax;
                        }
                        //logERROR('FIXABLE: '+aFix.structureType+' ['+aFix.pos.x+' '+aFix.pos.y+'] state: '+newFixState+' delta: '+(aFix.hitsMax-aFix.hits));
                        if (_.isUndefined(myFix) || newFixState < oldFixState)
                        {
                            myFix = aFix;
                        }
                    }
                    //logERROR('DERP aFix '+JSON.stringify(myFix));
                    if (!_.isUndefined(myFix))
                    {
                        var fixObj =  Game.getObjectById(myFix.structure.id);
                        var result = aCreep.repair(fixObj);
                        if (result == OK)
                        {
                            // if (_.isUndefined(myFixer.room.memory.myRepairStats))
                            // {
                            //     myFixer.room.memory.myRepairStats = [];
                            // }
                            // myFixer.room.memory.myRepairStats.push(
                            // {
                            //     time: Game.time,
                            //     tower: myFixer.id,
                            //     x: fixObj.pos.x,
                            //     y: fixObj.pos.y,
                            //     sturctureType: fixObj.structureType,
                            //     repair: 200,
                            // });
                        }
                        hasEmergency = (fixObj.hits * 100 / fixObj.hitsMax) < 80;
                        logDEBUG('REMOTE HAULER fixed a road .. '+ErrorSting(result));
                    }
                }
            }
        }
    },

    runRemoteOreHauler:function()
    {
        var myCreeps = _.filter(Game.creeps,(a) => { return (a.memory.role == 'remote ore hauler') && !a.spawning;})
        if (myCreeps.length == 0) return;


        var myRemoteCreeps = _.filter(Game.creeps,(a) => { return a.memory.role == 'remote miner';});
        if (myRemoteCreeps.length == 0) return;
        var aRemoteCreep = myRemoteCreeps[0];

        var myFlagNames = _.filter(Game.flags,Flag.FLAG_COLOR.remote.miner.filter);
        if (myFlagNames.length == 0 )
        {
            logDEBUG('REMOTE SPAWN MINER: no remote construction flags ...');
            return;
        }
        var aFlag = myFlagNames[0];
        var aRoom = Game.rooms['E66N49'];

        for (var aCreep of myCreeps)
        {
            if (aCreep.room.name == aFlag.pos.roomName)
            {
                var myInvaders = aCreep.room.find(FIND_HOSTILE_CREEPS);
                var hasInvaderFlag = (_.filter(Game.flags,Flag.FLAG_COLOR.remote.invader.filter)).length > 0;

                var aInvader = myInvaders[0];

                if (myInvaders.length > 0)
                {
                    var aColor = Flag.FLAG_COLOR.remote.invader.color;
                    var bColor = Flag.FLAG_COLOR.remote.invader.secondaryColor;

                    var result = aCreep.room.createFlag(aInvader.pos,'INVADED ROOM',aColor,bColor);
                    logWARN('REMOTE ORE HAULER: places an invader flag in room '+aCreep.room.name+' ..'+ErrorSting(result));
                }
            }


            var myContainers = _.filter(aRoom.myContainers,(a) =>
            {
                var delta = a.storeCapacity - _.sum(a.store);
                //logERROR('NAME: '+aCreep.name+' C: '+delta+' H: '+_.sum(aCreep.carry)+' ['+a.pos.x+' '+a.pos.y+']' );
                return  delta > _.sum(aCreep.carry) ;
            });
            var myLinks = _.filter(aRoom.myLinks,(a) =>
            {
                var delta = a.energyCapacity - a.energy;
                //logERROR('NAME: '+aCreep.name+' L: '+delta+' H: '+_.sum(aCreep.carry)+' ['+a.pos.x+' '+a.pos.y+']' );
                return  delta > _.sum(aCreep.carry) ;
            });
            var myGrabBoxes = myContainers.concat(myLinks).concat(Game.rooms['E65N49'].storage);

            var aBox = myGrabBoxes[0];
            for ( var derp of myGrabBoxes)
            {
                if (aCreep.pos.getRangeTo(derp) < aCreep.pos.getRangeTo(aBox))
                {
                    aBox = derp;
                }
            }

            var bRoom = Game.rooms['E65N49'];
            var myStorage = Game.rooms['E65N49'].storage;

            var ignore = true;
            if (aCreep.pos.inRangeTo(bRoom.mySpawns[0],3))
            {
                ignore = false;
            }

            var myResources = aCreep.room.find(FIND_DROPPED_RESOURCES,
            {
                filter: (a) =>
                {
                    return aCreep.pos.isNearTo(a);
                }
            });
            var aResource =  myResources.length == 0 ? undefined : myResources[0];

            if (!_.isUndefined(aResource))
            {
                var result = aCreep.pickup(aResource);
                logDEBUG('REMOTER MORE HAULER grabs dropped resource  .. '+ErrorSting(result));
            }

            if (!aCreep.room.my && aCreep.carry.energy > 0)
            {
                var aArea =
                {
                    top: (aCreep.pos.y-3),
                    left: (aCreep.pos.x-3),
                    bottom: (aCreep.pos.y+3),
                    right: (aCreep.pos.x+3)
                };
                var myStructuresInRange = aCreep.room.lookForAtArea(LOOK_STRUCTURES,aArea.top,aArea.left,aArea.bottom,aArea.right,true);
                if (myStructuresInRange.length > 0 ) //&& !aCreep.pos.inRangeTo(aFlag,3))
                {
                    var myFixables = _.filter(myStructuresInRange,(a) =>
                    {
                        var delta = a.structure.hitsMax - a.structure.hits;
                        return (delta >= (REPAIR_POWER * 2)); // chnage the 2 for the count of work parts
                    });
                    var myFix = undefined;
                    for (var aFix of myFixables)
                    {
                        var newFixState = aFix.hits * 100 / aFix.hitsMax;
                        var oldFixState = 100;
                        if (!_.isUndefined(myFix))
                        {
                            oldFixState = myFix.hits * 100 / myFix.hitsMax;
                        }
                        //logERROR('FIXABLE: '+aFix.structureType+' ['+aFix.pos.x+' '+aFix.pos.y+'] state: '+newFixState+' delta: '+(aFix.hitsMax-aFix.hits));
                        if (_.isUndefined(myFix) || newFixState < oldFixState)
                        {
                            myFix = aFix;
                        }
                    }
                    //logERROR('DERP aFix '+JSON.stringify(myFix));
                    if (!_.isUndefined(myFix) && aCreep.pos.getRangeTo(aFlag) > 1 )
                    {
                        var fixObj =  Game.getObjectById(myFix.structure.id);
                        var result = aCreep.repair(fixObj);
                        if (result == OK)
                        {
                            // if (_.isUndefined(myFixer.room.memory.myRepairStats))
                            // {
                            //     myFixer.room.memory.myRepairStats = [];
                            // }
                            // myFixer.room.memory.myRepairStats.push(
                            // {
                            //     time: Game.time,
                            //     tower: myFixer.id,
                            //     x: fixObj.pos.x,
                            //     y: fixObj.pos.y,
                            //     sturctureType: fixObj.structureType,
                            //     repair: 200,
                            // });
                        }
                        hasEmergency = (fixObj.hits * 100 / fixObj.hitsMax) < 80;
                        logDEBUG('REMOTE HAULER fixed a road .. '+ErrorSting(result));
                    }
                }
            }

            var myContainers = aCreep.room.find(FIND_STRUCTURES,
            {
                filter: (a) =>
                {
                    return aCreep.pos.isNearTo(a) && a.structureType == STRUCTURE_CONTAINER;
                }
            });
            var aContainer = myContainers[0];

            if (aCreep.getLiveRenewTicks() > 0 && aCreep.pos.isNearTo(bRoom.mySpawns[0]))
            {
                logDEBUG('REMOTER ORE HAULER wait till full repair  .. '+ErrorSting(result));

            }
            else if (aCreep.ticksToLive < 300 )
            {
                var result = aCreep.moveTo(bRoom.mySpawns[0],{ ignoreCreeps: ignore});
                logDEBUG('REMOTER ORE HAULER needs repair and moves to spawn ... '+ErrorSting(result));
            }
            else if (aCreep.carry.energy == 0)
            {
                var result = aCreep.moveTo(aFlag,{ignoreCreeps: ignore, range: 1});
                logDEBUG('REMOTER ORE HAULER moves to miner .. '+ErrorSting(result));

                if (!_.isUndefined(aResource))
                {
                    var result = aCreep.pickup(aResource);
                    logDEBUG('REMOTER ORE HAULER grabs dropped resource  .. '+ErrorSting(result));
                }
                else if (myContainers.length > 0 && !aCreep.room.my)
                {
                    var result = aCreep.withdraw(aContainer,RESOURCE_ENERGY);
                    logDEBUG('REMOTER ORE HAULER grabs from box .. '+ErrorSting(result));
                }

            }
            else if ( aCreep.pos.isNearTo(aFlag) && _.sum(aCreep.carry) < aCreep.carryCapacity)
            {
                if (!_.isUndefined(aResource))
                {
                    var result = aCreep.pickup(aResource);
                    logDEBUG('REMOTER MORE HAULER grabs dropped resource  .. '+ErrorSting(result));
                }
                else
                {
                    var result = aCreep.withdraw(aContainer,RESOURCE_ENERGY);
                    logDEBUG('REMOTER ORE HAULER grabs from box .. '+ErrorSting(result));
                    logDEBUG('REMOTER ORE HAULER waits at box for full refill .. '+ErrorSting(result));
                }
            }
            else
            {
                var result = aCreep.moveTo(aBox,{ ignoreCreeps: ignore, range: 1});
                logDEBUG('REMOTER ORE HAULER moves to box ['+aBox.pos.x+' '+aBox.pos.y+'] ['+aBox.pos.roomName+'] .. '+ErrorSting(result));

                var result = aCreep.transfer(aBox,RESOURCE_ENERGY);
                logDEBUG('REMOTER ORE HAULER transfers to box  .. '+ErrorSting(result));
            }

            //TODO: this is just a quick fix rule to prevent the deadlock at the flag point if the miner is not in POSITION
            // - think about a general evade mechanic
            // - the -10 ajustment is because the hauler can repair roads and so the cargo is not full anymore
            if (aCreep.pos.inRangeTo(aFlag,3) && !aRemoteCreep.pos.isEqualTo(aFlag) && _.sum(aCreep.carry) < (aCreep.carryCapacity-10))
            {
                // TODO: this is just a quick fix think about a general evade solution
                var result = aCreep.moveTo(new RoomPosition(27,43,aCreep.room.name),{ ignoreCreeps: false});
                logERROR('REMOTE ORE HAULER moves toparking slot till miner arrives ... '+ErrorSting(result));
            }
        }
    },

    runTraderHauler: function()
    {
        var myCreeps = _.filter(Game.creeps,(a) => { return (a.memory.role == 'trader') && !a.spawning;})
        if (myCreeps.length == 0) return;

        var aStorage = Game.rooms['E65N49'].storage;
        var bStorage = Game.rooms['E66N49'].storage;
        var aTargetRoom = Game.rooms['E66N49'];

        for (var aCreep of myCreeps)
        {
            var aBox = undefined;
            if (!_.isUndefined(bStorage))
            {
                aBox = bStorage;
            }
            else
            {
                var myContainers = _.filter(aTargetRoom.myContainers,(a) =>
                {
                    var delta = a.storeCapacity - _.sum(a.store);
                    logERROR('NAME: '+aCreep.name+' C: '+delta+' H: '+_.sum(aCreep.carry)+' ['+a.pos.x+' '+a.pos.y+']' );
                    return  delta > _.sum(aCreep.carry) ;
                });
                var myLinks = _.filter(aTargetRoom.myLinks,(a) =>
                {
                    var delta = a.energyCapacity - a.energy;
                    logERROR('NAME: '+aCreep.name+' L: '+delta+' H: '+_.sum(aCreep.carry)+' ['+a.pos.x+' '+a.pos.y+']' );
                    return  delta > _.sum(aCreep.carry) ;
                });
                var myGrabBoxes = myContainers.concat(myLinks);

                var aBox = myGrabBoxes[0];
                for ( var derp of myGrabBoxes)
                {
                    if (aCreep.pos.getRangeTo(derp) < aCreep.pos.getRangeTo(aBox))
                    {
                        aBox = derp;
                    }
                }
            }

            if (_.isUndefined(aBox))
            {
                aBox = aStorage;
            }

            var ignore = true;
            if (aCreep.pos.inRangeTo(Game.rooms['E65N49'].mySpawns[0],3))
            {
                ignore = false;
            }

            var myResources = aCreep.room.find(FIND_DROPPED_RESOURCES,
            {
                filter: (a) =>
                {
                    return aCreep.pos.isNearTo(a);
                }
            });
            var aResource =  myResources.length == 0 ? undefined : myResources[0];

            if (!_.isUndefined(aResource))
            {
                var result = aCreep.pickup(aResource);
                logDEBUG('TRADER grabs dropped resource  .. '+ErrorSting(result));
            }

            if (aCreep.getLiveRenewTicks() > 0 && aCreep.pos.isNearTo(Game.rooms['E65N49'].mySpawns[0]))
            {
                logDEBUG('TRADER wait till full repair  .. '+ErrorSting(result));

            }
            else if (aCreep.ticksToLive < 300 )
            {
                var result = aCreep.moveTo(Game.rooms['E65N49'].mySpawns[0],{ ignoreCreeps: ignore});
                logDEBUG('TRADER needs repair and moves to spawn ... '+ErrorSting(result));
            }
            else if (aCreep.carry.energy == 0)
            {
                var result = aCreep.moveTo(aStorage,{ignoreCreeps: ignore, range: 1});
                logDEBUG('TRADER moves to storage .. '+ErrorSting(result));

                if (!_.isUndefined(aResource))
                {
                    var result = aCreep.pickup(aResource);
                    logDEBUG('TRADER grabs dropped resource  .. '+ErrorSting(result));
                }
                else if (aCreep.pos.isNearTo(aStorage))
                {
                    var result = aCreep.withdraw(aStorage,RESOURCE_ENERGY);
                    logDEBUG('TRADER grabs from storage .. '+ErrorSting(result));
                }
            }
            else
            {
                var result = aCreep.moveTo(aBox,{ ignoreCreeps: ignore, range: 1});
                logDEBUG('TRADER moves to box ['+aBox.pos.x+' '+aBox.pos.y+'] ['+aBox.pos.roomName+'] .. '+ErrorSting(result));

                var result = aCreep.transfer(aBox,RESOURCE_ENERGY);
                logDEBUG('TRADER transfers to box  .. '+ErrorSting(result));
            }
        }
    },

    runRemoteGuard: function()
    {
        var myCreeps = _.filter(Game.creeps,(a) => { return (a.memory.role == 'remote guard') && !a.spawning;})
        if (myCreeps.length == 0) return;
        var aCreep = myCreeps[0];

        var myFlagNames = _.filter(Game.flags,Flag.FLAG_COLOR.remote.invader.filter);
        if (myFlagNames.length == 0 )
        {
            logDEBUG('REMOTE GUARD: no remote construction flags ...');
            return;
        }
        var aFlag = myFlagNames[0];

        var ignore = true;
        if (aCreep.pos.inRangeTo(Game.rooms['E66N49'].mySpawns[0],3))
        {
            ignore = false;
        }

        if (aCreep.pos.roomName == aFlag.pos.roomName)
        {
            // attack invader
            var myInvaders = aCreep.room.find(FIND_HOSTILE_CREEPS);
            if (myInvaders.length == 0 )
            {
                // invader despawned or got killed - remove flag - move to recycle pos
                var result = aFlag.remove();
                logDEBUG('REMOTE GUARD: room '+aCreep.room.name+' is clear .. remove flag ...'+ErrorSting(result));s
                return;
            }
            var aInvader = myInvaders[0];
            var result = aCreep.moveTo(aInvader);
            logWARN('REMOTE GUARD moves to invader ... '+ErrorSting(result));

            result = aCreep.attack(aInvader);
            logWARN('REMOTE GUARD engages invader ... '+ErrorSting(result));
        }
        else
        {
            var result = aCreep.moveTo(aFlag,{ignoreCreeps: ignore});
            logWARN('REMOTE GUARD moves to invaded room '+aFlag.pos.roomName+' ... '+ErrorSting(result));
        }
    },

    spawnRemoteGuard: function()
    {
        var myCreeps = _.filter(Game.creeps,(a) => { return (a.memory.role == 'remote guard');})
        if (myCreeps.length > 0) return;
        var aCreep = myCreeps[0];

        var myFlagNames = _.filter(Game.flags,Flag.FLAG_COLOR.remote.invader.filter);
        if (myFlagNames.length == 0 )
        {
            logDEBUG('REMOTE SPAWN GUARD: no remote invader flags ...');
            return;
        }
        var aFlag = myFlagNames[0];
        var aRoom = Game.rooms['E66N49'];

        var aBody = mySpawnCenter.getRemoteGuard(aRoom);
        if (_.isUndefined(aBody))
        {
            logDEBUG('REMOTE SPAWN GUARD: not enough energy .. ...');
            return;
        }

        var aName = 'R-Guard '+aRoom.name;
        var result = aRoom.mySpawns[0].createCreep(aBody,aName,{ role: 'remote guard'});
        if (typeof result === 'string')
        {
            logWARN('REMOTE GUARG '+result+' is spawning .. ');
            Game.creeps[result].init();
        }
        else
        {
            logERROR('REMOTE GUARD something fishy with '+aName+' creep creation .. '+ErrorSting(result));
        }
    },

    spawnRemoteMiner: function()
    {
        var myCreeps = _.filter(Game.creeps,(a) => { return (a.memory.role == 'remote miner');})
        if (myCreeps.length > 0) return;
        var aCreep = myCreeps[0];

        var myFlagNames = _.filter(Game.flags,Flag.FLAG_COLOR.remote.miner.filter);
        if (myFlagNames.length == 0 )
        {
            logDEBUG('REMOTE SPAWN MINER: no remote construction flags ...');
            return;
        }
        var aFlag = myFlagNames[0];
        var aRoom = Game.rooms['E66N49'];

        var aBody = mySpawnCenter.getRemoteMiner(aRoom);
        if (_.isUndefined(aBody))
        {
            logDEBUG('REMOTE SPAWN MINER: not enough energy .. ...');
            return;
        }

        var aName = 'R-Miner '+aRoom.name;
        var result = aRoom.mySpawns[0].createCreep(aBody,aName,{ role: 'remote miner'});
        if (typeof result === 'string')
        {
            logWARN('REMOTE MINER '+result+' is spawning .. ');
            Game.creeps[result].init();
        }
        else
        {
            logERROR('REMOTE MINER something fishy with '+aName+' creep creation .. '+ErrorSting(result));
        }
    },

    spawnRemoteClaimer: function()
    {
        var myCreeps = _.filter(Game.creeps,(a) => { return (a.memory.role == 'remote claimer');})
        if (myCreeps.length > 0) return;

        var myFlagNames = _.filter(Game.flags,Flag.FLAG_COLOR.remote.claim.filter);
        if (myFlagNames.length == 0 )
        {
            logDEBUG('REMOTE SPAWN: no remote construction flags ...');
            return;
        }
        var aFlag = myFlagNames[0];
        var aRoom = Game.rooms['E66N49'];

        var aBody = mySpawnCenter.getRemoteClaimer(aRoom);
        if (_.isUndefined(aBody)) return;

        var aName = 'R-Claimer '+aRoom.name;
        var result = aRoom.mySpawns[0].createCreep(aBody,aName,{ role: 'remote claimer'});
        //var result = undefined;
        if (typeof result === 'string')
        {
            logWARN('REMOTE CLAIMER '+result+' is spawning .. ');
            Game.creeps[result].init();
        }
        else
        {
            logERROR('REMOTE CLAIMER something fishy with '+aName+' creep creation .. '+ErrorSting(result));
        }
    },

    spawnRemotehauler: function()
    {
        var myCreeps = _.filter(Game.creeps,(a) => { return (a.memory.role == 'remote ore hauler');})
        if (myCreeps.length > 2) return;
        var aCreep = myCreeps[0];

        var myRooms = [Game.rooms['E65N49']];

        if (myRooms.length == 0)
        {
            logERROR('REMOTE SPAWN: current code can not handle rooms farther than 1 room away!');
            return;
        }
        var aRoom = myRooms[0];


        var aBody = mySpawnCenter.getRemoteHauler(aRoom);
        if (_.isUndefined(aBody)) return;

        //var aName = 'R-Hauler '+aRoom.name;
        var result = aRoom.mySpawns[0].createCreep(aBody,undefined,{ role: 'remote ore hauler'});
        if (typeof result === 'string')
        {
            logWARN('REMOTE BUILDER '+result+' is spawning .. ');
            Game.creeps[result].init();
        }
        else
        {
            logERROR('REMOTE BUILDER something fishy with creep creation .. '+ErrorSting(result));
        }
    },

    spawnTrader: function()
    {
        var myCreeps = _.filter(Game.creeps,(a) => { return (a.memory.role == 'trader');})
        if (myCreeps.length > 0) return;
        var aCreep = myCreeps[0];

        var myRooms = [Game.rooms['E65N49']];

        if (myRooms.length == 0)
        {
            logERROR('REMOTE SPAWN: current code can not handle rooms farther than 1 room away!');
            return;
        }
        var aRoom = myRooms[0];


        var aBody = mySpawnCenter.getTrader(aRoom);
        if (_.isUndefined(aBody)) return;

        //var aName = 'R-Hauler '+aRoom.name;
        var result = aRoom.mySpawns[0].createCreep(aBody,undefined,{ role: 'trader'});
        if (typeof result === 'string')
        {
            logWARN('TRADER '+result+' is spawning .. ');
            Game.creeps[result].init();
        }
        else
        {
            logERROR('TRADER something fishy with creep creation .. '+ErrorSting(result));
        }
    },
};
module.exports = mod;
