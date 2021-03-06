class RemoteMiningClaimer
{
    constructor(pOperation)
    {
        this.mOperation = pOperation;
    }

    processRetreat(pRoomName)
    {

    }

    // spawn a claimer when the room is below 5k controller level
    // travel: 51 from spawn to controller
    process(pRoomName)
    {
        var myCreep = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == 'remote claimer '+pRoomName})

        if (!this.mOperation.isSecure)
        {
            this.retreat(myCreep);
            return;
        }

        if (this.mOperation.mControllerReserveTime >= 4500 && _.isUndefined(myCreep))
        {
            logDERP('Max reservation for room '+pRoomName);
            return;
        }

        var aSpawn = Game.spawns['Nexuspool'];
        if (_.isUndefined(myCreep))
        {
            // 2200 = A * 75
            var aClaim = 2;
            var aMove = 1;
            var aC = new Array(aClaim).fill(CLAIM);
            var aM = new Array(aMove).fill(MOVE);
            var aBody = aC.concat(aM);

            var aCost = aClaim * 600 + aMove * 50;
            var result = undefined;
            //var result = aSpawn.createCreep(aBody,'Claim '+pRoomName,{role: 'remote claimer '+pRoomName});
            logDERP('C:('+aSpawn.name+') '+aCost+' aClaim = '+aClaim+' aMove = '+aMove+' result = '+ErrorSting(result));
            return;
        }
        else
        {
            logDERP('remote claimer '+pRoomName+' active ......');
        }
        if (myCreep.spawning) return;

        if (!myCreep.pos.isNearTo(this.mOperation.mControllerPos))
        {
            // myCreep.moveTo(this.mOperation.mControllerPos,{ignoreCreeps: true});
            myCreep.travelTo({pos:this.mOperation.mControllerPos});
        }
        else
        {
            var aRoom = Game.rooms[pRoomName];
            var aController = aRoom.controller;
            myCreep.reserveController(aController);
        }
    }

    retreat(pCreep)
    {
        if (_.isUndefined(pCreep)) return;

        var aPos = new RoomPosition(25,44,'E65N49');
        //pCreep.moveTo(aPos,{ignoreCreeps: true});
        pCreep.moveTo({pos:aPos});
    }
}
module.exports = RemoteMiningClaimer;
