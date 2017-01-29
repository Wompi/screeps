var ReactionsHaulerMemory = require('case.operations.reactions.hauler.Memory');

class ReactionsHaulerOperation
{
    constructor()
    {
        this.mRoomName = 'E65N49';

        this.ROLE_NAME = 'boost hauler';
        this.MIN_REACTION_AMOUNT = 300;
        this.mSpawnName = 'Nexus Outpost';

        this.mStorage = undefined;
        this.mCreep = undefined;

        this.mMemory = new ReactionsHaulerMemory(this);
    }

    processOperation()
    {
        //var a = Game.cpu.getUsed();
        this.setHaulerCreep();
        this.setHaulerStorage();
        //var b = Game.cpu.getUsed();
        //logWARN('PROFILE setHaulerCreep(): '+(b-a));

        //var a = Game.cpu.getUsed();
        this.mMemory.processMemory();
        // var b = Game.cpu.getUsed();
        // logWARN('PROFILE processMemory(): '+(b-a));

        // var a = Game.cpu.getUsed();
        this.spawnReactionHauler();
        // var b = Game.cpu.getUsed();
        // logWARN('PROFILE spawnReactionHauler(): '+(b-a));


        // var a = Game.cpu.getUsed();
        this.processReactionHauler();
        // var b = Game.cpu.getUsed();
        // logWARN('PROFILE processReactionHauler(): '+(b-a));
    }

    processReactionHauler()
    {
        if (_.isUndefined(this.mCreep)) return;
        if (_.isUndefined(this.mStorage)) return;

        logDERP(this.ROLE_NAME+' '+this.mRoomName+' active ......');

        if (_.sum(this.mCreep.carry) == 0)
        {
            if (this.mCreep.ticksToLive < 15)
            {
                // don't grab anything before dying
                var aIdlePos = new RoomPosition(31,28,this.mRoomName);
                this.mCreep.moveTo(aIdlePos);
                return;
            }

            var myReactions = _.filter(this.mMemory.getReactions(), (aReaction) =>
            {
                var aLab = Game.getObjectById(this.mMemory.getLabID(aReaction));
                if (_.isNull(aLab)) return false;
                var aDelta = aLab.mineralCapacity - aLab.mineralAmount;
                var aStoreAmount = this.mStorage.store[aReaction];  // check for undefined

                return aDelta > 0 && !_.isUndefined(aStoreAmount);
            })

            if (_.isEmpty(myReactions))
            {
                // all labs full or no reactions in the storage
                // consider sucide/move to idle/recycle the creep
                this.moveToIDLEPosition();
            }
            else
            {
                var aReaction = myReactions[0];
                var aLab = Game.getObjectById(this.mMemory.getLabID(aReaction));
                var aDelta = aLab.mineralCapacity - aLab.mineralAmount;
                var aStorageAmount = this.mStorage.store[aReaction];
                if (this.mCreep.withdraw(this.mStorage,aReaction,_.min([aDelta,this.mCreep.carryCapacity,aStorageAmount])) == ERR_NOT_IN_RANGE)
                {
                    this.mCreep.moveTo(this.mStorage,{ignoreCreeps: true});
                    logDERP('Grabbing '+this.ROLE_NAME+' '+this.mRoomName+' -> '+aReaction);
                }
            }
        }
        else
        {
            var aType = _.findKey(this.mCreep.carry, (a,b) =>
            {
                //logDERP('a = '+JSON.stringify(a)+' b = '+b);
                return a > 0;
            });

            var aLab = Game.getObjectById(this.mMemory.getLabID(aType));
            if (!_.isNull(aLab))
            {
                if (this.mCreep.transfer(aLab,aType) == ERR_NOT_IN_RANGE)
                {
                    var result = this.mCreep.moveTo(aLab,{ignoreCreeps: true});
                    logDERP('Hauling '+this.ROLE_NAME+' '+this.mRoomName+' -> '+aType);
                }
            }
            else
            {
                logERROR('ReactionHaulerOperation:processReactionHauler() - NO LAB ID - fix this!');
            }
        }
    }

    spawnReactionHauler()
    {
        var aSpawn = Game.spawns[this.mSpawnName];

        var aStorageCondition = !_.isUndefined(this.mStorage) && _.filter(this.mMemory.getReactions(), (aReaction) =>
        {
            return !_.isUndefined(this.mStorage.store[aReaction]);
        }).length > 0;

        var aReactionCondition = _.any(this.mMemory.getReactions(), (aReaction) =>
        {
            return this.mMemory.getReactionAmount(aReaction) < this.MIN_REACTION_AMOUNT;
        })

        var aSpawnCondition =      aReactionCondition
                                && _.isUndefined(this.mCreep)
                                && !aSpawn.spawning
                                && aStorageCondition;

        if (aSpawnCondition)
        {
            var aCarry = 1;
            var aMove = 1;

            var aC = new Array(aCarry).fill(CARRY);
            var aM = new Array(aMove).fill(MOVE);
            var aBody = aC.concat(aM);
            var aCost = aCarry * 50 + aMove * 50;
            var result = aSpawn.createCreep(aBody,'Boost Hauler',{role: this.ROLE_NAME});
            logDERP('C(boost hauler):('+aSpawn.name+') '+aCost+' aCarry = '+aCarry+' aMove = '+aMove+' result = '+ErrorSting(result));
        }
    }

    setHaulerCreep()
    {
        this.mCreep = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == this.ROLE_NAME });
    }

    setHaulerStorage()
    {
        this.mStorage = Game.rooms[this.mRoomName].storage;
    }

    moveToIDLEPosition()
    {
        var aIdlePos = new RoomPosition(31,28,this.mRoomName);
        this.mCreep.moveTo(aIdlePos);
    }
}
module.exports = ReactionsHaulerOperation;
