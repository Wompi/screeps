var roleSpawn = {
    checkSpawn: function()
    {
        var result = !(Game.spawns['Casepool'].energy < Game.spawns['Casepool'].energyCapacity);
        return result;
    },

    spawn: function()
    {
        // auto spawn upgrader
        var MIN_UPGRADER_COUNT = 2;
        var MIN_HARVESTER_COUNT = 2;
        var MIN_CONSTRUCTION_COUNT = 1;
        var MIN_MOLE_COUNT = 1;
        var MIN_REPAIRER_COUNT = 1;
        var MIN_HAULER_COUNT = 2;
        var myConstructionCount = _.sum(Game.creeps, (c) => c.memory.role == 'construction');
        var myUpgraderCount = _.sum(Game.creeps, (c) => c.memory.role == 'upgrader');
        var myHarvesterCount = _.sum(Game.creeps, (c) => c.memory.role == 'harvester');
        var myMoleCount = _.sum(Game.creeps, (c) => c.memory.role == 'mole');
        var myRepairerCount = _.sum(Game.creeps, (c) => c.memory.role == 'repairer');
        var myHaulerCount = _.sum(Game.creeps, (c) => c.memory.role == 'hauler');

        if (Game.spawns['Casepool'].energy == 300)
        {
            if(myMoleCount < MIN_MOLE_COUNT)
            {
                if (Game.rooms.E66N49.energyAvailable == Game.rooms.E66N49.energyCapacityAvailable)
                {
                    var name = Game.spawns['Casepool'].createCreep([WORK,WORK,WORK,WORK,WORK,MOVE],'Mole',{role:'mole'});
                    console.log('Try to spawn a BIG new mole .. ' + name);
                }
                else
                {
                     var name = Game.spawns['Casepool'].createCreep([WORK,WORK,MOVE,MOVE],'Mole',{role:'mole'});
                     console.log('Try to spawn a new mole .. ' + name);
                }
            }
            else if (myConstructionCount < MIN_CONSTRUCTION_COUNT)
            {
                if (Game.rooms.E66N49.energyAvailable == Game.rooms.E66N49.energyCapacityAvailable)
                {
                    var name = Game.spawns['Casepool'].createCreep([WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE],undefined,{role:'construction',isConstructing:false});
                    console.log('Try to spawn a BIG new constructor .. ' + name);
                }
                else
                {
                     var name = Game.spawns['Casepool'].createCreep([WORK,CARRY,CARRY,CARRY,MOVE],undefined,{role:'construction',isConstructing:false});
                     console.log('Try to spawn a new constructor .. ' + name);

                }
            }
            else if (myHaulerCount < MIN_HAULER_COUNT)
            {
                if (Game.rooms.E66N49.energyAvailable == Game.rooms.E66N49.energyCapacityAvailable)
                {
                    var name = Game.spawns['Casepool'].createCreep([CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE],undefined,{role:'hauler',isHauling:false});
                    console.log('Try to spawn a BIG new hauler .. ' + name);
                }
                else
                {
                     var name = Game.spawns['Casepool'].createCreep([CARRY,MOVE,CARRY,CARRY,CARRY,MOVE],undefined,{role:'hauler',isHauling:false});
                     console.log('Try to spawn a new hauler .. ' + name);
                }
            }
            else if (myHarvesterCount < MIN_HARVESTER_COUNT)
            {
                if (Game.rooms.E66N49.energyAvailable == Game.rooms.E66N49.energyCapacityAvailable)
                {
                    var name = Game.spawns['Casepool'].createCreep([WORK,WORK,CARRY,CARRY,CARRY,MOVE,CARRY,MOVE,MOVE],undefined,{role:'harvester',isHarvesting:false});
                    console.log('Try to spawn a BIG new harvester .. ' + name);
                }
                else
                {
                    var name = Game.spawns['Casepool'].createCreep([WORK,WORK,CARRY,MOVE],undefined,{role:'harvester',isHarvesting:false});
                    console.log('Try to spawn a new harvester .. ' + name);
                }
            }
            else if (myRepairerCount < MIN_REPAIRER_COUNT)
            {
                if (Game.rooms.E66N49.energyAvailable == Game.rooms.E66N49.energyCapacityAvailable)
                {
                    var name = Game.spawns['Casepool'].createCreep([WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE],'Fixer',{role:'repairer',isRepairing:false});
                    console.log('Try to spawn a BIG new repairer .. ' + name);
                }
                else
                {
                    var name = Game.spawns['Casepool'].createCreep([WORK,CARRY,MOVE,CARRY,MOVE],'Fixer',{role:'harvester',isRepairing:false});
                    console.log('Try to spawn a new repairer .. ' + name);
                }

            }
            else if (myUpgraderCount < MIN_UPGRADER_COUNT)
            {
                if (Game.rooms.E66N49.energyAvailable == Game.rooms.E66N49.energyCapacityAvailable)
                {
                    var name = Game.spawns['Casepool'].createCreep([WORK,WORK,WORK,MOVE,MOVE,CARRY,MOVE,MOVE],undefined,{role:'upgrader',isUpgrading:false});
                    console.log('Try to spawn a BIG new upgrader .. ' + name);
                }
                else
                {
                    var name = Game.spawns['Casepool'].createCreep([WORK,CARRY,CARRY,MOVE,MOVE],undefined,{role:'upgrader',isUpgrading:false});
                    console.log('Try to spawn a new upgrader .. ' + name);
                }
            }
        }
	}
};

module.exports = roleSpawn;
