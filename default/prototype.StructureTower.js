var mod =
{
    extend: function()
    {
        Object.defineProperties(StructureTower.prototype,
        {
            'myRepairStructures':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._myRepairStructures) )
                    {
                        this._myRepairStructures = [];
                    }
                    return this._myRepairStructures;
                }
            },
        });

        StructureTower.prototype.attackInvader = function()
        {
            if (this.room.hasInvaders)
            {
                var invaderCreeps = this.room.myInvaders;
                var result = this.attack(invaderCreeps[0]);

                if (_.isUndefined(this.room.memory.invaders))
                {
                    this.room.memory.invaders = {};
                }
                this.room.memory.invaders[Game.time] = JSON.stringify(invaderCreeps[0]);
                logWARN('ATTACK: '+ErrorSting(result));
            }
        };

        StructureTower.prototype.healWounded = function()
        {
            if (this.room.hasWounded)
            {
                var woundedCreeps = this.room.myWounded;
                var result = this.heal(woundedCreeps[0]);
                logWARN('TOWER HEALS: '+woundedCreeps[0].name+' '+ErrorSting(result));
            }
        };

        StructureTower.prototype.getEnergyState = function()
        {
            return (this.energy * 100 / this.energyCapacity);
        };

        StructureTower.prototype.repairStructure = function()
        {
            if (this.myRepairStructures.length == 0) return;
            if (this.energy < TOWER_ENERGY_COST)
            {
                logWARN('TOWER: has not enough energy for repair!');
                return;
            }

            var maxRepairObject = undefined;
            for (var aID of this.myRepairStructures)
            {
                var aFix = Game.getObjectById(aID)
                if (_.isNull(aFix))
                {
                    logERROR('TOWER: a registered repair structure is inconsistent!');
                    continue;
                }
                var newFixState = aFix.hits * 100 / aFix.hitsMax;

                // we only emergency repair with the towers
                if (newFixState < 10)
                {
                    maxRepairObject = aFix;
                }
            }

            if (!_.isUndefined(maxRepairObject))
            {
                var delta = maxRepairObject.hitsMax - maxRepairObject.hits;
                var dist = this.pos.getRangeTo(maxRepairObject.pos);
                var amount = StructureTower.calculateTowerEffectiveness(dist,TOWER_POWER_REPAIR);
                logDERP('TOWER['+this.pos.x+' '+this.pos.y+']: repairs '+maxRepairObject.structureType+' at ['+maxRepairObject.pos.x+' '+maxRepairObject.pos.y+
                '] dist: '+dist+' amount: '+amount+' delta: '+delta);
                if (delta >= amount)
                {
                    var result = this.repair(maxRepairObject);
                    logDEBUG('TOWER emergency repairs structure at ['+maxRepairObject.pos.x+' '+maxRepairObject.pos.y+'] .. '+ErrorSting(result));

                    // if (_.isUndefined(this.room.memory.myRepairStats))
                    // {
                    //     this.room.memory.myRepairStats = [];
                    // }
                    // this.room.memory.myRepairStats.push(
                    // {
                    //     time: Game.time,
                    //     tower: this.id,
                    //     x: maxRepairObject.pos.x,
                    //     y: maxRepairObject.pos.y,
                    //     sturctureType: maxRepairObject.structureType,
                    //     repair: amount,
                    // });
                }
            }
        };


        StructureTower.calculateTowerEffectiveness = function(range, valueClose)
        {
            var d_far = valueClose * (1 - TOWER_FALLOFF);
            var d_close = valueClose;
            var r_far = TOWER_FALLOFF_RANGE;
            var r_close = TOWER_OPTIMAL_RANGE;

            var result = _.max([ d_far , _.min( [d_close,((d_far - d_close)/(r_far-r_close))*(range-r_close)+d_close])]);
            //console.log('REPAIR: '+result);
            return result;


// this should be better but check it out first - and make it applyable to all tower stuff
  //         getTowerRepairAmount(range) {
  //                if (range <= TOWER_OPTIMAL_RANGE)
  //                    return TOWER_POWER_REPAIR;
  //            else if (range >= TOWER_FALLOFF_RANGE)
  //            range = TOWER_FALLOFF_RANGE;
  //
  //            return TOWER_POWER_REPAIR - ((range - 5) * 40);
  //            },
        };

        StructureTower.registerRepairStructures = function(pRoom)
        {
            if (_.isUndefined(pRoom)) return;

            var myRoomRoads = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.road);
            var myRoomContainers = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.container);
            var myRoomTowers = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.tower);
            var myFixables = myRoomRoads.concat(myRoomContainers);

            if (myRoomTowers.length == 0 ) return;
            if (myFixables.length == 0 ) return;

            _.forEach(myFixables,(aFix) =>
            {
                var minDistTower = _.min(myRoomTowers, (aTower) => { return aTower.pos.getRangeTo(aFix);});
                minDistTower.myRepairStructures.push(aFix.id);
            });
        }

        StructureTower.prototype.init = function()
        {
            if (FUNCTION_CALLS_STRUCTURE_TOWER)
            {
                logDEBUG('STRUCTURE_TOWER: init - ['+this.pos.x+' '+this.pos.y+'] D: '+JSON.stringify(this.owner));
            }
            delete this._myRepairStructures;
        };
    }
};
module.exports = mod;
