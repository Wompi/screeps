var mySpawnCenter = require('case.SpawnCenter');

var mod =
{
    extend: function()
    {
        Object.defineProperties(StructureSpawn.prototype,
        {
        });

        StructureSpawn.prototype.getSpawnPos = function()
        {
            //console.log('Prototype: ['+sourcePos.x+' '+sourcePos.y+']');
            var dXY = [                         // direction
                        [  0, -1 ],             // 1
                        [  1, -1 ],             // 2
                        [  1,  0 ],             // 3
                        [  1,  1 ],             // 4
                        [  0,  1 ],             // 5
                        [ -1,  1 ],             // 6
                        [ -1,  0 ],             // 7
                        [ -1, -1 ],             // 8
                      ];
            var result = undefined;
            for ( var aPos of dXY)
            {
                var x = this.pos.x + aPos[0];
                var y = this.pos.y + aPos[1];

                var aLook = this.room.lookAt(x,y);

                var aObstacle = _.filter(aLook, (a) =>
                {
                    var aType = undefined;
                    if (a.type == 'structure')
                    {
                        aType = a.structure.structureType;
                    }
                    else if (a.type == 'terrain')
                    {
                        aType = a.terrain;
                    }
                    else if (a.type == 'creep')
                    {
                        aType = a.type;
                    }
                    else
                    {
                        aType = a.type;
                    }

                    //logDERP(' includes: '+aType+' '+_.includes(OBSTACLE_OBJECT_TYPES,aType));
                    return _.includes(OBSTACLE_OBJECT_TYPES,aType);
                });

                if (aObstacle.length == 0)
                {
                    //logDERP(this.name+' '+x+' '+y+' count: '+aLook.length);
                    result = new RoomPosition(x,y,this.room.name);
                    break;
                }
            }
            return result;
        };

        StructureSpawn.prototype.repairCreep = function(myCreeps)
        {
            var myRepairCreep = undefined;
            for (var aCreep of myCreeps)
            {
                // TODO: quickfix - upgraders depent on the current room state and should change there
                // configuration layout acordingly. until the spawn roles can not handle this the spawn will
                // not repair upgraders here


                if (aCreep.pos.isNearTo(this.pos) && (aCreep.getLiveRenewTicks() > 0))
                {
                    if (_.any(aCreep.body, i => !!i.boost))
                    {
                        logDEBUG('SPAWN '+this.name+' refuse to repair '+aCreep.name+' because he is boosted!');
                        continue;
                    }

                    var aCreepRole = aCreep.myRole;
                    if (_.isUndefined(aCreepRole))
                    {
                        logERROR('StructureSpawn - creep '+aCreep.name+' has no role - FIX THIS!');
                        //continue;
                    }
                    else if (aCreepRole.myName == 'upgrader')
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
