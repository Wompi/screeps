var mod =
{
    extend: function()
    {
        Object.defineProperties(RoomPosition.prototype,
        {
        });

        RoomPosition.prototype.findEmptyNearbySpot = function()
        {
            return findAdjacentWalkablePositions(this);
        }


        RoomPosition.prototype.init = function()
        {
            if (FUNCTION_CALLS_ROOM_POSITION)
            {
                logDEBUG('ROOM POSITION: init - ['+this.pos.x+' '+this.pos.y+']');
            }
        };
    }
};
module.exports = mod;
