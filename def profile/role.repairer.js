var statsMaintainance = require('stats.maintainance');
var statsLogistics = require('stats.logistics');

var roleRepairer =
{
    run: function(creep)
    {
        if (creep.memory.isRepairing == true && creep.carry.energy == 0)
        {
            creep.memory.isRepairing = false;
        }
        if (creep.memory.isRepairing == false && creep.carry.energy == creep.carryCapacity)
        {
            creep.memory.isRepairing = true;
        }
        if (creep.memory.isRepairing == undefined)
        {
            creep.memory.isRepairing = false;
        }

        if(creep.memory.isRepairing == false)
        {
            var grabBox = statsLogistics.getClosestEnergyBox(creep);
            if (grabBox != undefined)
            {
                if(creep.withdraw(grabBox,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(grabBox);
                    creep.say('Grabbox..');
                }
            }
            else
            {
                var sources = creep.room.find(FIND_SOURCES);
                if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(sources[0]);
                    //creep.say('Move to Harvest...');
                }
            }
        }
        else
        {
            var itemToFix = undefined;
            var boxToFix = statsMaintainance.getContainersToFix();
            if (boxToFix != undefined)
            {
                itemToFix = boxToFix;
            }
            else
            {
                var roadToFix = statsMaintainance.getRoadToFix();

                itemToFix = roadToFix;
            }

            if (itemToFix != undefined)
            {
                if(creep.repair(itemToFix) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(itemToFix);
                    creep.say('Repair..');
                }
                else
                {
                    creep.say('Repairing!');
                }
            }
            else
            {
                // TODO: hmm not sure if this can happen .. only if we have no streets after a blackout?
                console.log('INFO: repairer has nothing to do!');
            }
        }
    }
};

module.exports = roleRepairer;
