var mod =
{
    extend: function()
    {
        Object.defineProperties(Structure.prototype,
        {
            'isEnergySupply':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._isEnergySupply))
                    {
                        this._isEnergySupply =
                        (
                               this.structureType == STRUCTURE_EXTENSION
                            || this.structureType == STRUCTURE_CONTAINER
                            || this.structureType == STRUCTURE_LINK
                            || this.structureType == STRUCTURE_TOWER
                            || this.structureType == STRUCTURE_STORAGE
                            || this.structureType == STRUCTURE_SPAWN
                            || this.structureType == STRUCTURE_TERMINAL
                        );
                    }
                    return this._isEnergySupply;
                }
            },
        });


        Structure.prototype.getStructureState = function()
        {
            return this.hits * 100 / this.hitsMax;
        }

        Structure.getFindFilterKey = 'FIND_STRUCTURES';
    }
};
module.exports = mod;
