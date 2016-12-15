var statsLogistics = require('stats.logistics');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep)
    {
        if (creep.memory.isUpgrading == true && creep.carry.energy == 0)
        {
            //console.log('Harvesting = ' + creep.name);
            creep.memory.isUpgrading = false;
        }
        if (creep.memory.isUpgrading == false && creep.carry.energy == creep.carryCapacity)
        {
            //console.log('Upgrading = ' + creep.name);
            creep.memory.isUpgrading = true;
        }
        if (creep.memory.isUpgrading == undefined)
        {
            //console.log('Undefinded = ' + creep.name);
            creep.memory.isUpgrading = false;
        }

	    if(creep.memory.isUpgrading == false)
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
            if (Game.spawns['Casepool'].energy < Game.spawns['Casepool'].energyCapacity)
            {
                if(creep.transfer(Game.spawns['Casepool'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(Game.spawns['Casepool']);
                    creep.say('Spawn..');
                }
            }
            else if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
                creep.say('Upgrade..');
            }
            else
            {
                creep.say('Upgrading!™');
            }
        }
	}
};

module.exports = roleUpgrader;
