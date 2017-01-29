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
            },
            'energy':
            {
                configurable: true,
                get: function ()
                {
                    if (!this._energy)
                    {
                        this._energy = this.store[RESOURCE_ENERGY];
                    }
                    return this._energy;
                }
            },
        });


        // this one splits the minerals from the energy
        // the result can be used as normal storage .. so _.sum(res);
        StructureStorage.prototype.getMineralStore = function()
        {
            var aStore = _.clone(this.store);
            delete aStore['energy'];
            return aStore;
        }


        StructureStorage.prototype.hasMinerals = function()
        {

            var aStore = _.filter(_.keys(this.store), (aKey) => { return (aKey != RESOURCE_ENERGY); });

            // var aMineralStore = {};
            // _.forEach(aStore, (a) => { aMineralStore[a] = aBox.store[a]});
            // var aMineralCount = _.sum(aMineralStore);

            return aStore.length > 0;
        };


        StructureStorage.prototype.getStoredMineral = function()
        {

            var aStore = _.filter(_.keys(this.store), (aKey) => { return (aKey != RESOURCE_ENERGY); });

            var aMineralStore = {};
            _.forEach(aStore, (a) => { aMineralStore[a] = this.store[a]});

            var aType = maxCarryResourceType(aMineralStore);

            return { mineralKey: aType , mineralAmount: aMineralStore[aType] };
        };

        StructureStorage.prototype.init = function()
        {
            delete this._neededEnergyReserve;
            delete this._energy;

            if (FUNCTION_CALLS_STRUCTURE_STORAGE)
            {
                logDEBUG('STRUCTURE STORAGE: init - ['+this.pos.x+' '+this.pos.y+'] E: '+JSON.stringify(this.store));
            }
        };
    }
};
module.exports = mod;
