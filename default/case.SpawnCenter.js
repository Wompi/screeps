
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

    getMineralMiner: function(room)
    {
        var result = undefined;
        if (room.energyCapacityAvailable >= 1700)
        {
            if (room.energyAvailable >= 1700)
            {
                result = [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
            }
        }
        return result;
    },


    // this is just a placeholer - we have to find a calculation rule with constuction site HPs and then the best combination
    getConstructorCreep: function(room)
    {
        var result = undefined;
        if (room.energyCapacityAvailable >= 1050 && room.energyAvailable >= 1050)
        {
            result = [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
        }
        else if (room.energyCapacityAvailable >= 750 && room.energyAvailable >= 750)
        {
            result = [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
        }
        else if (room.energyCapacityAvailable >= 500 && room.energyAvailable >= 500)
        {
            result = [WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE];
        }
        else if (room.energyCapacityAvailable >= 350 && room.energyAvailable >= 350)
        {
            result = [WORK,CARRY,CARRY,CARRY,MOVE,MOVE];
        }
        else if (room.energyCapacityAvailable >= 300 && room.energyAvailable >= 300)
        {
            result = [WORK,CARRY,CARRY,MOVE,MOVE];
        }
        return result;
    },

    getFixerCreep: function(room)
    {
        var result = undefined;
        if (room.energyCapacityAvailable >= 400 && room.energyAvailable >= 400)
        {
            result = [WORK,WORK,CARRY,CARRY,MOVE,MOVE];
        }
        else if (room.energyCapacityAvailable >= 200 && room.energyAvailable >= 200)
        {
            result = [WORK,CARRY,MOVE];
        }
        return result;
    },

    getTrader: function(room)
    {
        var result = undefined;
        if (room.energyCapacityAvailable >= 1050)
        {
            if (room.energyAvailable >= 1050)
            {
                result = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
            }
        }
        return result;
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

    getRemoteBuilder: function(room)
    {
        var result = undefined;
        if (room.energyCapacityAvailable >= 1800)
        {
            if (room.energyAvailable >= 1200)
            {
                result = [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
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

    getExtensionBayLoader: function(room)
    {
        var result = undefined;
        if (room.energyCapacityAvailable >= 100)
        {
            if (room.energyAvailable >= 100)
            {
                result = [CARRY,MOVE];
            }
        }
        return result;
    },

    getSupplierCreep: function(room)
    {
        var result = undefined;
        if (room.energyCapacityAvailable >= 750)
        {
            if (room.energyAvailable >= 750)
            {
                result = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
            }
            else if (room.energyAvailable >= 300)
            {
                result = [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE];
            }
            else
            {
                result = [CARRY,CARRY,MOVE];
            }
        }
        return result;
    },

    getTowerHaulerCreep: function(room)
    {
        var result = undefined;
        if (room.energyCapacityAvailable >= 1800)
        {
            if (room.energyAvailable >= 600)
            {
                result = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
            }
            else if (room.energyAvailable >= 400)
            {
                result = [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE];
            }
            else
            {
                result = [CARRY,CARRY,MOVE];
            }
        }
        else if (room.energyCapacityAvailable >= 150)
        {
            if (room.energyAvailable >= 150)
            {
                result = [CARRY,CARRY,MOVE];
            }
        }
        return result;
    },

    getSpawnCreepBody: function(room,creepRole)
    {
        if (_.isUndefined(room)) return undefined;

        var aMax = room.energyCapacityAvailable;
        var myBodys = _.filter(_.keys(creepRole), (a) =>
        {
            logERROR('A: '+a+' MAX: '+aMax);
            if ( aMax >= a )
            {
                if (room.energyAvailable >= a)
                {
                    return true;
                }
            }
            return false;
        });

        var aEnergy = _.max(myBodys);
        var result = undefined;
        if (!_.isNull(aEnergy))
        {
            result = creepRole[aEnergy];
        }
        logERROR('DERP: '+aEnergy+' BODY: '+JSON.stringify(result));
        return result;
    },

    getBuilderSupplier: function(room)
    {
        var result = undefined;
        if (room.energyCapacityAvailable >= 750)
        {
            if (room.energyAvailable >= 750)
            {
                result = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
            }
        }
        return result;
    },

    getBasicHaulerCreep: function(room)
    {
        var result = undefined;
        if (room.energyCapacityAvailable >= 750 && room.energyAvailable >= 750)
        {
            result = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];
        }
        return result;
    },

    getBasicUpgraderCreep: function(room)
    {
        var result = undefined;
        if (room.energyCapacityAvailable >= 1300 && room.energyAvailable >= 1300)
        {
            result = [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE];
        }
        return result;
    },

    getMegaMinerCreep: function(room,shouldMove,shouldCarry)
    {
        // 1950
        //return [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]

        // 1500
        return [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
    },

    getMinerCreep: function(room,shouldMove,shouldCarry)
    {
        var result = []
        var resultCost = 0
        if (shouldMove)
        {
            result.push(MOVE);
            resultCost += BODYPART_COST[MOVE];
        }
        if (shouldCarry)
        {
            result.push(CARRY);
            resultCost += BODYPART_COST[CARRY];
        }

        // change the 5 if you want something special
        var possibleWorkParts = _.min([5,_.floor((room.energyCapacityAvailable - resultCost)/BODYPART_COST[WORK])]);
        resultCost = resultCost + possibleWorkParts*BODYPART_COST[WORK];

        // this should not be possible - but we test it anyway you never know
        if (possibleWorkParts == 0) return undefined;
        if (resultCost > room.energyAvailable) return undefined;

        for (var i=0; i<possibleWorkParts; i++)
        {
            result.push(WORK);
        }
        return result;
    },
};
module.exports = modSpawnCenter;
