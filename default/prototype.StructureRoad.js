var mod =
{
    extend: function()
    {
        Object.defineProperties(StructureRoad.prototype,
        {

        });

        StructureRoad.prototype.init = function()
        {
            if (FUNCTION_CALLS_STRUCTURE_ROAD)
            {
                logDEBUG('STRUCTURE ROAD: init '+this.room.name+' - ['+this.pos.x+' '+this.pos.y+'] D: '+this.ticksToDecay+' S: '+this.getStructureState().toFixed(1));
                var derp = this.estimatedDecayTime;
            }
        };
    }
};
module.exports = mod;
