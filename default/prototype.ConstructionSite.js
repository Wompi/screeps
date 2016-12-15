var mod =
{
    extend: function()
    {
        Object.defineProperties(ConstructionSite.prototype,
        {
        });

        ConstructionSite.prototype.getRemainingBuildCost = function()
        {
            return this.progressTotal - this.progress;
        }

        ConstructionSite.prototype.init = function()
        {
            if (FUNCTION_CALLS_CONSTRUCTION_SITE)
            {
                logDEBUG('CONSTRUCTION_SITE: init - ['+this.pos.x+' '+this.pos.y+'] D: '+this.structureType);
            }
        };
    }
};
module.exports = mod;
