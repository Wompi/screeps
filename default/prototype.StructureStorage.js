var mod =
{
    extend: function()
    {
        Object.defineProperties(StructureStorage.prototype,
        {
            'neededEnergyReserve':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._neededEnergyReserve))
                    {
                        this._neededEnergyReserve = _.max([0,STORAGE_MAINTENANCE_RESERVE_LIMIT - this.store[RESOURCE_ENERGY]]);
                    }
                    return this._neededEnergyReserve
                }
            }
        });

        StructureStorage.prototype.init = function()
        {
            delete this._neededEnergyReserve;

            if (FUNCTION_CALLS_STRUCTURE_STORAGE)
            {
                logDEBUG('STRUCTURE STORAGE: init - ['+this.pos.x+' '+this.pos.y+'] E: '+JSON.stringify(this.store));
            }
        };
    }
};
module.exports = mod;
