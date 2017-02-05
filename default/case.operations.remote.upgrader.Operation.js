class RemoteUpgraderOperation
{
    constructor()
    {

    }

    processOperation(pRoomName)
    {

        var ROLE_NAME = 'remote upgrader '+pRoomName;
        var myCreep = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == ROLE_NAME})

        var ROOM_NAME = 'E65N48';

        var aSpawn = Game.spawns['Nexuspool'];
        if (_.isUndefined(myCreep))
        {
            // dont spawn an upgrader if the box is not at least 75% full
            var aBox = Game.rooms[ROOM_NAME].controller.myUpgraderBoxes[0];
            if (aBox.store[RESOURCE_ENERGY] < 1500)
            {
                return;
            }

            if (aSpawn.room.energyAvailable < 300) return;
            var aUpgraderConfig = Formula.calcUpgrader(aSpawn.room);
            if (_.isUndefined(aUpgraderConfig)) return;

            var workArr = new Array(aUpgraderConfig.work).fill(WORK);
            var carryArr = new Array(aUpgraderConfig.carry).fill(CARRY);
            var moveArr = new Array(aUpgraderConfig.move).fill(MOVE);


            var aBody = workArr.concat(carryArr).concat(moveArr);

            var aMem =
            {
                role: ROLE_NAME,
            };
            var result = aSpawn.createCreep(aBody,'RU '+ROOM_NAME,aMem);
            logDERP('C('+ROLE_NAME+'):('+aSpawn.name+') workArr = '+aWork+' carryArr = '+aMove+' result = '+ErrorSting(result));
            return;
        }
        else
        {
            logDERP(ROLE_NAME+' active ......');
        }
        if (myCreep.spawning) return;

        var aPos = new RoomPosition(41,41,ROOM_NAME);
        if (!myCreep.pos.isEqualTo(aPos))
        {
            myCreep.travelTo({pos:aPos});
        }
        else
        {
            var aBox = myCreep.room.controller.myUpgraderBoxes[0];
            myCreep.withdraw(aBox,RESOURCE_ENERGY);
        }


        myCreep.upgradeController(myCreep.room.controller);


    }
}
module.exports = RemoteUpgraderOperation;
