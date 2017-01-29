class ReactionsProduceOperation
{
    constructor()
    {
        this.mRoomName = 'E66N49';

        this.ROLE_NAME = 'lab reaction producer';
        this.MIN_REACTION_AMOUNT = 300;
        this.mSpawnName = 'Case Outpost';

        this.mStorage = undefined;
        this.mCreep = undefined;
    }

    processOperation()
    {
        //this.setHaulerCreep();
        //this.setHaulerStorage();
        // this.mMemory.processMemory();
        //this.spawnReactionHauler();
        this.runLabs_E66N49();
        this.runLabs_E66N48();
    }

    runLabs_E66N48()
    {
        var aRoomName = 'E66N48'
        var aCreep = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == 'lab hauler' })

        var aStorage = Game.rooms[aRoomName].storage;
        var aSpawn = Game.spawns['Brainpool'];

        var LAB_RESOURCE_ONE = RESOURCE_HYDROGEN;
        var LAB_RESOURCE_TWO = RESOURCE_OXYGEN;
        var LAB_REACTION = REACTIONS[LAB_RESOURCE_ONE][LAB_RESOURCE_TWO];

        if (_.isUndefined(aCreep))
        {
            // 2200 = A * 75
            var aCarry = 1;
            var aMove = 1;

            var aC = new Array(aCarry).fill(CARRY);
            var aM = new Array(aMove).fill(MOVE);
            var aBody = aC.concat(aM);

            var aCost = aCarry * 50 + aMove * 50;

            var result = aSpawn.createCreep(aBody,'LH '+aRoomName,{role: 'lab hauler'});
            logDERP('C:('+aSpawn.name+') '+aCost+' aCarry = '+aCarry+' aMove = '+aMove+' result = '+ErrorSting(result));
            return;
        }
        else
        {
            logDERP('Lab hauler active ......');
        }
        if (aCreep.spawning) return;
        var myLabs = {
            L1:
            {
                ID: '58818f085a3563cc1e0fa69e',
                RESOURCE: LAB_RESOURCE_ONE,
            },
            L2:
            {
                ID: '588153d21bec6e884e231b4d',
                RESOURCE: LAB_RESOURCE_TWO,
            },
            L3:
            {
                ID: '5881c5320a412ee06f538cbd',
                REACTION: LAB_REACTION,
            },
        }

        var L1 = Game.getObjectById(myLabs['L1']['ID']);
        var L2 = Game.getObjectById(myLabs['L2']['ID']);
        var L3 = Game.getObjectById(myLabs['L3']['ID']);


        var delta_L1 = L1.mineralCapacity - L1.mineralAmount;
        var delta_L2 = L2.mineralCapacity - L2.mineralAmount;
        var delta_L3 = L3.mineralCapacity - L3.mineralAmount;

        var amount_R1 = _.isUndefined(aStorage.store[LAB_RESOURCE_ONE]) ? 0 : aStorage.store[LAB_RESOURCE_ONE];
        var amount_R2 = _.isUndefined(aStorage.store[LAB_RESOURCE_TWO]) ? 0 : aStorage.store[LAB_RESOURCE_TWO];

        logDERP(aRoomName+' dL1='+delta_L1+' dL2='+delta_L2+' dL3='+delta_L3);
        logDERP('STORE: '+LAB_RESOURCE_ONE+' - '+amount_R1+' '+LAB_RESOURCE_TWO+' - '+amount_R2);





        if (aCreep.ticksToLive < 20)
        {
            // renew or sucide and drop off carried resources
            logERROR(aRoomName+' EXPIRED LIFETIME - NOT IMPLEMENTED YET!');
            return;
        }

        if (amount_R1 == 0 || amount_R2 == 0)
        {
            // clear labs
            logERROR(aRoomName+' EMPTY STORAGE - NOT IMPLEMENTED YET!');
            return;
        }

        if (delta_L1 != L1.mineralCapacity && delta_L2 != L2.mineralCapacity )
        {
            var result = L3.runReaction(L1,L2);
            logDERP(aRoomName+' LAB REACTION: '+ErrorSting(result));
        }


        if (_.sum(aCreep.carry) == 0)
        {
            if (!aCreep.pos.isNearTo(aStorage))
            {
                aCreep.travelTo(aStorage);
            }

            var aL1_condition_01 = delta_L1 == L1.mineralCapacity;
            var aL1_condition_02 = delta_L1 > delta_L2;
            logDERP('L1 condition 01: '+aL1_condition_01+' 02: '+aL1_condition_02)

            if (aCreep.pos.isNearTo(L3))
            {
                aCreep.withdraw(L3,LAB_REACTION);
            }
            else if (delta_L1 >= delta_L2)
            {
                var aAmount = _.min([aCreep.carryCapacity,amount_R1,delta_L1])
                aCreep.withdraw(aStorage,LAB_RESOURCE_ONE,aAmount);
            }
            else if (delta_L2 > delta_L1)
            {
                var aAmount = _.min([aCreep.carryCapacity,amount_R2,delta_L2])
                aCreep.withdraw(aStorage,LAB_RESOURCE_TWO,aAmount)
            }
            else
            {
                // go and grab the reaction or go to idle pos
                logERROR(aRoomName+' GRAB REACTION or IDLE - NOT IMPLEMENTED YET!');
            }

        }
        else
        {
            var aType = _.findKey(aCreep.carry, (a) => a > 0);

            // move to or transfer
            if (aType == LAB_RESOURCE_ONE)
            {
                if (!aCreep.pos.isNearTo(L1))
                {
                    aCreep.travelTo(L1);
                }
                else
                {
                    aCreep.transfer(L1,LAB_RESOURCE_ONE);
                }
            }
            else if (aType == LAB_RESOURCE_TWO)
            {
                if (!aCreep.pos.isNearTo(L2))
                {
                    aCreep.travelTo(L2);
                }
                else
                {
                    aCreep.transfer(L2,LAB_RESOURCE_TWO);
                }
            }
            else if (aType == LAB_REACTION)
            {
                if (!aCreep.pos.isNearTo(aStorage))
                {
                    aCreep.travelTo(aStorage);
                }
                else
                {
                    aCreep.transfer(aStorage,LAB_REACTION);
                }

            }
        }
    }

    runLabs_E66N49()
    {
        var aRoomName = 'E66N49';
        var aCreep = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == 'lab hauler' })

        var aStorage = Game.rooms[aRoomName].storage;
        var aSpawn = Game.spawns['Casepool'];

        var LAB_RESOURCE_ONE = RESOURCE_HYDROGEN;
        var LAB_RESOURCE_TWO = RESOURCE_ZYNTHIUM;


        if (_.isUndefined(aCreep))
        {
            // 2200 = A * 75
            var aCarry = 1;
            var aMove = 1;

            var aC = new Array(aCarry).fill(CARRY);
            var aM = new Array(aMove).fill(MOVE);
            var aBody = aC.concat(aM);

            var aCost = aCarry * 50 + aMove * 50;

            var result = aSpawn.createCreep(aBody,'LH '+aRoomName,{role: 'lab hauler'});
            logDERP('C:('+aSpawn.name+') '+aCost+' aCarry = '+aCarry+' aMove = '+aMove+' result = '+ErrorSting(result));
            return;
        }
        else
        {
            logDERP('Lab hauler active ......');
        }
        if (aCreep.spawning) return;

        var aMovePos = new RoomPosition(40,6,'E66N49');

        if (!aCreep.pos.isEqualTo(aMovePos))
        {
            aCreep.moveTo(aMovePos);
        }

        var L1 = Game.getObjectById('5867921d862806344b052a98');
        var L2 = Game.getObjectById('584ddf9dc45664f473ab147a');
        var L3 = Game.getObjectById('58670e6d0c5eca9113b48bcb');

        if (_.sum(aCreep.carry) == 0)
        {
            if (aCreep.ticksToLive < 3) return; // don't grab anything befor dying


            if (!_.isUndefined(aStorage.store[LAB_RESOURCE_ONE]) && L1.mineralAmount < L2.mineralAmount)
            {
                var aDelta = _.min([L1.mineralCapacity - L1.mineralAmount,myLabHauler.carryCapacity]);
                logDERP('L1 DERP '+L1.mineralAmount)
                var result = aCreep.withdraw(aStorage,LAB_RESOURCE_ONE,aDelta)

                if (aDelta == 0)
                {
                    var result = aCreep.cancelOrder('withdraw');
                    logDERP('myLabHauler L1 withdraw - '+ErrorSting(result));
                }
            }
            else if (!_.isUndefined(aStorage.store[LAB_RESOURCE_TWO]) && L2.mineralAmount < L2.mineralCapacity)
            {
                var aDelta = _.min([L2.mineralCapacity - L2.mineralAmount,aCreep.carryCapacity]);
                logDERP('L2 DERP '+aDelta)
                aCreep.withdraw(aStorage,LAB_RESOURCE_TWO,aDelta) != OK
                if (aDelta == 0)
                {
                    var result = aCreep.cancelOrder('withdraw');
                    logDERP('myLabHauler L2 withdraw - '+ErrorSting(result));
                }
            }
            else
            {
                logDERP('Lab transfer IDLE ......');
                if (L3.mineralAmount > 0)
                {
                    aCreep.withdraw(L3,L3.mineralType);
                }
            }
        }
        else
        {
            if (!_.isUndefined(aCreep.carry[LAB_RESOURCE_TWO]))
            {
                aCreep.transfer(L2,LAB_RESOURCE_TWO) == ERR_NOT_IN_RANGE
            }
            else if (!_.isUndefined(aCreep.carry[LAB_RESOURCE_ONE]))
            {
                aCreep.transfer(L1,LAB_RESOURCE_ONE) == ERR_NOT_IN_RANGE
            }
            else
            {

                var aType = _.findKey(aCreep.carry, (a) => { return (a > 0); })

                var result = aCreep.transfer(aStorage,aType);
                logDERP('Lab hauler storage ('+aType+') - '+ErrorSting(result));
            }
        }


        // run lab reaction
        var result = L3.runReaction(L1,L2);
        logDERP('LAB REACTION: '+ErrorSting(result));

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
            logDERP('C('+this.ROLE_NAME+'):('+aSpawn.name+') '+aCost+' aCarry = '+aCarry+' aMove = '+aMove+' result = '+ErrorSting(result));
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


}
module.exports = ReactionsProduceOperation;
