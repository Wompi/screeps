var mod =
{
    extend: function()
    {
        Object.defineProperties(StructureLink.prototype,
        {
            'store':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._store) )
                    {
                        var aCap = this.energy == 0 ? 0 : (this.energyCapacity*0.80);

                        this._store = { [RESOURCE_ENERGY]:aCap};
                    }
                    return this._store;
                }
            },
            'storeCapacity':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._storeCapacity) )
                    {
                        this._storeCapacity = this.energyCapacity;
                    }
                    return this._storeCapacity;
                }
            },
        });

        StructureLink.prototype.registerHauler = function(aCreep)
        {
            if (_.isUndefined(aCreep)) return;

            logDERP('aCreep = '+JSON.stringify(aCreep))
            if ( aCreep.memory.role != 'supplier') return;
            this.myHauler = aCreep;
        }

        StructureLink.prototype.isEnergyNeeded = function()
        {
            return (this.energy < this.energyCapacity)
        };

        StructureLink.prototype.isProvider = function()
        {
            var mySources = this.room.getRoomObjects(ROOM_OBJECT_TYPE.source);

            var iSources = _.filter(mySources, (aSource) =>
            {
               return aSource.pos.inRangeTo(this.pos,2);
            });
            return iSources.length > 0;
        };

        StructureLink.prototype.isReceiver = function()
        {
            return !this.isProvider();
        };

        StructureLink.prototype.getEnergyNeeded = function()
        {
            return  this.energyCapacity - this.energy;
        };

        StructureLink.prototype.init = function()
        {
            delete this._store;
            delete this._storeCapacity;

            if (FUNCTION_CALLS_STRUCTURE_LINK)
            {
                logDEBUG('LINK: init - ['+this.pos.x+' '+this.pos.y+'] E: '+this.energy+' C: '+this.cooldown);
            }
        };
    }
};
module.exports = mod;
