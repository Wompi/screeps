var mod =
{
    extend: function()
    {
        Object.defineProperties(StructureObserver.prototype,
        {
        });

        StructureObserver.prototype.init = function()
        {
            if (FUNCTION_CALLS_STRUCTURE_OBSERVER)
            {
                logDEBUG('STRUCTURE OBSERVER: init - ['+this.pos.x+' '+this.pos.y+'] ');
            }
        };
    }
};
module.exports = mod;
