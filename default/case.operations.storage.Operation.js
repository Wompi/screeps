class StorageOperation
{
    constructor()
    {

    }

    processOperation()
    {
        this.processE64N49();
        this.processE66N49();
        this.processE66N48();
        this.processE65N49();
    }

    processE65N49()
    {
        var aRoom = Game.rooms['E65N49'];
        var aPos = new RoomPosition(26, 24, aRoom.name);
        var myCreep = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == 'storage transfer' && aCreep.room.name == aRoom.name })
        var aRoomMineralType = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.mineral)[0].mineralType;


        var aSpawn = Game.spawns['Nexus Outpost'];
        if (_.isUndefined(myCreep))
        {
            // 2200 = A * 75
            var aCarry = 2;
            var aMove = 1;
            var aC = new Array(aCarry).fill(CARRY);
            var aM = new Array(aMove).fill(MOVE);
            var aBody = aC.concat(aM);

            var aCost = aCarry * 50 + aMove * 50;

            var result = aSpawn.createCreep(aBody,'Storage '+aRoom.name,{role: 'storage transfer'});
            logDERP('C:('+aSpawn.name+') '+aCost+' aCarry = '+aCarry+' aMove = '+aMove+' result = '+ErrorSting(result));
            return;
        }
        else
        {
            logDERP('Storage transfer active ......');
        }
        if (myCreep.spawning) return;

        var myResources = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.resource);
        var aResource = _.filter(myResources, (aDrop) =>
        {
            return aDrop.pos.getRangeTo(myCreep) < 2;
        });

        var aLink = Game.getObjectById('587795cddf9d2f435b33d943');
        var aTerminal = Game.getObjectById('5867099d48f8acf528f397ae');
        var aStorage = Game.getObjectById('584576e702fc59d80d3a56ff');

        var aTransfer = _.findKey(aTerminal.store,(a,b) =>
        {
            return !(b == aRoomMineralType || b == RESOURCE_ENERGY)
        });

        if (!myCreep.pos.isEqualTo(aPos))
        {
            myCreep.moveTo(aPos,{ignoreCreeps: true});
        }

        if (_.sum(myCreep.carry) == 0)
        {
            if (!_.isEmpty(aResource))
            {
                var result = myCreep.pickup(aResource[0]);
            }
            else if (aLink.energy > 0)
            {
                myCreep.withdraw(aLink,RESOURCE_ENERGY);
            }
            else if (!_.isUndefined(aTransfer))
            {
                myCreep.withdraw(aTerminal,aTransfer);
            }
            else if (aStorage.store[aRoomMineralType] > 0 && (_.isUndefined(aTerminal.store[aRoomMineralType]) || aTerminal.store[aRoomMineralType] < 50000))
            {
                myCreep.withdraw(aStorage,aRoomMineralType);
            }
        }
        else
        {
            var aType = _.findKey(myCreep.carry, (a) => { return (a > 0); })
            if (myCreep.carry[aRoomMineralType] > 0)
            {
                myCreep.transfer(aTerminal,aRoomMineralType)
            }
            else if (aType == RESOURCE_ENERGY && aTerminal.store[RESOURCE_ENERGY] < aStorage.store[RESOURCE_ENERGY] && aTerminal.store[RESOURCE_ENERGY] < 50000)
            {
                myCreep.transfer(aTerminal,RESOURCE_ENERGY)
            }
            else
            {
                myCreep.transfer(aStorage,aType)
            }
        }

    }

    processE66N48()
    {
        var aRoom = Game.rooms['E66N48'];
        var aPos = new RoomPosition(34, 24, aRoom.name);
        var myCreep = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == 'storage transfer' && aCreep.room.name == aRoom.name })
        var aRoomMineralType = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.mineral)[0].mineralType;


        var aSpawn = Game.spawns['Brainpool'];
        if (_.isUndefined(myCreep))
        {
            // 2200 = A * 75
            var aCarry = 2;
            var aMove = 1;
            var aC = new Array(aCarry).fill(CARRY);
            var aM = new Array(aMove).fill(MOVE);
            var aBody = aC.concat(aM);

            var aCost = aCarry * 50 + aMove * 50;

            var result = aSpawn.createCreep(aBody,'Storage '+aRoom.name,{role: 'storage transfer'});
            logDERP('C:('+aSpawn.name+') '+aCost+' aCarry = '+aCarry+' aMove = '+aMove+' result = '+ErrorSting(result));
            return;
        }
        else
        {
            logDERP('Storage transfer active ......');
        }
        if (myCreep.spawning) return;

        var myResources = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.resource);
        var aResource = _.filter(myResources, (aDrop) =>
        {
            return aDrop.pos.getRangeTo(myCreep) < 2;
        })

        var aLink = Game.getObjectById('5866e30b6950d8927fbbe941');
        var aStorage = Game.getObjectById('58670bd25d1b59a921cc9639');


        var aTerminal = Game.getObjectById('5869b91951f129f77136d38a');
        var aTransfer = _.findKey(aTerminal.store,(a,b) =>
        {
            return !(b == aRoomMineralType || b == RESOURCE_ENERGY)
        });

        if (!myCreep.pos.isEqualTo(aPos))
        {
            myCreep.moveTo(aPos,{ignoreCreeps: true});
        }

        if (_.sum(myCreep.carry) == 0)
        {
            if (!_.isEmpty(aResource))
            {
                var result = myCreep.pickup(aResource[0]);
            }
            else if (aLink.energy > 0)
            {
                myCreep.withdraw(aLink,RESOURCE_ENERGY);
            }
        }
        else
        {
            // if (aTerminal.store[RESOURCE_ENERGY] < aStorage.store[RESOURCE_ENERGY] && aTerminal.store[RESOURCE_ENERGY] < 50000)
            // {
            //     myCreep.transfer(aTerminal,RESOURCE_ENERGY)
            // }
            // else
            {
                var aType = _.findKey(myCreep.carry, (a) => { return (a > 0); })
                myCreep.transfer(aStorage,aType)
            }
        }
    }

    processE64N49()
    {
        var aRoom = Game.rooms['E64N49'];
        var aPos = new RoomPosition(25, 15, aRoom.name);
        var aRoomMineralType = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.mineral)[0].mineralType;

        var myCreep = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == 'storage transfer' && aCreep.room.name == aRoom.name })

        var aSpawn = Game.spawns['Derppool'];
        if (_.isUndefined(myCreep))
        {
            // 2200 = A * 75
            var aCarry = 2;
            var aMove = 1;
            var aC = new Array(aCarry).fill(CARRY);
            var aM = new Array(aMove).fill(MOVE);
            var aBody = aC.concat(aM);

            var aCost = aCarry * 50 + aMove * 50;

            var result = aSpawn.createCreep(aBody,'Storage E46N49',{role: 'storage transfer'});
            logDERP('C:('+aSpawn.name+') '+aCost+' aCarry = '+aCarry+' aMove = '+aMove+' result = '+ErrorSting(result));
            return;
        }
        else
        {
            logDERP('Storage transfer active ......');
        }
        if (myCreep.spawning) return;


        var myResources = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.resource);
        var aResource = _.filter(myResources, (aDrop) =>
        {
            return aDrop.pos.getRangeTo(myCreep) < 2;
        })


        var aLink = Game.getObjectById('586c5b67857b96b61dbcf5fc');
        var aTerminal = Game.getObjectById('587237428b3580d1135e28b5');
        var aStorage = Game.getObjectById('586a21c2e0f15c00496a3ac2');

        var aTransfer = _.findKey(aTerminal.store,(a,b) =>
        {
            return !(b == aRoomMineralType || b == RESOURCE_ENERGY)
        });

        if (!myCreep.pos.isEqualTo(aPos))
        {
            myCreep.moveTo(aPos,{ignoreCreeps: true});
        }

        if (_.sum(myCreep.carry) == 0)
        {
            if (!_.isEmpty(aResource))
            {
                var result = myCreep.pickup(aResource[0]);
            }
            else if (aLink.energy > 0)
            {
                myCreep.withdraw(aLink,RESOURCE_ENERGY);
            }
            else if (!_.isUndefined(aTransfer))
            {
                myCreep.withdraw(aTerminal,aTransfer);
            }
            else if (aStorage.store[aRoomMineralType] > 0 && (_.isUndefined(aTerminal.store[aRoomMineralType]) || aTerminal.store[aRoomMineralType] < 50000))
            {
                myCreep.withdraw(aStorage,aRoomMineralType);
            }
        }
        else
        {
            var aType = _.findKey(myCreep.carry, (a) => { return (a > 0); })
            if (myCreep.carry[aRoomMineralType] > 0)
            {
                myCreep.transfer(aTerminal,aRoomMineralType)
            }
            else if (aType == RESOURCE_ENERGY && aTerminal.store[RESOURCE_ENERGY] < aStorage.store[RESOURCE_ENERGY] && aTerminal.store[RESOURCE_ENERGY] < 50000)
            {
                myCreep.transfer(aTerminal,RESOURCE_ENERGY)
            }
            else
            {
                myCreep.transfer(aStorage,aType)
            }
        }
    }

    processE66N49()
    {
        var aRoom = Game.rooms['E66N49'];
        var aPos = new RoomPosition(38, 7, aRoom.name);
        var aRoomMineralType = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.mineral)[0].mineralType;


        var myCreep = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == 'storage transfer' && aCreep.room.name == aRoom.name })

        var aSpawn = Game.spawns['Case Outpost'];
        if (_.isUndefined(myCreep))
        {
            // 2200 = A * 75
            var aCarry = 2;
            var aMove = 1;
            var aC = new Array(aCarry).fill(CARRY);
            var aM = new Array(aMove).fill(MOVE);
            var aBody = aC.concat(aM);

            var aCost = aCarry * 50 + aMove * 50;

            var result = aSpawn.createCreep(aBody,'Storage '+aRoom.name,{role: 'storage transfer'});
            logDERP('C:('+aSpawn.name+') '+aCost+' aCarry = '+aCarry+' aMove = '+aMove+' result = '+ErrorSting(result));
            return;
        }
        else
        {
            logDERP('Storage transfer active ......');
        }
        if (myCreep.spawning) return;

        var myResources = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.resource);
        var aResource = _.filter(myResources, (aDrop) =>
        {
            return aDrop.pos.getRangeTo(myCreep) < 2;
        })

        var aLink = Game.getObjectById('584da36d30668331219e7b84');
        var aTerminal = Game.getObjectById('5849be798119cb1102ef5c75');
        var aStorage = Game.getObjectById('5848b94c676fbb1b5d560ede');

        var REACTION_DEFAULT_AMOUNT = 3000;

        var aRequest = _.findKey(aStorage.store,(a,b) =>
        {
            var result = (b == RESOURCE_UTRIUM_HYDRIDE || b == RESOURCE_UTRIUM_OXIDE ) && (_.isUndefined(aTerminal.store[b]) || aTerminal.store[b] < REACTION_DEFAULT_AMOUNT);
            //logDERP('b = '+b+' result = '+result);
            return  result;
        });

        var aTransfer = _.findKey(aTerminal.store,(a,b) =>
        {
            return !(b == aRoomMineralType || b == RESOURCE_ENERGY || b == RESOURCE_UTRIUM_HYDRIDE || b == RESOURCE_UTRIUM_OXIDE)
        });


        logDERP('UH request - '+aRequest);

        if (!myCreep.pos.isEqualTo(aPos))
        {
            myCreep.moveTo(aPos,{ignoreCreeps: true});
        }

        if (_.sum(myCreep.carry) == 0)
        {
            if (!_.isEmpty(aResource))
            {
                var result = myCreep.pickup(aResource[0]);
            }
            else if (aLink.energy > 0)
            {
                myCreep.withdraw(aLink,RESOURCE_ENERGY);
            }
            else if (!_.isUndefined(aTransfer))
            {
                myCreep.withdraw(aTerminal,aTransfer);
            }
            else if (!_.isUndefined(aRequest))
            {
                myCreep.withdraw(aStorage,aRequest);
            }
            else if (aStorage.store[aRoomMineralType] > 0 && (_.isUndefined(aTerminal.store[aRoomMineralType]) || aTerminal.store[aRoomMineralType] < 50000))
            {
                myCreep.withdraw(aStorage,aRoomMineralType);
            }

        }
        else
        {
            var aType = _.findKey(myCreep.carry, (a) => { return (a > 0); })

            if (myCreep.carry[aRoomMineralType] > 0)
            {
                myCreep.transfer(aTerminal,aRoomMineralType)
            }
            else if (myCreep.carry[aRequest] > 0)
            {
                myCreep.transfer(aTerminal,aRequest);
            }
            else if (aType == RESOURCE_ENERGY && aTerminal.store[RESOURCE_ENERGY] < aStorage.store[RESOURCE_ENERGY] && aTerminal.store[RESOURCE_ENERGY] < 50000)
            {
                myCreep.transfer(aTerminal,RESOURCE_ENERGY)
            }
            else
            {
                myCreep.transfer(aStorage,aType)
            }
        }
    }
}
module.exports = StorageOperation;
