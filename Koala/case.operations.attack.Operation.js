class AttackOperation
{
    constructor(pName)
    {
        this.mName = pName;
    }

    processOperation()
    {
        var ROOM_NAME = 'W67S74';
        var ROOM_POSITION = new RoomPosition( 2,19,ROOM_NAME)
        // if (this.mName == 'Wallaby')
        // {
            // var ROOM_NAME = 'W71S79';
            //
            // //ROOM_NAME = 'W68S76';
            // var ROOM_POSITION = new RoomPosition( 25,25,ROOM_NAME)


            // var ROOM_NAME = 'W69S76';
            // var ROOM_POSITION = new RoomPosition( 39,13,ROOM_NAME)

        // }


        var aDefender = Game.creeps[this.mName];

        if (!_.isUndefined(aDefender))
        {
            if (!aDefender.spawning)
            {

                var myHostiles = _.filter(aDefender.room.find(FIND_HOSTILE_CREEPS), (aCreep) => aCreep.getActiveBodyparts(ATTACK) > 0 || aCreep.getActiveBodyparts(RANGED_ATTACK) > 0 && aCreep.pos.getRangeTo(aDefender) < 4);

                var myNotSoHostiles = _.filter(aDefender.room.find(FIND_HOSTILE_CREEPS), (aCreep) => aCreep.getActiveBodyparts(HEAL) > 0 );


                var aHostile = undefined;
                if (myHostiles.length > 0)
                {
                    aHostile = _.min(myHostiles,(aCreep) => aCreep.pos.getRangeTo(aDefender));
                }

                var aNoSoHostile = undefined;
                if (myHostiles.length > 0)
                {
                    aNoSoHostile = _.min(myNotSoHostiles,(aCreep) => aCreep.pos.getRangeTo(aDefender));
                }



                if (aDefender.room.name != ROOM_NAME && _.isUndefined(aHostile))
                {
                    let res = aDefender.heal(aDefender);
                    res = aDefender.moveTo(ROOM_POSITION)
                    Log(undefined,'MEGADERP: '+aDefender.pos.toString()+' res: '+ErrorString(res));
                    return;
                }

                var aSpawn = undefined;
                var aExtension = undefined;
                var aTower = undefined;

                //if (this.mName == 'Wallaby')
                {
                    let myTowers = _.filter(aDefender.room.find(FIND_STRUCTURES), (aTower) => aTower.structureType == STRUCTURE_TOWER && aTower.energy > 0);
                    if (myTowers.length > 0)
                    {
                        aTower = _.min(myTowers, (aT) => aT.pos.getRangeTo(aDefender));
                    }

                    aSpawn = _.find(aDefender.room.find(FIND_STRUCTURES), (aStucture) => aStucture.structureType == STRUCTURE_SPAWN);
                    // let myConstructions = aDefender.room.find(FIND_HOSTILE_CONSTRUCTION_SITES, (aSite) =>
                    // {
                    //     Log(undefined,aSite.structureType);
                    //     return aSite.structureType == STRUCTURE_SPAWN
                    // });
                    // if (myConstructions.length > 0)
                    // {
                    //     aSpawn = _.min(myConstructions,(aSite) => aSite.pos.getRangeTo(aDefender));
                    //     Log(LOG_LEVEL.info,JS(aSpawn));
                    // }


                    let myExtensions = _.filter(aDefender.room.find(FIND_STRUCTURES), (aStucture) => aStucture.structureType == STRUCTURE_EXTENSION);
                    if (myExtensions.length > 0)
                    {
                        aExtension = _.min(myExtensions, (aExt) => aExt.pos.getRangeTo(aDefender));
                    }
                }
                var myCivCreeps = _.filter(aDefender.room.find(FIND_HOSTILE_CREEPS), (aCreep) => aCreep.getActiveBodyparts(ATTACK) == 0);
                var aCivCreep = undefined;
                if (myCivCreeps.length > 0)
                {
                    aCivCreep = _.min(myCivCreeps, (aCreep) => aCreep.pos.getRangeTo(aDefender));
                }

                var aContainer = undefined;
                var aRoad = undefined;
                var aConstructionSite = undefined;
                var aTerminal = undefined;
                var aStorage = undefined;
                var aEmptyTower = undefined;
                var aLink = undefined;
                var aExtractor = undefined;
                //if (this.mName == 'Wallaby')
                {
                    aTerminal = _.find(aDefender.room.find(FIND_STRUCTURES), (aBox) => aBox.structureType == STRUCTURE_TERMINAL);
                    aLink = _.find(aDefender.room.find(FIND_STRUCTURES), (aBox) => aBox.structureType == STRUCTURE_LINK);
                    aExtractor = _.find(aDefender.room.find(FIND_STRUCTURES), (aBox) => aBox.structureType == STRUCTURE_EXTRACTOR);
                    aStorage = _.find(aDefender.room.find(FIND_STRUCTURES), (aBox) => aBox.structureType == STRUCTURE_STORAGE);
                    aEmptyTower = _.find(aDefender.room.find(FIND_STRUCTURES), (aBox) => aBox.structureType == STRUCTURE_TOWER && aBox.energy == 0);

                    aContainer = _.find(aDefender.room.find(FIND_STRUCTURES), (aBox) => aBox.structureType == STRUCTURE_CONTAINER);
                    var myRoads = _.filter(aDefender.room.find(FIND_STRUCTURES), (aStruct) => aStruct.structureType == STRUCTURE_ROAD && aStruct.hits > 1000);
                    aRoad = undefined;
                    if (myRoads.length > 0)
                    {
                        aRoad = _.min(myRoads,(aRoad) => aRoad.pos.getRangeTo(aDefender));
                    }
                    //
                    var myConstructions = aDefender.room.find(FIND_HOSTILE_CONSTRUCTION_SITES);
                    aConstructionSite = undefined;
                    if (myConstructions.length > 0)
                    {
                        aConstructionSite = _.min(myConstructions,(aSite) => aSite.pos.getRangeTo(aDefender));
                    }
                }







                if (aDefender.getActiveBodyparts(HEAL) > 0 && ((_.isUndefined(aHostile) && _.isUndefined(aNoSoHostile)) || aHostile.pos.getRangeTo(aDefender) > 1 ) )
                {
                    if (aDefender.hits < aDefender.hitsMax)
                    {
                        let res = aDefender.heal(aDefender);
                        Log(LOG_LEVEL.info, 'ATTACK: time for heal ...');
                    }
                }

                if (!_.isUndefined(aHostile))
                {
                    if (aDefender.getActiveBodyparts(RANGED_ATTACK))
                    {
                        var res = aDefender.moveTo(aHostile,{reusePath: 0, range: 3});
                    }
                    else
                    {
                        var res = aDefender.moveTo(aHostile,{reusePath: 0, range: 1});
                    }
                    aDefender.attack(aHostile);

                    Log(undefined,'DERP defend: '+aDefender.pos.toString()+' '+ErrorString(res));
                }
                // else if (!_.isUndefined(aNoSoHostile))
                // {
                //     if (aDefender.getActiveBodyparts(RANGED_ATTACK))
                //     {
                //         var res = aDefender.moveTo(aNoSoHostile,{reusePath: 0, range: 3});
                //     }
                //     else
                //     {
                //         var res = aDefender.moveTo(aNoSoHostile,{reusePath: 0, range: 1});
                //     }
                //     aDefender.attack(aNoSoHostile);
                //
                //     Log(undefined,'DERP defend: '+aDefender.pos.toString()+' '+ErrorString(res));
                // }
                else if (!_.isUndefined(aTower))
                {
                    var res = aDefender.moveTo(aTower);
                    aDefender.attack(aTower);
                    Log(undefined,'DERP tower: '+aDefender.pos.toString()+' '+ErrorString(res));
                }
                else if (!_.isUndefined(aSpawn))
                {
                    var res = aDefender.moveTo(aSpawn);
                    aDefender.attack(aSpawn);
                    Log(undefined,'DERP derp: '+aDefender.pos.toString()+' '+ErrorString(res));
                }
                else if (!_.isUndefined(aTerminal))
                {
                    var res = aDefender.moveTo(aTerminal);
                    aDefender.attack(aTerminal);
                    Log(undefined,'DERP terminal: '+aDefender.pos.toString()+' '+ErrorString(res));

                }
                else if (!_.isUndefined(aStorage))
                {
                    var res = aDefender.moveTo(aStorage);
                    aDefender.attack(aStorage);
                    Log(undefined,'DERP storage: '+aDefender.pos.toString()+' '+ErrorString(res));

                }
                else if (!_.isUndefined(aEmptyTower))
                {
                    var res = aDefender.moveTo(aEmptyTower);
                    aDefender.attack(aEmptyTower);
                    Log(undefined,'DERP empty tower: '+aDefender.pos.toString()+' '+ErrorString(res));

                }
                else if (!_.isUndefined(aExtension))
                {
                    var res = aDefender.moveTo(aExtension);
                    aDefender.attack(aExtension);
                    Log(undefined,'DERP extension: '+aDefender.pos.toString()+' '+ErrorString(res));

                }
                else if (!_.isUndefined(aCivCreep))
                {
                    if (aDefender.getActiveBodyparts(RANGED_ATTACK))
                    {
                        var res = aDefender.moveTo(aCivCreep,{reusePath: 0, range: 3});
                    }
                    else
                    {
                        var res = aDefender.moveTo(aCivCreep,{reusePath: 0});
                    }
                    aDefender.attack(aCivCreep);
                    Log(undefined,'DERP civ creep: '+aDefender.pos.toString()+' '+ErrorString(res));

                }
                else if (!_.isUndefined(aConstructionSite))
                {
                    var res = aDefender.moveTo(aConstructionSite);
                    aDefender.attack(aConstructionSite);
                    Log(undefined,'DERP construction site: '+aDefender.pos.toString()+' '+ErrorString(res));

                }
                else if (!_.isUndefined(aLink))
                {
                    var res = aDefender.moveTo(aLink);
                    res = aDefender.attack(aLink);
                    Log(undefined,'DERP link: '+aDefender.pos.toString()+' '+ErrorString(res));

                }
                // else if (!_.isUndefined(aExtractor))
                // {
                //     var res = aDefender.moveTo(aExtractor,{range: 1});
                //     res = aDefender.attack(aExtractor);
                //     Log(undefined,'DERP extractor: '+aDefender.pos.toString()+' '+ErrorString(res));
                //
                // }
                else if (!_.isUndefined(aRoad))
                {
                    var res = aDefender.moveTo(aRoad);
                    aDefender.attack(aRoad);
                    Log(undefined,'DERP road: '+aDefender.pos.toString()+' '+ErrorString(res));

                }
                else if (!_.isUndefined(aContainer))
                {
                    var res = aDefender.moveTo(aContainer,{range: 1});
                    res = aDefender.attack(aContainer);
                    Log(undefined,'DERP box: '+aDefender.pos.toString()+' '+ErrorString(res));

                }
                else
                {
                    if (aDefender.getActiveBodyparts(RANGED_ATTACK))
                    {
                        ROOM_POSITION = new RoomPosition( 3,23,ROOM_NAME);
                        var res = aDefender.moveTo(ROOM_POSITION,{reusePath: 0,range: 0});
                    }
                    else
                    {

                        // if (aDefender.pos.roomName == 'W68S75' && aDefender.pos.inRangeTo(43,48,1))
                        // {
                        //     if (aDefender.ticksToLive < 285)
                        //     {
                        //         var res = aDefender.moveTo(ROOM_POSITION,{reusePath: 0,range: 1});
                        //     }
                        // }
                        // else
                        {
                            var res = aDefender.moveTo(ROOM_POSITION,{reusePath: 0,range: 1});
                        }
                    }
                    Log(undefined,'DERP: '+aDefender.pos.toString()+' '+ErrorString(res));
                }

            }
        }
        else
        {
            var aRoom = _.find(Game.rooms);
            var aEnergy = aRoom.energyCapacityAvailable;//RCL_ENERGY(aRoom.controller.level);
            var aCreepBody = new CreepBody();

            var aSearch =
            {
                name: ATTACK,
                //max:  10,//_.bind(getCarryMax,aRoom,aRoom.find(FIND_SOURCES)),    //({derp}) => getCarryMax(arguments[0]),
            };

            if (this.mName == 'Wombat' || this.mName == 'Cold')
            {
                var aSearch =
                {
                    name: RANGED_ATTACK,
                    //max:  5,//_.bind(getCarryMax,aRoom,aRoom.find(FIND_SOURCES)),    //({derp}) => getCarryMax(arguments[0]),
                };
            }

            var aBodyOptions =
            {
                //hasRoads: true,
                //moveBoost: '',
            };
            var aBody =
            {
                [HEAL]:
                {
                    count: () => 1,
                },
            };

            var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);
            Log(undefined,JS(_.countBy(aResult.body)));

            if (!_.isUndefined(this.mName))
            {
                var res = _.find(Game.spawns).createCreep(aResult.body,this.mName);
                Log(undefined,'WAR: '+ErrorString(res));
            }

        }

    }
}
module.exports = AttackOperation;
