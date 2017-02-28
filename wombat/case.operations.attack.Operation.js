class AttackOperation
{
    contructor()
    {

    }

    processOperation()
    {
        var aDefender = Game.creeps['Wallaby'];

        if (!_.isUndefined(aDefender))
        {
            if (!aDefender.spawning)
            {
                var aSpawn = Game.getObjectById('58b222d59019b0f04abbe79a');
                var aExtension = _.find(aDefender.room.find(FIND_STRUCTURES), (aStucture) => aStucture.structureType == STRUCTURE_EXTENSION);
                var aCivCreep = _.find(aDefender.room.find(FIND_HOSTILE_CREEPS), (aCreep) => true);
                var aContainer = _.find(aDefender.room.find(FIND_STRUCTURES), (aBox) => aBox.structureType == STRUCTURE_CONTAINER);
                var myRoads = _.filter(aDefender.room.find(FIND_STRUCTURES), (aStruct) => aStruct.structureType == STRUCTURE_ROAD);
                var aRoad = _.min(myRoads,(aRoad) => aRoad.pos.getRangeTo(aDefender));

                if (aSpawn != null)
                {
                    var aDerp = _.find(aDefender.room.find(FIND_HOSTILE_CREEPS), (aCreep) => aCreep.getActiveBodyparts(ATTACK) > 0);

                    if (!_.isUndefined(aDerp))
                    {
                        var res = aDefender.moveTo(aDerp);
                        aDefender.attack(aDerp);
                        Log(undefined,'DERP defend: '+ErrorString(res));

                    }
                    else
                    {
                        var res = aDefender.moveTo(aSpawn);
                        aDefender.attack(aSpawn);
                        Log(undefined,'DERP derp: '+ErrorString(res));
                    }
                }
                else if (!_.isUndefined(aExtension))
                {
                    var res = aDefender.moveTo(aExtension);
                    aDefender.attack(aExtension);
                    Log(undefined,'DERP extension: '+ErrorString(res));

                }
                else if (!_.isUndefined(aCivCreep))
                {
                    var res = aDefender.moveTo(aCivCreep);
                    aDefender.attack(aCivCreep);
                    Log(undefined,'DERP civ creep: '+ErrorString(res));

                }
                else if (!_.isUndefined(aContainer))
                {
                    var res = aDefender.moveTo(aContainer);
                    aDefender.attack(aContainer);
                    Log(undefined,'DERP box: '+ErrorString(res));

                }
                else if (!_.isUndefined(aRoad))
                {
                    var res = aDefender.moveTo(aRoad);
                    aDefender.attack(aRoad);
                    Log(undefined,'DERP road: '+ErrorString(res));

                }
                else
                {
                    var res = aDefender.moveTo(new RoomPosition(23,26,'W68S76'));
                    Log(undefined,'DERP: '+ErrorString(res));
                }

            }
        }
        else
        {
            // var aRoom = _.find(Game.rooms);
            // var aEnergy = RCL_ENERGY(aRoom.controller.level);
            // var aCreepBody = new CreepBody();
            // var aSearch =
            // {
            //     name: CARRY,
            //     //max:  10,//_.bind(getCarryMax,aRoom,aRoom.find(FIND_SOURCES)),    //({derp}) => getCarryMax(arguments[0]),
            // };
            // var aBodyOptions =
            // {
            //     hasRoads: true,
            //     //moveBoost: '',
            // };
            // var aBody =
            // {
            //     [WORK]:
            //     {
            //         count: () => getWorkCount(),
            //     },
            // };
            //
            // var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);
            // Log(undefined,JS(_.countBy(aResult.body)));
            // var res = _.find(Game.spawns).createCreep(aResult.body,'Wallaby');
            // Log(undefined,'WAR: '+ErrorString(res));

        }

    }
}
module.exports = AttackOperation;
