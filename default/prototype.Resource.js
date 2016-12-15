var mod =
{
    extend: function()
    {
        Object.defineProperties(Resource.prototype,
        {
        });

        Resource.prototype.getDecayTicks = function()
        {
            return _.floor(this.amount/_.ceil(this.amount/ENERGY_DECAY));
        };


        Resource.prototype.init = function()
        {
            if (FUNCTION_CALLS_STRUCTURE_RESOURCE)
            {
                console.log('RESOURCE: init - ['+this.pos.x+' '+this.pos.y+'] D: '+this.getDecayTicks());
            }
        };
    }
};
module.exports = mod;
