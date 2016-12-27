var mod =
{
    extend: function()
    {
        Object.defineProperties(StructureTerminal.prototype,
        {
        });

        StructureTerminal.prototype.needResources = function()
        {
            var result = false;
            _.forEach(StructureTerminal.LAB_STOCK, (aValue, aKey) =>
            {
                var storeValue = this.store[aKey];
                if (_.isUndefined(storeValue))
                {
                    result = true;
                }
                else if (aValue > storeValue )
                {
                    result = true;
                }
            });
            return result;
        }

        // this one splits the minerals from the energy
        // the result can be used as normal storage .. so _.sum(res);
        StructureTerminal.prototype.getMineralStore = function()
        {
            var aStore = _.clone(this.store);
            delete aStore['energy'];
            return aStore;
        }

        StructureTerminal.prototype.getNeededResources = function()
        {
            var result = {};
            _.forEach(StructureTerminal.LAB_STOCK, (aValue, aKey) =>
            {
                var storeValue = this.store[aKey];
                if (_.isUndefined(storeValue))
                {
                    result[aKey] = aValue;

                }
                else if (aValue > storeValue )
                {
                    result[aKey] = aValue - storeValue;
                }
            });
            return result;
        }

        StructureTerminal.prototype.init = function()
        {
            if (FUNCTION_CALLS_STRUCTURE_TERMINAL)
            {
                logDEBUG('STRUCTURE TERMINAL: init - ['+this.pos.x+' '+this.pos.y+'] ');
            }
        };

        StructureTerminal.LAB_STOCK =
        {
            [RESOURCE_ENERGY]: 0,
            [RESOURCE_ZYNTHIUM]: 0,
            [RESOURCE_UTRIUM]: 0,
        };

    }
};
module.exports = mod;
