class RemoteMiningHauler
{
    constructor(pOperation)
    {
        this.mOperation = pOperation;
    }

    process(pRoomName)
    {
        var ROLE_NAME = 'remote hauler 1 '+pRoomName;
        var myCreep = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == ROLE_NAME})


        if (!this.mOperation.isSecure)
        {
            this.retreat(myCreep);
            return;
        }

        var aSpawn = Game.spawns['Nexuspool'];
        if (_.isUndefined(myCreep))
        {
            // 2200 = A * 75
            var aCarry = 16
            var aMove = 8;

            var aC = new Array(aCarry).fill(CARRY);
            var aM = new Array(aMove).fill(MOVE);
            var aBody = aC.concat(aM);

            var aCost = aCarry * 50 + aMove * 50;

            var aMem =
            {
                role: ROLE_NAME,
                //target: undefined,
            };
            //var result = 0;
            var result = aSpawn.createCreep(aBody,'RH1 '+pRoomName,aMem);
            logDERP('C('+ROLE_NAME+'):('+aSpawn.name+') '+aCost+' aCarry = '+aCarry+' aMove = '+aMove+' result = '+ErrorSting(result));
            return;
        }
        else
        {
            logDERP(ROLE_NAME+' active ......');
        }
        if (myCreep.spawning) return;

        // maintenance
        if (myCreep.ticksToLive < 100)
        {
            // myCreep.moveTo(aSpawn);
            myCreep.travelTo(aSpawn);
            return;
        }
        if (myCreep.pos.isNearTo(aSpawn) && myCreep.getLiveRenewTicks() > 0 && !aSpawn.spawning)
        {
            return;
        }


        var ROLE_NAME = 'remote miner 1 '+pRoomName;
        var aMinerPos = new RoomPosition(33,17,pRoomName);
        var aMinerCreep = _.find(Game.creeps,(aCreep) =>
        {
            return (aCreep.memory.role == ROLE_NAME) && aCreep.pos.isEqualTo(aMinerPos);
        })
        var aPos = new RoomPosition(33,16,pRoomName);
        if (_.isUndefined(aMinerCreep))
        {
            aPos =  new RoomPosition(32,16,pRoomName)
        }

        // hauling
        if (myCreep.carry[RESOURCE_ENERGY] == 0)
        {
            if (!myCreep.pos.isEqualTo(aPos))
            {
                // myCreep.moveTo(aPos,{ignoreCreeps: true});
                myCreep.travelTo({pos:aPos});
            }
            else
            {
                var aRoom = myCreep.room;
                var myResources = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.resource);
                var aResource = _.filter(myResources, (aDrop) =>
                {
                    return aDrop.pos.getRangeTo(myCreep) < 2;
                });

                if (!_.isEmpty(aResource))
                {
                    var result = myCreep.pickup(aResource[0]);
                }
            }
        }
        else
        {
            var aStorage = Game.rooms['E65N49'].storage;
            if (!myCreep.pos.isNearTo(aStorage) && (_.sum(myCreep.carry) == myCreep.carryCapacity || aStorage.pos.roomName == myCreep.pos.roomName))
            {
                // myCreep.moveTo(aStorage,{ignoreCreeps: true});
                myCreep.travelTo(aStorage);
            }
            else if (_.sum(myCreep.carry) < myCreep.carryCapacity && (aStorage.pos.roomName != myCreep.pos.roomName))
            {
                var aRoom = myCreep.room;
                var myResources = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.resource);
                var aResource = _.filter(myResources, (aDrop) =>
                {
                    return aDrop.pos.getRangeTo(myCreep) < 2;
                });

                if (!_.isEmpty(aResource))
                {
                    var result = myCreep.pickup(aResource[0]);
                }
            }
            else
            {
                myCreep.transfer(aStorage,RESOURCE_ENERGY);
            }
        }
    }

    retreat(pCreep)
    {
        if (_.isUndefined(pCreep)) return;

        var aPos = new RoomPosition(25,44,'E65N49');
        pCreep.moveTo(aPos);
        //pCreep.travelTo({pos:aPos});
    }

    // source 1 57ef9ea886f108ae6e60fadf 51 (48)
    // source 2 57ef9ea886f108ae6e60fae0 46 (43)

    //  A = 10/tick
    //  B = 51 * 2 * A = 1020
    //  C = 43 * 2 * A = 860
    testStuff()
    {
        var aSource = Game.getObjectById('57ef9ea886f108ae6e60fae0');
        var aStorage = Game.getObjectById('584576e702fc59d80d3a56ff');


        var aPath = Util.getPath(aStorage.pos,aSource.pos);

        var aLen  = aPath.path.length;

        aPath.path = [];
        logDERP('HAULER: '+aLen+' path='+JSON.stringify(aPath));
    }
}
module.exports = RemoteMiningHauler;
