var mySpawnCenter = require('case.SpawnCenter');

var mod =
{
    extend: function()
    {
        Object.defineProperties(StructureSpawn.prototype,
        {
        });

        StructureSpawn.prototype.repairCreep = function(myCreeps)
        {
            var myRepairCreep = undefined;
            for (var aCreep of myCreeps)
            {
                // TODO: quickfix - upgraders depent on the current room state and should change there
                // configuration layout acordingly. until the spawn roles can not handle this the spawn will
                // not repair upgraders here
                var aCreepRole = aCreep.myRole;
                if (_.isUndefined(aCreepRole))
                {
                    logERROR('StructureSpawn - creep '+aCreep.name+' has no role - FIX THIS!');
                    continue;
                }

                if (aCreep.pos.isNearTo(this.pos) && (aCreep.getLiveRenewTicks() > 0))
                {
                    if (aCreepRole.myName == 'upgrader')
                    {
                        logDEBUG('SPAWN '+this.name+' refuse to repair '+aCreep.name+' because he is a upgrader!');
                        continue;
                    }

                    if (_.isUndefined(myRepairCreep) || (aCreep.getLiveRenewTicks() > myRepairCreep.getLiveRenewTicks()))
                    {
                        myRepairCreep = aCreep;
                    }
                }
            }

            if (!_.isUndefined(myRepairCreep))
            {
                var result = this.renewCreep(myRepairCreep);
                logDEBUG('SPAWN: repairs '+myRepairCreep.name+' for '+myRepairCreep.liveRenewTime+' .. '+ErrorSting(result));
            }
        };

        StructureSpawn.prototype.isEnergyNeeded = function()
        {
            return (this.energy < this.energyCapacity);
        };

        StructureSpawn.prototype.getEnergyNeeded = function()
        {
            return  this.energyCapacity - this.energy;
        };

        StructureSpawn.prototype.getTimeToAutofill = function()
        {
            var result = undefined;
            var deltaSpawnEnergy = this.energyCapacity-this.energy;
            if (deltaSpawnEnergy == 0)
            {
                result = 0;
            }
            else if (this.room.energyAvailable < ENERGY_REGEN_TIME)
            {
                result = ENERGY_REGEN_TIME - this.room.energyAvailable;
            }
            return result;
        };

        // for starters this is only callable by hand
        StructureSpawn.prototype.spawnPioneerClaimer = function()
        {
            var NEEDED_ENERGY = 650;
            if (this.room.energyAvailable < NEEDED_ENERGY) return;
            var filterCreep = _.filter(Game.creeps,(aCreep) => { return aCreep.memory.role == 'pioneer claimer'});
            //logERROR('FILTER CREEPS: '+JSON.stringify(filterCreep));


            if (filterCreep.length == 0)
            {
                var result = this.createCreep([CLAIM,MOVE],'Claimer',{role:  'pioneer claimer', travelTime: 0  });
                if (result == 'Claimer')
                {
                    Game.creeps[result].init();
                }
                else
                {
                    logWARN('something is fishy with pioneer claimer creation .. '+ErrorSting(result));
                }
            }
            else
            {
                //logDEBUG('room '+this.room.name+' has a miner .. '+filterCreep[0].name);
            }
        }

        StructureSpawn.prototype.spawnPioneerMiner = function()
        {
            var NEEDED_ENERGY = 1500;
            if (this.room.energyAvailable < NEEDED_ENERGY) return;
            var filterCreep = _.filter(Game.creeps,(aCreep) => { return aCreep.memory.role == 'pioneer miner'});

            var shouldSpawn = true;
            if (filterCreep.length > 0)
            {
                if (filterCreep.length == 1)
                {
                    var aCreep = filterCreep[0];
                    if (aCreep.spawning)
                    {
                        shouldSpawn = false;
                    }
                    else
                    {
                        if (_.isUndefined(aCreep.memory.travelTime))
                        {
                            aCreep.memory.travelTime = 0;
                        }
                        var travelTime = aCreep.memory.travelTime;
                        var liveTime = aCreep.ticksToLive - aCreep.spawnTime - travelTime;
                        logERROR(Game.time+' pioneer miner '+aCreep.name+' livetime '+liveTime);
                        if (liveTime > 0)
                        {
                            shouldSpawn = false;
                        }
                    }
                }
                else
                {
                    shouldSpawn = false;
                }
            }

            if (shouldSpawn)
            {
                //var result = this.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],undefined,{role:  'pioneer miner', travelTime: 0 });
                var result = this.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],undefined,{role:  'pioneer miner', travelTime: 0 });
                if (typeof result === 'string')
                {
                    Game.creeps[result].init();
                }
                else
                {
                    logWARN('something is fishy with pioneer miner creation .. '+ErrorSting(result));
                }
            }
        }

        StructureSpawn.prototype.init = function()
        {
            if (FUNCTION_CALLS_STRUCTURE_SPAWN)
            {
                logDEBUG('STRUCTURE_SPAWN: init - ['+this.pos.x+' '+this.pos.y+'] D: '+this.name);
            }
        };
    }
};
module.exports = mod;
