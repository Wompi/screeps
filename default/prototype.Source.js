var mod =
{
    extend: function()
    {
        Object.defineProperties(Source.prototype,
        {
            'neededMiningDrills':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._neededMiningDrills) )
                    {
                        this._neededMiningDrills = this.energyCapacity / (HARVEST_POWER * ENERGY_REGEN_TIME);
                    }
                    return this._neededMiningDrills;
                }
            },
            'possibleMiningPositions':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._possibleMiningPositions) )
                    {
                        this._possibleMiningPositions = findAdjacentWalkablePositions(this.pos);
                    }
                    return this._possibleMiningPositions;
                }
            },
            'myMiningBoxes':
            {
                configurable: true,
                get: function ()
                {

                    if (_.isUndefined(this._myMiningBoxes))
                    {
                        var aBox = [];
                        var aRoom = this.room;
                        if (!_.isUndefined(aRoom))
                        {
                            var myRoomContainers = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.container);

                            aBox = _.filter(myRoomContainers,(a) => { return a.pos.isNearTo(this.pos)});
                        }
                        this._myMiningBoxes = aBox;
                    }
                    return this._myMiningBoxes;
                }
            },
            'hasMiningBox':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._hasMiningBox) )
                    {
                        this._hasMiningBox = (this.myMiningBoxes.length > 0);
                    }
                    return this._hasMiningBox;
                }
            },
            'hasMiner':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._hasMiner) )
                    {
                        this._hasMiner = this.myMiner;
                    }
                    return this._hasMiner;
                }

            },
            'mySpawn':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._mySpawn))
                    {
                        var myRoomSpawns = this.room.getRoomObjects(ROOM_OBJECT_TYPE.spawn);
                        var mySpawns = _.filter(myRoomSpawns, (a) =>
                        {
                            return a.pos.getRangeTo(this.pos) < 3;
                        });
                        this._mySpawn = mySpawns;
                    }
                    return this._mySpawn;
                }
            },
            'isCloseToSpawn':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._isCloseToSpawn))
                    {
                        this._isCloseToSpawn = (this.mySpawn.length > 0);
                    }
                    return this._isCloseToSpawn;
                }
            },

        });

        Source.prototype.getMiningBox = function()
        {
            var myRoomContainers = this.room.getRoomObjects(ROOM_OBJECT_TYPE.container);
            var aBox = _.filter(myRoomContainers,(aBox) => { return aBox.pos.isNearTo(this.pos)});
            return aBox[0];
        };

        Source.prototype.printStatus = function()
        {
            logDEBUG('Source: ['+this.pos.x+' '+this.pos.y+']');
            logDEBUG('\tWORK: '+this.neededMiningDrills);
            logDEBUG('\tSPOTS: '+this.possibleMiningPositions);
            logDEBUG('\tBOX: '+this.hasMiningBox);
            logDEBUG('\tCREEPS: '+this.hasMiner);
            logDEBUG('\tSPAWN: '+this.isCloseToSpawn);
        }

        Source.prototype.registerMiner = function(aCreep)
        {
            if (_.isUndefined(aCreep)) return;
            var myRole = new CREEP_ROLE['miner'].role('miner');
            if ( aCreep.myRole.myName != myRole.myName) return;
            this.myMiner = aCreep;
        }

        Source.prototype.init = function()
        {
            if (FUNCTION_CALLS_SOURCE)
            {
                logDEBUG('SOURCE: init - ['+this.pos.x+' '+this.pos.y+'] D: '+this.ticksToRegeneration+' E: '+this.energy);
            }
            delete this._myMiner;
            delete this._neededMiningDrills;
            delete this._possibleMiningPositions;
            delete this._hasMiningBox;
            delete this._myMiningBoxes;
            delete this._hasMiner;
            delete this._isCloseToSpawn;
            delete this._mySpawn;

            // if (this.ticksToRegeneration == 1 && (this.energy-10) > 0)
            // {
            //     if (_.isUndefined(this.room.memory.mySourceStats))
            //     {
            //         this.room.memory.mySourceStats = [];
            //     }
            //
            //     this.room.memory.mySourceStats.push(
            //     {
            //         id: this.id,
            //         rest: this.energy,
            //         time: Game.time,
            //     });
            // }
        };
    }
};
module.exports = mod;
