var mod =
{
    extend: function()
    {
        Object.defineProperties(StructureExtension.prototype,
        {
            'needsFuel':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._needsFuel))
                    {
                        this._needsFuel = this.energy < this.energyCapacity;
                    }
                    return this._needsFuel
                }
            }
        });

        StructureExtension.prototype.init = function()
        {
            if (FUNCTION_CALLS_STRUCTURE_EXTENSION)
            {
                logDEBUG('STRUCTURE_EXTENSION: init - ['+this.pos.x+' '+this.pos.y+'] E: '+this.energy);
            }
            delete this._needsFuel;
        };

        StructureExtension.getFindFilterKey = 'FIND_MY_STRUCTURES';
    }
};
module.exports = mod;
