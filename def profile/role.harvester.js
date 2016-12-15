var subConstruct = require('role.construction');
var statsLogistics = require('stats.logistics');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep)
    {
        if (creep.memory.isHarvesting == true && creep.carry.energy == 0)
        {
            creep.memory.isHarvesting = false;
        }
        if (creep.memory.isHarvesting == false && creep.carry.energy == creep.carryCapacity)
        {
            creep.memory.isHarvesting = true;
        }
        if (creep.memory.isHarvesting == undefined)
        {
            creep.memory.isHarvesting = false;
        }

	    if(creep.memory.isHarvesting == false)
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
            var myClosestExtension = statsLogistics.getExtentionCloseTo(creep);
            if(myClosestExtension != undefined)
            {
                if(creep.transfer(myClosestExtension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(myClosestExtension);
                    creep.say('Extension..');
                }
            }
            else if (Game.spawns['Casepool'].energy < Game.spawns['Casepool'].energyCapacity)
            {
                if(creep.transfer(Game.spawns['Casepool'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(Game.spawns['Casepool']);
                    creep.say('Spawn..');
                }
            }
            else
            {
                subConstruct.run(creep);
            }
        }
	}
};

module.exports = roleHarvester;
