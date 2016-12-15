var mod =
{
    extend: function()
    {
        Object.defineProperties(Flag.prototype,
        {
        });


        Flag.prototype.init = function()
        {
            if (FUNCTION_CALLS_FLAG)
            {
                logDEBUG('FLAG: init - ['+this.pos.x+' '+this.pos.y+'] N: '+this.name+' P: '+this.color+' S: '+this.secondaryColor);
            }
        };

        Flag.findName = function(flagColor, pRoom)
        {
            var myRoomFlags = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.flag)
            return _.filter(myRoomFlags,flagColor.filter);
        };

        Flag.findClosest = function(flagColor, sourcePos,room)
        {
            var result = undefined;
            if (_.isUndefined(room) || _.isUndefined(flagColor || _.isUndefined(sourcePos))) return result;

            var myFlags = Flag.findName(flagColor,room);

            for (var aFlag of myFlags)
            {
                if (_.isUndefined(result) || sourcePos.getRangeTo(aFlag.pos) < sourcePos.getRangeTo(result))
                {
                    result = aFlag;
                }
            }
            return result;


        }

        Flag.getClosestFlag = function(aPos, myFlags)
        {
            if (myFlags.length == 0) return undefined;
            var result = myFlags[0];
            for (var aFlag in myFlags)
            {
                if(aPos.getRangeTo(aFlag) < aPos.getRangeTo(result))
                {
                    result = aFlag;
                }
            }
            return result;
        }


        Flag.FLAG_COLOR =
        {
           invade:
           { // destroy everything enemy in the room
               color: COLOR_RED,
               secondaryColor: COLOR_RED,
               filter: {'color': COLOR_RED, 'secondaryColor': COLOR_RED },
               exploit:
               { // send privateers to exploit sources
                   color: COLOR_RED,
                   secondaryColor: COLOR_GREEN,
                   filter: {'color': COLOR_RED, 'secondaryColor': COLOR_GREEN }
               },
               robbing:
               { // take energy from foreign structures
                   color: COLOR_RED,
                   secondaryColor: COLOR_YELLOW,
                   filter: {'color': COLOR_RED, 'secondaryColor': COLOR_YELLOW }
               },
           },
           construction:
           {
               color: COLOR_GREEN,
               secondaryColor: COLOR_YELLOW,
               filter: {'color': COLOR_GREEN, 'secondaryColor': COLOR_YELLOW },
               primaryConstruction:
               {
                   color: COLOR_GREEN,
                   secondaryColor: COLOR_RED,
                   filter: {'color': COLOR_GREEN, 'secondaryColor': COLOR_RED },
               },
           },
           remote:
           {
                color: COLOR_RED,
                secondaryColor: COLOR_RED,
                filter: {'color': COLOR_RED, 'secondaryColor': COLOR_RED },
                claim:
                {
                    color: COLOR_RED,
                    secondaryColor: COLOR_BROWN,
                    filter: {'color': COLOR_RED, 'secondaryColor': COLOR_BROWN },
                },
                miner:
                {
                    color: COLOR_RED,
                    secondaryColor: COLOR_YELLOW,
                    filter: {'color': COLOR_RED, 'secondaryColor': COLOR_YELLOW },
                },
                invader:
                {
                    color: COLOR_RED,
                    secondaryColor: COLOR_BLUE,
                    filter: {'color': COLOR_RED, 'secondaryColor': COLOR_BLUE },
                },
           },
           pioneer:
           {
               color: COLOR_PURPLE,
               secondaryColor: COLOR_PURPLE,
               filter: {'color': COLOR_PURPLE, 'secondaryColor': COLOR_PURPLE },
               claim:
               {
                   color: COLOR_PURPLE,
                   secondaryColor: COLOR_RED,
                   filter: {'color': COLOR_PURPLE, 'secondaryColor': COLOR_RED },
               },
               construction:
               {
                   color: COLOR_PURPLE,
                   secondaryColor: COLOR_GREY,
                   filter: {'color': COLOR_PURPLE, 'secondaryColor': COLOR_GREY },
               },
               miner:
               {
                   color: COLOR_PURPLE,
                   secondaryColor: COLOR_YELLOW,
                   filter: {'color': COLOR_PURPLE, 'secondaryColor': COLOR_YELLOW },
               },

           }

       };
    }
};
module.exports = mod;
