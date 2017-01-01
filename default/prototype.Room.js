var MemoryManger = require('case.MemoryManager');

var mod =
{
    extend: function()
    {
        Object.defineProperties(Room.prototype,
        {
            'myRoomObjects':
            {
                configurable: true,
                get: function ()
                {
                    if (!this._myRoomObjects)
                    {
                        this._myRoomObjects = {};
                    }
                    return this._myRoomObjects;
                }
            },
            'adjacentAccessibleRooms':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this.memory.adjacentAccessibleRooms) )
                    {
                        this.memory.adjacentAccessibleRooms = {};
                        var myAdjacentRooms = Game.map.describeExits(this.name);
                        for (var aID in myAdjacentRooms)
                        {
                            var name = myAdjacentRooms[aID];
                            this.memory.adjacentAccessibleRooms[name] =
                            {
                                direction: aID,
                                isRoomAvailable: Game.map.isRoomAvailable(name)
                            };
                        }
                    }
                    return this.memory.adjacentAccessibleRooms;
                }
            },
            'myInvaders':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._myInvaders) )
                    {
                        this._myInvaders = this.find(FIND_HOSTILE_CREEPS);
                        var invaderLoop = aInvader =>
                        {
                            aInvader.init();
                        };
                        _.forEach(this._myInvaders,invaderLoop);
                    }
                    return this._myInvaders;
                }
            },
            'hasInvaders':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._hasInvaders) )
                    {
                        this._hasInvaders = (this.myInvaders.length > 0);
                    }
                    return this._hasInvaders;
                }

            },
            'myWounded':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._myWounded) )
                    {
                        //var myRoomCreeps = this.getRoomObjects(ROOM_OBJECT_TYPE.creep);

                        var myRoomCreeps = this.find(FIND_MY_CREEPS);

                        this._myWounded = _.filter(myRoomCreeps,(aCreep) => { return (aCreep.hits < aCreep.hitsMax)});
                    }
                    return this._myWounded;
                }
            },
            'hasWounded':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._hasWounded) )
                    {
                        this._hasWounded = (this.myWounded.length > 0);
                    }
                    return this._hasWounded;
                }
            },
            'myExtensionBays':
            {
                configurable: true,
                get: function()
                {
                    if( _.isUndefined(this._myExtensionBays) )
                    {
                        this._myExtensionBays = [];
                        var myRoomContainers = this.getRoomObjects(ROOM_OBJECT_TYPE.container);
                        var myRoomExtensions = this.getRoomObjects(ROOM_OBJECT_TYPE.extension);

                        for (var aContainer of myRoomContainers)
                        {
                            var myExtensionsInRange = _.filter(myRoomExtensions,(a) =>
                            {
                                return a.pos.inRangeTo(aContainer,2);
                            });
                            //logDEBUG('IN RANGE : '+myExtensionsInRange.length +' BOX: ['+aContainer.pos.x+' '+aContainer.pos.y+']');

                            // TODO: find a better waytodecide if it is a extension bay
                            // problemis that other containers can be in range as well but dont fit the common pattern
                            if (myExtensionsInRange.length > 4)
                            {
                                this._myExtensionBays.push(aContainer);
                            }
                        }
                    }
                    return this._myExtensionBays;
                }

            },
            'myMaintenanceCost':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._myMaintenanceCost) )
                    {
                        this._myMaintenanceCost = this.calculateMaintenanceCost();
                    }
                    return this._myMaintenanceCost;
                }
            },
            'my':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._my) )
                    {
                        this._my = this.controller && this.controller.my;
                    }
                    return this._my;
                }
            }
        });

        Room.prototype.hasEmergencyState = function()
        {
            var myCreeps = this.getRoomObjects(ROOM_OBJECT_TYPE.creep);
            if (myCreeps.length > 0)
            {
                // TODO: check for the minimal configuration of creeps
            }

            return myCreeps.length == 0; //|| this.controller.level < 3;
        };

        // prototype ROOM functions
        Room.prototype.getClosestCreep = function(sourcePos,roleType)
        {
            var closestCreep = undefined;
            for (var aID in this.myCreeps)
            {
                var aCreep = this.myCreeps[aID];
                if (aCreep.carry.energy > 0)
                {
                    if (aCreep.pos.getRangeTo(closestCreep) < aCreep.pos.getRangeTo(sourcePos))
                    {
                        closestCreep = aCreep;
                    }
                }
            }
        };

        Room.prototype.getRoomObjects = function(aStructureType)
        {
            if (_.isUndefined(aStructureType)) return;
            var result = this.myRoomObjects[aStructureType];
            return ( result == undefined ? [] : result );
        }

        Room.prototype.registerRoomObject = function(pRoomObject, pRoomObjectType)
        {
            if (_.isUndefined(pRoomObject)) return;
            if (_.isUndefined(pRoomObjectType)) return;

            var value = this.myRoomObjects[pRoomObjectType];

            if (_.isUndefined(value))
            {
                this.myRoomObjects[pRoomObjectType] = [];
            }
            this.myRoomObjects[pRoomObjectType].push(pRoomObject);
            return this.myRoomObjects[pRoomObjectType];
        };

        Room.prototype.calculateMaintenanceCost = function()
        {
            var myRoomRoads = this.getRoomObjects(ROOM_OBJECT_TYPE.road);
            var myRoomContainers = this.getRoomObjects(ROOM_OBJECT_TYPE.container);
            var myRoomConstructionSites = this.getRoomObjects(ROOM_OBJECT_TYPE.constructionSite);
            var myRoomCreeps = this.getRoomObjects(ROOM_OBJECT_TYPE.creep);

            // TODO: thisis just the base cost for unused roads - the real value depens on the usage of the roads
            // - not sure if the difference is worth the effort though
            var aRoadsCost = 0;
            _.forEach(myRoomRoads, (a) =>
            {
                var type = Game.map.getTerrainAt(a.pos.x,a.pos.y,this.name);
                var baseCost = (ROAD_DECAY_AMOUNT / ROAD_DECAY_TIME);
                if (type == 'swamp') aRoadsCost += baseCost * CONSTRUCTION_COST_ROAD_SWAMP_RATIO;
                else aRoadsCost += baseCost;
            });

            // normal container costs that will add to the repair cost
            var aContainersCost = myRoomContainers.length * (CONTAINER_DECAY / CONTAINER_DECAY_TIME_OWNED);

            // TODO: claimer creeps have a different life time an so a different body cost - adjust this later
            // all current creeps and there cost - based on 1500 live time
            var aCreepsCost = 0
            var aCreepParts = 0
            _.forEach(myRoomCreeps, (aCreep) =>
            {
                var aCreepCost = _.sum(_.countBy(aCreep.body,'type'), (a,b) => { return BODYPART_COST[b]*a; });
                aCreepsCost += aCreepCost;
                aCreepParts = aCreepParts + aCreep.body.length;
            });


            // if we have construction sites add the costs to the maintenance costs
            var aConstructionsCost = _.sum(myRoomConstructionSites, (a) => { return a.getRemainingBuildCost(); });

            // TODO: this is a bit tricky and depends on some empirical knowlege
            // - for starters I maintain a certain amount of reserve in the storage and add the difference to the
            //   maintenance costs.
            // - maybe later this can be estimated on the state of the room needs (trading/hauling/war ...)
            var aStorageCost = _.isUndefined(this.storage) ? 0 : this.storage.neededEnergyReserve;

            // sumof the cost parts
            var aRepairTick = REPAIR_POWER;
            var aCostbase = CREEP_LIFE_TIME;
            var aRoadsRatio = aRoadsCost/aRepairTick;
            var aContainerRatio = aContainersCost/aRepairTick;
            var aCreepRatio = (aCreepsCost)/aCostbase;
            var aStorageRatio = aStorageCost/aCostbase;
            var aConstructionRatio = aConstructionsCost/aCostbase;

            var aTickCost = (aRoadsRatio + aContainerRatio + aCreepRatio + aStorageRatio + aConstructionRatio);

           if (DEBUG)
            {
                logDERP(' ----------  MAINTENANCE COSTS/tick -----------------------');
                logDERP('ROADS ['+myRoomRoads.length+']\tcost: '+aRoadsRatio.toFixed(2));
                logDERP('CONTAINER ['+myRoomContainers.length+']\tcost: '+aContainerRatio.toFixed(2));
                logDERP('CREEP ['+myRoomCreeps.length+']\tcost: '+aCreepRatio.toFixed(2));
                logDERP('CREEP ['+myRoomCreeps.length+']\tparts: '+aCreepParts);
                if (!_.isUndefined(this.storage)) logDERP('STORAGE [1]\tcost: '+aStorageRatio.toFixed(2));
                if (myRoomConstructionSites.length > 0) logDERP('CONSTRUCTION ['+myRoomConstructionSites.length+']\tcost: '+aConstructionRatio.toFixed(2));

                logDERP('ALL COST   tick = '+aTickCost.toFixed(2)+' base = '+(aTickCost*aCostbase.toFixed(2)));
            }
            return (aTickCost * aCostbase);
        }



        // Static ROOM functions
        Room.isMine = function(roomName)
        {
            let room = Game.rooms[roomName];
            return( room && room.controller && room.controller.my );
        };

        Room.prototype.init = function()
        {
            delete this._my;
            delete this._myInvaders;
            delete this._hasInvaders;
            delete this._myWounded;

            delete this._myExtensionBays;
            delete this._myRoomObjects;
            delete this._myMaintenanceCost;

            if (FUNCTION_CALLS_ROOM)
            {
                logDEBUG('ROOM: init - '+this.name+' E: ('+this.energyAvailable+'/'+this.energyCapacityAvailable+')');
            }
        };


        Room.RECYCLE_POSITIONS =
        {
            'E66N49':
            [
                {   x: 42,  y: 41,  },
            ],
            'E65N49':
            [
                {   x: 16,  y: 9,   },
            ],
            'E66N48':
            [
                {   x: 37,  y: 24,   },
            ],
            'E64N49':
            [
                {   x: 24,  y: 22, },
            ],
        };

        Room.IDLE_POSITIONS =
        {
            'E66N49':
            [
                {   x: 43,  y: 43,  },
            ],
            'E65N49':
            [
                {   x: 27,  y: 24,   },
            ],
            'E66N48':
            [
                {   x: 33,  y: 26,   },
            ],
            'E64N49':
            [
                {   x: 26,  y: 19, },
            ],

        };

        Room.FIXER_GRAPH =
        {
            'E66N49':
            [
                {   x: 33,  y: 24,  next: 1,    },
                {   x: 9,   y: 45,  next: 2,    },
                {   x: 4,   y: 36,  next: 3,    },
                {   x: 12,  y: 38,  next: 4,    },
                {   x: 44,  y: 39,  next: 0,    },
            ],
            'E65N49':
            [
                {   x: 44,  y: 25,  next: 1,    },
                {   x: 22,  y: 20,  next: 2,    },
                {   x: 28,  y: 45,  next: 3,    },
                {   x: 31,  y: 27,  next: 4,    },
                {   x: 45,  y: 36,  next: 5,    },
                {   x:  4,  y: 11,  next: 0,    },
            ],
            'E66N48':
            [
                {   x: 13,  y:  4,  next: 1,    },
                {   x: 44,  y: 25,  next: 2,    },
                {   x: 42,  y: 40,  next: 3,    },
                {   x: 32,  y: 43,  next: 4,    },
                {   x: 30,  y: 42,  next: 5,    },
                {   x: 37,  y: 40,  next: 0,    },
            ],
            'E64N49':
            [
                {   x:  5,  y:  6,  next: 1,    },
                {   x: 48,  y: 11,  next: 2,    },
                {   x: 32,  y: 27,  next: 0,    },
            ],

        };
    }
};
module.exports = mod;
