var mod =
{
    extend: function()
    {
        Object.defineProperties(StructureContainer.prototype,
        {
        });

        StructureContainer.prototype.getFillRatio = function()
        {
            return _.sum(this.store) * 100 / this.storeCapacity;
        };

        StructureContainer.prototype.getDeltaCapacity = function()
        {
            return this.storeCapacity - _.sum(this.store) ;
        };

        StructureContainer.prototype.hasMinerals = function()
        {

            var aStore = _.filter(_.keys(this.store), (aKey) => { return (aKey != RESOURCE_ENERGY); });

            // var aMineralStore = {};
            // _.forEach(aStore, (a) => { aMineralStore[a] = aBox.store[a]});
            // var aMineralCount = _.sum(aMineralStore);

            return aStore.length > 0;
        };

        StructureContainer.prototype.getStoredMineral = function()
        {

            var aStore = _.filter(_.keys(this.store), (aKey) => { return (aKey != RESOURCE_ENERGY); });

            var aMineralStore = {};
            _.forEach(aStore, (a) => { aMineralStore[a] = this.store[a]});

            var aType = maxCarryResourceType(aMineralStore);

            return { mineralKey: aType , mineralAmount: aMineralStore[aType] };
        };


        StructureContainer.prototype.isOUT = function()
        {
            var myRoomMiningSources = this.room.getRoomObjects(ROOM_OBJECT_TYPE.source);
            var myRoomExtractors = this.room.getRoomObjects(ROOM_OBJECT_TYPE.extractor);

            if (this.isIN()) return false;
            //logDERP(' --- OUT BOX --- ['+this.pos.x+' '+this.pos.y+']')
            var result = false;
            _.forEach(myRoomMiningSources, (aSource) =>
            {
                if (aSource.hasMiningBox)
                {
                    _.forEach(aSource.myMiningBoxes, (aBox) =>
                    {
                        if (aBox.pos.isEqualTo(this.pos))
                        {
                            result = true;
                        }
                    });
                }
            });
            _.forEach(myRoomExtractors, (aExtractor) =>
            {
                if (aExtractor.hasMiningBox)
                {
                    _.forEach(aExtractor.myMiningBoxes, (aBox) =>
                    {
                        if (aBox.pos.isEqualTo(this.pos))
                        {
                            result = true;
                        }
                    });
                }
            });

            return result;

        };

        StructureContainer.prototype.isIN = function()
        {
            var myRoomControllers = this.room.getRoomObjects(ROOM_OBJECT_TYPE.controller);
            var myRoomExtensionBays = this.room.myExtensionBays;

            var result = false;

            //logDERP(' --- IN BOX --- ['+this.pos.x+' '+this.pos.y+']')

            _.forEach(myRoomExtensionBays, (aBay) =>
            {
                if (aBay.pos.isEqualTo(this.pos))
                {
                    result = true;
                }
            });
            _.forEach(myRoomControllers, (aController) =>
            {
                if (aController.hasUpgraderBox)
                {
                    _.forEach(aController.myUpgraderBoxes, (aBox) =>
                    {
                        if (aBox.pos.isEqualTo(this.pos))
                        {
                            // TODO: oh boy this is horrible - find a less CPU intensive way to check this
                            if (_.sum(this.store) < 1000)
                            {
                                //logDERP(' --- (adjusted) IN BOX --- ['+this.pos.x+' '+this.pos.y+']')
                                result = true;
                            }
                            // var myRoomMiningSources = this.room.getRoomObjects(ROOM_OBJECT_TYPE.source);
                            //  var aWorkParts = _.max([1,_.ceil((15000 * myRoomMiningSources.length - this.room.myMaintenanceCost)/ 1500)]); // we maintain at least one workpart for the upgraders
                            //
                            // if (aWorkParts > 1)
                            // {
                            //     logDERP(' ---- IM A IN BOX --['+aWorkParts+']--  ['+this.pos.x+' '+this.pos.y+']')
                            //     result = true;
                            // }
                            // else
                            // {
                            //     logDERP(' ---- IM NOT A IN BOX ----  ['+this.pos.x+' '+this.pos.y+']')
                            // }
                        }
                    });
                }
            });
            return result;
        };


        StructureContainer.prototype.init = function()
        {
            delete this._isOutBox;

            if (FUNCTION_CALLS_STRUCTURE_CONTAINER)
            {
                logDEBUG('STRUCTURE_CONTAINER: init - ['+this.pos.x+' '+this.pos.y+'] D: '+this.ticksToDecay+' S: '+this.getStructureState().toFixed(1));
            }

            if (_.isUndefined(Memory.containerTest))
            {
                Memory.containerTest = {}
                Memory.containerTest[this.id] =
                {
                    time: Game.time,
                    lastEnergy: this.store[RESOURCE_ENERGY],
                    avg: 0
                }
            }

            if (_.isUndefined(Memory.containerTest[this.id]))
            {
                Memory.containerTest[this.id] =
                {
                    time: Game.time,
                    lastEnergy: _.sum(this.store),
                    avg: 0,
                }
            }
            var oldData = Memory.containerTest[this.id];
            var deltaTime = Game.time - oldData.time;
            var deltaEnergy = _.sum(this.store) - oldData.lastEnergy;

            if (deltaEnergy  != 0 || deltaTime > 20)
            {
                Memory.containerTest[this.id] =
                {
                    time: Game.time,
                    lastEnergy: _.sum(this.store),
                    avg: ((oldData.avg + (deltaEnergy/deltaTime))/2),
                }

                var aS = (Memory.containerTest[this.id].avg > 0) ? 'OUT' : ' IN';

                var aHeader = ['x','y','avg','dE','dT','state'];


                //Test.table()


                logDERP(aS +' ['+this.pos.x+' '+this.pos.y+'] avg: '+Memory.containerTest[this.id].avg.toFixed(2)+'\tdE: '+deltaEnergy+'\tdT:'+deltaTime+' ***');
            }
            else
            {
                var aS = (Memory.containerTest[this.id].avg > 0) ? 'OUT' : ' IN';
                logDERP(aS+' ['+this.pos.x+' '+this.pos.y+'] avg: '+Memory.containerTest[this.id].avg.toFixed(2)+'\tdE: '+deltaEnergy+'\tdT:'+deltaTime);

            }
        };


    }
};
module.exports = mod;
