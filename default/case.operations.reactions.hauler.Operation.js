class ReactionsHaulerOperation
{
    constructor()
    {

    }

    processOperation()
    {
        this.processE65N49_UH();
    }

    processE65N49_UH()
    {
        var myBoostHauler = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == 'uh boost hauler' })
        var aStorage = Game.rooms['E65N49'].storage;
        var aSpawn = Game.spawns['Nexus Outpost'];
        var L1_boost = Game.getObjectById('5877ecd15dc3eff517f28f15');

        var LAB_REACTION = RESOURCE_UTRIUM_HYDRIDE;

        if ((_.isUndefined(aStorage.store[LAB_REACTION]) || L1_boost.mineralAmount == L1_boost.mineralCapacity) && !_.isUndefined(myBoostHauler) && _.sum(myBoostHauler.carry) == 0)
        {
            logDERP('No UtriumHydride in storage ...');
            if (!_.isUndefined(myBoostHauler))
            {
                myBoostHauler.suicide();
            }
            return;
        }

        if (_.isUndefined(myBoostHauler))
        {
            // 2200 = A * 75
            var aCarry = 1;
            var aMove = 1;

            var aC = new Array(aCarry).fill(CARRY);
            var aM = new Array(aMove).fill(MOVE);
            var aBody = aC.concat(aM);

            var aCost = aCarry * 50 + aMove * 50;

            var result = aSpawn.createCreep(aBody,'UH Boost Hauler',{role: 'uh boost hauler'});
            logDERP('C(UH boost hauler):('+aSpawn.name+') '+aCost+' aCarry = '+aCarry+' aMove = '+aMove+' result = '+ErrorSting(result));
            return;
        }
        else
        {
            logDERP('UH boost hauler active ......');
        }
        if (myBoostHauler.spawning) return;


        if (_.sum(myBoostHauler.carry) == 0)
        {
            if (myBoostHauler.ticksToLive < 50) return; // don't grab anything befor dying

            var aDelta = L1_boost.mineralCapacity - L1_boost.mineralAmount;
            if (myBoostHauler.withdraw(aStorage,LAB_REACTION,_.min([aDelta,myBoostHauler.carryCapacity])) == ERR_NOT_IN_RANGE)
            {
                myBoostHauler.moveTo(aStorage,{ignoreCreeps: true});
            }
        }
        else
        {
            if (myBoostHauler.transfer(L1_boost,LAB_REACTION) == ERR_NOT_IN_RANGE)
            {
                myBoostHauler.moveTo(L1_boost,{ignoreCreeps: true});
            }
        }
    }

    processE65N49_UO()
    {
        var myBoostHauler = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == 'uo boost hauler' })
        var aTerminal = Game.rooms['E65N49'].terminal;
        var aSpawn = Game.spawns['Nexus Outpost'];
        var L1_boost = Game.getObjectById('586c4b1463d011e1364344ae');

        if (_.isUndefined(aTerminal.store[RESOURCE_UTRIUM_OXIDE]) && L1_boost.mineralAmount == L1_boost.mineralCapacity && !_.isUndefined(myBoostHauler) && _.sum(myBoostHauler.carry) == 0)
        {
            logDERP('No UtriumOxyde in terminal ...');
            if (!_.isUndefined(myBoostHauler))
            {
                myBoostHauler.suicide();
            }
            return;
        }

        if (_.isUndefined(myBoostHauler))
        {
            // 2200 = A * 75
            var aCarry = 1;
            var aMove = 1;

            var aC = new Array(aCarry).fill(CARRY);
            var aM = new Array(aMove).fill(MOVE);
            aBody = aC.concat(aM);

            var aCost = aCarry * 50 + aMove * 50;

            var result = aSpawn.createCreep(aBody,'UO Boost Hauler',{role: 'uo boost hauler'});
            logDERP('C:('+aSpawn.name+') '+aCost+' aCarry = '+aCarry+' aMove = '+aMove+' result = '+ErrorSting(result));
            return;
        }
        else
        {
            logDERP('UO boost hauler active ......');
        }
        if (myBoostHauler.spawning) return;

        if (_.sum(myBoostHauler.carry) == 0)
        {
            if (myBoostHauler.ticksToLive < 10) return; // don't grab anything befor dying

            var aDelta = L1_boost.mineralCapacity - L1_boost.mineralAmount;
            if (myBoostHauler.withdraw(aTerminal,RESOURCE_UTRIUM_OXIDE,_.min([aDelta,myBoostHauler.carryCapacity])) == ERR_NOT_IN_RANGE)
            {
                myBoostHauler.moveTo(aTerminal);
            }
        }
        else
        {
            if (myBoostHauler.transfer(L1_boost,RESOURCE_UTRIUM_OXIDE) == ERR_NOT_IN_RANGE)
            {
                myBoostHauler.moveTo(L1_boost);
            }
        }
    }
}
module.exports = ReactionsHaulerOperation;
