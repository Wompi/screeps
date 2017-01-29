class RemoteMiningDefender
{
    constructor(pOperation)
    {
        this.mOperation = pOperation;
        this.mLab = Game.getObjectById('5877ecd15dc3eff517f28f15');
    }

    process(pRoomName)
    {
        var ROLE_NAME = 'remote defender '+pRoomName;
        var myCreep = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == ROLE_NAME})

        if (this.mOperation.isSecure && _.isUndefined(myCreep))
        {
            // consider retreat for recycle
            logDERP('Remote defender '+pRoomName+' room is secure .....');
            return;
        }

        var aSpawn = Game.spawns['Nexuspool'];
        if (_.isUndefined(myCreep))
        {
            var aMove = 5;         // 250
            var aCarry = 1;         // 50
            var aAttack = 2;        // 160
            var aRanged = 1;        // 150
            var aHeal = 1;          // 250 -   860
            // time = 66
            // 1500 till attack
            // 12 heal per tick
            // 90 estimated attack
            // for 5000 hp 240 heal - 20 ticks til death

            var aM = new Array(aMove).fill(MOVE);
            var aC = new Array(aCarry).fill(CARRY);
            var aA = new Array(aAttack).fill(ATTACK);
            var aR = new Array(aRanged).fill(RANGED_ATTACK);
            var aH = new Array(aHeal).fill(HEAL);
            var aBody = aM.concat(aC).concat(aA).concat(aR).concat(aH);

            var aCost = aMove * BODYPART_COST[MOVE] + aCarry * BODYPART_COST[CARRY] + aAttack * BODYPART_COST[ATTACK]+  aRanged * BODYPART_COST[RANGED_ATTACK] + aHeal * BODYPART_COST[HEAL];

            var aMem =
            {
                role: ROLE_NAME,
            };
            var result = aSpawn.createCreep(aBody,'RD '+pRoomName,aMem);
            logDERP('C('+ROLE_NAME+'):('+aSpawn.name+') '+aCost+' result = '+ErrorSting(result));
            return;
        }
        else
        {
            logDERP(ROLE_NAME+' active ......');
        }
        if (myCreep.spawning) return;

        if (!_.any(myCreep.body, i => !!i.boost))
        {
            if (!myCreep.pos.isNearTo(this.mLab))
            {
                myCreep.moveTo(this.mLab, {ignoreCreeps: true});
            }
            else
            {
                this.mLab.boostCreep(myCreep);
            }
            return;
        }

        var aPos = new RoomPosition(25,25,pRoomName);
        if (myCreep.room.name != pRoomName && !this.mOperation.isSecure)
        {
            // myCreep.moveTo(aPos);
            myCreep.travelTo({pos:aPos});
        }
        else
        {
            var myInvaders = myCreep.room.find(FIND_HOSTILE_CREEPS);
            if (!_.isEmpty(myInvaders))
            {
                var aInvader = _.min(myInvaders, (aCreep) =>
                {
                    return myCreep.pos.getRangeTo(aCreep);
                });
                myCreep.moveTo(aInvader);
                myCreep.attack(aInvader);
                myCreep.rangedAttack(aInvader);

                if (myCreep.pos.getRangeTo(aInvader) > 1 && myCreep.hits < myCreep.hitsMax)
                {
                    myCreep.heal(myCreep);
                }
            }
            else
            {
                logDERP('DEFENDER DERP')
                if (myCreep.hits < myCreep.hitsMax)
                {
                    myCreep.heal(myCreep);
                }

                var aRoom = myCreep.room;
                var myRoomResources = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.resource);
                var myResources = _.filter(myRoomResources, (aDrop) =>
                {
                    return aDrop.pos.getRangeTo(myCreep) < 4;
                });

                if (!_.isEmpty(myResources) && _.sum(myCreep.carry) < myCreep.carryCapacity)
                {
                    var aResource = _.min(myResources, (aDrop) =>
                    {
                        return aDrop.amount;
                    });
                    myCreep.pickup(aResource);
                }
                else if (myCreep.hits == myCreep.hitsMax)
                {
                    var aStorage = Game.rooms['E65N49'].storage;

                    if (!myCreep.pos.isNearTo(aStorage))
                    {
                        // myCreep.moveTo(aStorage);
                        myCreep.travelTo(aStorage);
                    }
                    else
                    {
                        var aType = _.findKey(myCreep.carry, (a) =>
                        {
                            return a > 0;
                        });

                        if (!_.isUndefined(aType))
                        {
                            myCreep.transfer(aStorage,aType);
                        }
                        else
                        {
                            // consider recyle her because the boost has some value
                            myCreep.suicide();
                        }
                    }
                }

            }
        }
    }
}
module.exports = RemoteMiningDefender;
