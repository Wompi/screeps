var mod =
{
    ErrorString: function(code)
    {
        var codes =
        {
            [OK]:                           'OK',
            [ERR_NOT_OWNER]:                'ERR_NOT_OWNER',
            [ERR_NO_PATH]:                  'ERR_NO_PATH',
            [ERR_NAME_EXISTS]:              'ERR_NAME_EXISTS',
            [ERR_BUSY]:                     'ERR_BUSY',
            [ERR_NOT_FOUND]:                'ERR_NOT_FOUND',
            [ERR_NOT_ENOUGH_RESOURCES]:     'ERR_NOT_ENOUGH_RESOURCES',
            [ERR_INVALID_TARGET]:           'ERR_INVALID_TARGET',
            [ERR_FULL]:                     'ERR_FULL',
            [ERR_NOT_IN_RANGE]:             'ERR_NOT_IN_RANGE',
            [ERR_INVALID_ARGS]:             'ERR_INVALID_ARGS',
            [ERR_TIRED]:                    'ERR_TIRED',
            [ERR_NO_BODYPART]:              'ERR_NO_BODYPART',
            [ERR_RCL_NOT_ENOUGH]:           'ERR_RCL_NOT_ENOUGH',
            [ERR_GCL_NOT_ENOUGH]:           'ERR_GCL_NOT_ENOUGH'
        };
        return codes[code];
    },
    JS: (obj,replacer = undefined, space = undefined) =>
    {
        return JSON.stringify(obj,replacer, space);
    },
    getID: function()
    {
        if (Memory.globalId == undefined || Memory.globalId > 10000)
        {
            Memory.globalId = 0;
        }
        Memory.globalId = Memory.globalId + 1;
        return Memory.globalId;
    },

    /**
     * Returns html for a button that will execute the given command when pressed in the console.
     * @param id (from global.getId(), value to be used for the id property of the html tags)
     * @param type (resource type, pass undefined most of the time. special parameter for storageContents())
     * @param text (text value of button)
     * @param command (command to be executed when button is pressed)
     * @param browserFunction {boolean} (true if command is a browser command, false if its a game console command)
     * @returns {string}
     * Author: Helam
     */
    makeButton: function(id, type, text, command, browserFunction=false)
    {
        var outstr = ``;
        var handler = ``;
        if (browserFunction)
        {
            outstr += `<script>var bf${id}${type} = ${command}</script>`;
            handler = `bf${id}${type}()`
        }
        else
        {
            handler = `customCommand${id}${type}(\`${command}\`)`;
        }
        outstr += `<script>var customCommand${id}${type} = function(command) { $('body').injector().get('Connection').sendConsoleCommand(command) }</script>`;
        outstr += `<input type="button" value="${text}" style="background-color:#555;color:white;" onclick="${handler}"/>`;
        return outstr;
    },
    listAllProperties: function(o)
    {
    	var objectToInspect;
    	var result = [];

    	for(objectToInspect = o; objectToInspect !== null; objectToInspect = Object.getPrototypeOf(objectToInspect)){

            var aName = Object.getOwnPropertyNames(objectToInspect);
            result.push('-----------------------');

            if (aName[0] == 'constructor')
            {
                Log(undefined,'Constructor: '+objectToInspect.constructor);
            }

            // if (aName[4] == 'progress')
            // {
            //     Log(undefined,'Progress: '+objectToInspect.progress);
            // }

          result = result.concat(aName);
    	}

    	return result;
    },
    getPath: function(pos1,pos2)
    {
        var myPath = PathFinder.search(pos1,{ pos:pos2, range:1 },
        {
            plainCost: 2,
            swampCost: 5,
            maxOps: 20000,
            roomCallback: function(roomName)
            {
                let room = Game.rooms[roomName];
                // In this example `room` will always exist, but since PathFinder
                // supports searches which span multiple rooms you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;

                room.find(FIND_STRUCTURES).forEach(function(structure)
                {
                    if (structure.structureType === STRUCTURE_ROAD)
                    {
                        // Favor roads over plain tiles
                        costs.set(structure.pos.x, structure.pos.y, 1);
                    }
                    else if (structure.structureType !== STRUCTURE_CONTAINER && (structure.structureType !== STRUCTURE_RAMPART || !structure.my))
                    {
                        // Can't walk through non-walkable buildings
                        costs.set(structure.pos.x, structure.pos.y, 0xff);
                    }
                });

                // Avoid creeps in the room
                // room.find(FIND_CREEPS).forEach(function(creep)
                // {
                //     costs.set(creep.pos.x, creep.pos.y, 0xff);
                // });
                return costs;
            }
        });
        return myPath;
    },
    getCreepsForRole: (pRole) =>
    {
        return _.filter(Game.creeps, (aCreep) => aCreep.hasRole(pRole));
    },
    getRoomType: (pRoomName) =>
    {
        let reg = /\d+/g

        let EW = rmName.match(reg)[0]
        let NS = rmName.match(reg)[1]

        if ((EW%10 == 0 || NS%10 == 0))
        {
            return ROOM_TYPE.highway;
        }
        else if (EW%5 == 0 && NS%5 == 0)
        {
            return ROOM_TYPE.center;
        }
        else if ((EW%5 == 1 || EW%5 == 4 || EW%5 == 0) && (NS%5 == 1 || NS%5 == 4 || NS%5 == 0))
        {
            return ROOM_TYPE.sourceKeeper;
        }
        else
        {
            return ROOM_TYPE.playerRoom;
        }
    },
};
module.exports = mod;
