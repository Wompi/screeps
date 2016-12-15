var mod =
{
    extend: function()
    {
        Object.defineProperties(StructureLab.prototype,
        {
        });

        StructureLab.prototype.init = function()
        {
            if (FUNCTION_CALLS_STRUCTURE_LAB)
            {
                logDEBUG('STRUCTURE LAB: init - ['+this.pos.x+' '+this.pos.y+'] ');
            }
        };
    }
};
module.exports = mod;
