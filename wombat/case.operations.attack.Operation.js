class AttackOperation
{
    contructor()
    {

    }

    processOperation()
    {
        var ROOM_NAME = 'W68S76';
        var aDefender = Game.creeps['Wallaby'];

        if (!_.isUndefined(aDefender))
        {
            if (!aDefender.spawning)
            {
                if (aDefender.room.name != ROOM_NAME)
                {
                    let res = aDefender.moveTo(new RoomPosition(25,25,ROOM_NAME))
                    Log(undefined,'MEGADERP: '+aDefender.pos.toString()+' res: '+ErrorString(res));
                    return;
                }



                var aSpawn = _.find(aDefender.room.find(FIND_STRUCTURES), (aStucture) => aStucture.structureType == STRUCTURE_SPAWN);
                var aExtension = _.find(aDefender.room.find(FIND_STRUCTURES), (aStucture) => aStucture.structureType == STRUCTURE_EXTENSION);
                var aCivCreep = _.find(aDefender.room.find(FIND_HOSTILE_CREEPS), (aCreep) => true);
                var aContainer = _.find(aDefender.room.find(FIND_STRUCTURES), (aBox) => aBox.structureType == STRUCTURE_CONTAINER);

                var myRoads = _.filter(aDefender.room.find(FIND_STRUCTURES), (aStruct) => aStruct.structureType == STRUCTURE_ROAD);
                var aRoad = undefined;
                if (myRoads.length > 0)
                {
                    aRoad = _.min(myRoads,(aRoad) => aRoad.pos.getRangeTo(aDefender));
                }

                var myConstructions = aDefender.room.find(FIND_HOSTILE_CONSTRUCTION_SITES);
                var aConstructionSite = undefined;
                if (myConstructions.length > 0)
                {
                    aConstructionSite = _.min(myConstructions,(aSite) => aSite.pos.getRangeTo(aDefender));
                }

                var myHostiles = _.filter(aDefender.room.find(FIND_HOSTILE_CREEPS), (aCreep) => aCreep.getActiveBodyparts(ATTACK) > 0);
                var aHostile = undefined;
                if (myHostiles.length > 0)
                {
                    aHostile = _.min(myHostiles,(aCreep) => aCreep.pos.getRangeTo(aDefender));
                }

                if (!_.isUndefined(aHostile))
                {
                    var res = aDefender.moveTo(aHostile);
                    aDefender.attack(aHostile);
                    Log(undefined,'DERP defend: '+aDefender.pos.toString()+' '+ErrorString(res));
                }
                else if (!_.isUndefined(aSpawn))
                {
                    var res = aDefender.moveTo(aSpawn);
                    aDefender.attack(aSpawn);
                    Log(undefined,'DERP derp: '+aDefender.pos.toString()+' '+ErrorString(res));
                }
                else if (!_.isUndefined(aExtension))
                {
                    var res = aDefender.moveTo(aExtension);
                    aDefender.attack(aExtension);
                    Log(undefined,'DERP extension: '+aDefender.pos.toString()+' '+ErrorString(res));

                }
                else if (!_.isUndefined(aCivCreep))
                {
                    var res = aDefender.moveTo(aCivCreep);
                    aDefender.attack(aCivCreep);
                    Log(undefined,'DERP civ creep: '+aDefender.pos.toString()+' '+ErrorString(res));

                }
                else if (!_.isUndefined(aConstructionSite))
                {
                    var res = aDefender.moveTo(aConstructionSite);
                    aDefender.attack(aConstructionSite);
                    Log(undefined,'DERP construction site: '+aDefender.pos.toString()+' '+ErrorString(res));

                }
                else if (!_.isUndefined(aContainer))
                {
                    var res = aDefender.moveTo(aContainer);
                    aDefender.attack(aContainer);
                    Log(undefined,'DERP box: '+aDefender.pos.toString()+' '+ErrorString(res));

                }
                else if (!_.isUndefined(aRoad))
                {
                    var res = aDefender.moveTo(aRoad);
                    aDefender.attack(aRoad);
                    Log(undefined,'DERP road: '+aDefender.pos.toString()+' '+ErrorString(res));

                }
                else
                {
                    var res = aDefender.moveTo(new RoomPosition(23,26,'W68S76'));
                    Log(undefined,'DERP: '+aDefender.pos.toString()+' '+ErrorString(res));
                }

            }
        }
        else
        {
            var aRoom = _.find(Game.rooms);
            var aEnergy = RCL_ENERGY(aRoom.controller.level);
            var aCreepBody = new CreepBody();
            var aSearch =
            {
                name: ATTACK,
                max:  5,//_.bind(getCarryMax,aRoom,aRoom.find(FIND_SOURCES)),    //({derp}) => getCarryMax(arguments[0]),
            };
            var aBodyOptions =
            {
                //hasRoads: true,
                //moveBoost: '',
            };
            var aBody =
            {
                // [WORK]:
                // {
                //     count: () => getWorkCount(),
                // },
            };

            var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);
            Log(undefined,JS(_.countBy(aResult.body)));
            // var res = _.find(Game.spawns).createCreep(aResult.body,'Wallaby');
            // Log(undefined,'WAR: '+ErrorString(res));

        }

    }
}
module.exports = AttackOperation;
