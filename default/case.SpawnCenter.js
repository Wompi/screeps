
DERP = {};

// CREEP_SPAWN_BODY =
// {
//     TOWER_HAULER:
//     {
//         400: [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE],
//         150: [CARRY,CARRY,MOVE],
//     }
// };
// module.exports = CREEP_SPAWN_BODY;

var modSpawnCenter  =
{
    CREEP_SPAWN_BODY:
    {
        CONSTRUCTOR:
        {
            900: [WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
            750: [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
            500: [WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE],
            350: [WORK,CARRY,CARRY,CARRY,MOVE,MOVE],
            300: [WORK,CARRY,CARRY,MOVE,MOVE],
        },
        FIXER:
        {
            400: [WORK,WORK,CARRY,CARRY,MOVE,MOVE],
            200: [WORK,CARRY,MOVE],
        },
        TOWER_HAULER:
        {
            400: [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE],
            150: [CARRY,CARRY,MOVE],
        },
        BUILDER_SUPPLY:
        {

        },
        BASIC_HAULER:
        {
            750: [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
        },
        BASIC_UPGRADER:
        {
            1300: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE],
        },
        MEGA_MINER:
        {
            1500: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
        },
    },



    getRemoteGuard: function(room)
    {
        var result = undefined;
        if (room.energyCapacityAvailable >= 680)
        {
            if (room.energyAvailable >= 680)
            {
                // 70 + 450 + 160 = 680
                result = [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,MOVE,MOVE,MOVE,ATTACK];
            }
        }
        return result;

    },

    getRemoteClaimer: function(room)
    {
        var result = undefined;
        if (room.energyCapacityAvailable >= 1250)
        {
            if (room.energyAvailable >= 1250)
            {
                result = [CLAIM,CLAIM,MOVE];
            }
        }
        return result;
    },

    getRemoteMiner: function(room)
    {
        var result = undefined;
        if (room.energyCapacityAvailable >= 700)
        {
            if (room.energyAvailable >= 700)
            {
                result = [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE];
            }
        }
        return result;
    },

    getRemoteHauler: function(room)
    {
        var result = undefined;
        if (room.energyCapacityAvailable >= 950)
        {
            if (room.energyAvailable >= 950)
            {
                result = [WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
            }
        }
        return result;
    },

};
module.exports = modSpawnCenter;
