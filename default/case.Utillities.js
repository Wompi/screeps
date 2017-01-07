class Utillities
{
    constructor()
    {

    }

    getPath(pos1,pos2)
    {
        var myPath = PathFinder.search(pos1,pos2,
        {
            plainCost: 2,
            swampCost: 5,
            range: 1,
            maxOps: 4000,
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
    }


    getMineralStorage()
    {
        var a = Game.cpu.getUsed();
        var aSum = {};
        _.forEach(Game.rooms, (aRoom) =>
        {
            _.forEach(aRoom.getRoomObjects(ROOM_OBJECT_TYPE.container), (aBox) =>
            {
                aSum = this.sumMineralStore(aSum,aBox.getMineralStore());
            });

            var aStorage = aRoom.storage;
            if (!_.isUndefined(aStorage))
            {
                aSum = this.sumMineralStore(aSum,aStorage.getMineralStore());
            }

            var aTerminal = aRoom.terminal;
            if (!_.isUndefined(aTerminal))
            {
                aSum = this.sumMineralStore(aSum,aTerminal.getMineralStore());
            }
        });
        logDERP('aSum = '+JSON.stringify(aSum));
        var b = Game.cpu.getUsed();
        logWARN('PROFILE: mineral sum - '+(b-a));
    }


    sumMineralStore(pSum,pStore)
    {
        return _.reduce(pStore, (res,a,b) =>
        {
            res[b] = _.isUndefined(res[b]) ? a : res[b] + a;
            return res;
        },pSum);
    }

};

module.exports = Utillities;
