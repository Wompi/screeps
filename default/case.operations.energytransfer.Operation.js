class EnergyTransferOperation
{
    constructor(pRoleName)
    {
        this.mRoleName = pRoleName;
    }

    processOperation()
    {
        var aCreep = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == this.mRoleName })

        var aSpawn = Game.spawns['Nexus West'];

        if (_.isUndefined(aCreep))
        {
            // 2200 = A * 75
            var MY_ENERGY = aSpawn.room.energyCapacityAvailable;
            var aCarry = _.floor(_.min([50 / 1.5  ,MY_ENERGY / 75]));
            var aMove = _.ceil((aCarry) / 2);

            var aC = new Array(aCarry).fill(CARRY);
            var aM = new Array(aMove).fill(MOVE);
            var aBody = aC.concat(aM);

            var aCost = aCarry * 50 + aMove * 50;

            var aMem =
            {
                role: this.mRoleName,
                target: this.getGraph()[0],
            };

            var result = aSpawn.createCreep(aBody,this.mRoleName,aMem);
            logDERP('C('+this.mRoleName+'):('+aSpawn.name+') '+aCost+' aCarry = '+aCarry+' aMove = '+aMove+' result = '+ErrorSting(result));
            return;
        }
        else
        {
            logDERP(this.mRoleName+' (multi room) active ......');
        }
        if (aCreep.spawning) return;

        var aRepairSpawn = Game.spawns['Nexuspool'];
        if (!aRepairSpawn.spawning)
        {
            if (aCreep.pos.isNearTo(aRepairSpawn) && aCreep.getLiveRenewTicks() > 0)
            {
                return;
            }
        }

        var aStart_Storage = Game.rooms['E65N49'].storage;
        var aEnd_Storage = Game.rooms['E63N47'].storage;


        var myTarget = aCreep.memory.target;
        if (aCreep.pos.isEqualTo(myTarget.x,myTarget.y))
        {
            var roomGraph = this.getGraph();
            aCreep.memory.target = roomGraph[aCreep.memory.target.next];
            logDEBUG('ENERGY TRANSFER adjusts target position ..');
        }

        var aPos = new RoomPosition(myTarget.x,myTarget.y,myTarget.roomName);
        var result = aCreep.travelTo({pos:aPos});
        logDERP('ENERGY TRANSFER moves to target position ['+myTarget.x+' '+myTarget.y+' '+myTarget.roomName+']... '+ErrorSting(result));




        if (aCreep.pos.isNearTo(aStart_Storage))
        {
            if (_.sum(aCreep.carry) == 0)
            {
                aCreep.cancelOrder('move');
            }
            aCreep.withdraw(aStart_Storage,RESOURCE_ENERGY);
        }

        if (aCreep.pos.isNearTo(aEnd_Storage))
        {
            if (_.sum(aCreep.carry) == aCreep.carryCapacity)
            {
                aCreep.cancelOrder('move');
            }
            aCreep.transfer(aEnd_Storage,RESOURCE_ENERGY);
        }

    }


    getGraph()
    {
        return  [
                    {   x: 26,   y: 25, roomName:"E65N49", next:  1, },
                    {   x: 28,   y: 48, roomName:"E65N49", next:  2, },

                    {   x: 28,   y:  1, roomName:"E65N48", next:  3, },
                    {   x:  1,   y: 17, roomName:"E65N48", next:  4, },

                    {   x: 48,   y: 17, roomName:"E64N48", next:  5, },
                    {   x:  7,   y: 48, roomName:"E64N48", next:  6, },

                    {   x:  7,   y:  1, roomName:"E64N47", next:  7, },
                    {   x:  1,   y: 10, roomName:"E64N47", next:  8, },

                    {   x: 48,   y: 11, roomName:"E63N47", next:  9, },
                    {   x: 22,   y: 17, roomName:"E63N47", next: 10, },
                    {   x: 48,   y: 11, roomName:"E63N47", next: 11, },

                    {   x:  1,   y: 10, roomName:"E64N47", next: 12, },
                    {   x:  7,   y:  1, roomName:"E64N47", next: 13, },

                    {   x:  7,   y: 48, roomName:"E64N48", next: 14, },
                    {   x: 48,   y: 17, roomName:"E64N48", next: 15, },

                    {   x:  1,   y: 17, roomName:"E65N48", next: 16, },
                    {   x: 28,   y:  1, roomName:"E65N48", next: 17, },

                    {   x: 28,   y: 48, roomName:"E65N49", next: 18, },
                    {   x: 26,   y: 25, roomName:"E65N49", next:  0, },

                ];

    }
}
module.exports = EnergyTransferOperation;
