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
            maxOps: 2000,
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
};

module.exports = Utillities;
