var statsLogistics = require('stats.logistics');
var statsMaintainance = require('stats.maintainance');

var roleConstruction = {

    /** @param {Creep} creep **/
    run: function(creep)
    {
        if (creep.memory.isConstructing == true && creep.carry.energy == 0)
        {
            creep.memory.isConstructing = false;
        }
        if (creep.memory.isConstructing == false && creep.carry.energy == creep.carryCapacity)
        {
            creep.memory.isConstructing = true;
        }
        if (creep.memory.isConstructing == undefined)
        {
            creep.memory.isConstructing = false;
        }

	    if(creep.memory.isConstructing == false)
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
                }
            }
        }
        else
        {
            var myConstructionSite = statsMaintainance.getConstructionSite();

            if (myConstructionSite != undefined)
            {
                if (creep.build(myConstructionSite) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(myConstructionSite);
                    creep.say('ConSite..');
                }
            }
            else
            {
                // TODO: send them to do something usefull - maybe repair streets or just upgrade
                console.log('INFO: construction bots have nothing to do!');
            }
        }
	}
};

module.exports = roleConstruction;
