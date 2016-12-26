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

        // code snippets - not working in mac
        // RoomPosition.prototype.toString = function (htmlLink = true) {
        //     if (htmlLink) {
        //         return `<a href="#!/room/${ this.roomName }">[${ this.roomName } ${ this.x },${ this.y }]</a>`;
        //     }
        //     return `[${ this.roomName } ${ this.x },${ this.y }]`;
        // };

        // code snippets -- not tested
        // RoomPosition.fromString = function(str, dontThrowError = false){
        //     let temp = str.split(/[\[\] ,]/);
        //     if(Game.rooms.sim && temp.length == 7) // sometimes sim's pos.toString() gives wierd
        //         temp = ['', temp[2], temp[4], temp[5], '']; // stuff like "[room sim pos 25,25]"
        //
        //     if(dontThrowError){
        //         if(temp.length !== 5)                                      return ERR_INVALID_ARGS;
        //         if(!/^(W|E)\d+(N|S)\d+$/.test(temp[1]) && temp[1]!=='sim') return ERR_INVALID_ARGS;
        //         if(!/^\d+$/.test(temp[2]))                                 return ERR_INVALID_ARGS;
        //         if(!/^\d+$/.test(temp[3]))                                 return ERR_INVALID_ARGS;
        //     }
        //
        //     return new RoomPosition(temp[2], temp[3], temp[1]);
        // }


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
