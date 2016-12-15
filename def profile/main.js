const profiler = require('screeps-profiler');


profiler.enable();
module.exports.loop = function()
{
    profiler.wrap(function()
    {
        var roleUpgrader = require('role.upgrader');
        var roleHarvester = require('role.harvester');
        var roleConstruction = require('role.construction');
        var roleSpawner = require('role.spawner');
        var roleMole = require('role.mole');
        var roleRepairer = require('role.repairer');
        var roleHauler = require('role.hauler');

        // general test stuff
        var statsLogistics = require('stats.logistics');

        // clear memory
        for(var name in Memory.creeps)
        {
            if (Game.creeps[name] == undefined)
            {
                delete Memory.creeps[name];
            }
        }

        // send creep to harvest or upgrade
        for(var name in Game.creeps)
        {
            var creep = Game.creeps[name];
            if(creep.memory.role == 'hauler')
            {
                roleHauler.run(creep);
            }
            else if(creep.memory.role == 'repairer')
            {
                roleRepairer.run(creep);
            }
            else if(creep.memory.role == 'mole')
            {
                roleMole.run(creep);
            }
            else if(creep.memory.role == 'upgrader')
            {
                //console.log('Name: ' + name + ' isUpgrading: ' + creep.memory.isUpgrading);
                roleUpgrader.run(creep);
            }
            else if(creep.memory.role == 'harvester')
            {
                //console.log('Name: ' + name + ' isHarvesting: ' + creep.memory.isHarvesting);
                roleHarvester.run(creep);
            }
            else if(creep.memory.role == 'construction')
            {
                roleConstruction.run(creep);
            }
        }

        //console.log(roleSpawner.checkSpawn());
        roleSpawner.spawn();

        // lets test some stuff
        //statsLogistics.getCreepEnergy();
        statsLogistics.getScatterEnergy();
        //  statsLogistics.getExtensionEnergy();
    });
}
