class PathManager
{
    constructor()
    {
        this._mCloseRoomMatrix = this.makeClosedRoomMatrix();
    }

    makeClosedRoomMatrix()
    {
        let aMatrix = new PathFinder.CostMatrix;
        _.times(50, (aIndex) =>
        {
            aMatrix.set(aIndex,0,COSTMATRIX_BLOCK_VALUE);
            aMatrix.set(49,aIndex,COSTMATRIX_BLOCK_VALUE);
            aMatrix.set(aIndex,49,COSTMATRIX_BLOCK_VALUE);
            aMatrix.set(0,aIndex,COSTMATRIX_BLOCK_VALUE);
        });
        return aMatrix.serialize();
    }



    getPath(pos1,pos2)
    {
        var myPath = PathFinder.search(pos1,{ pos:pos2, range:1 },
        {
            plainCost: 0, //2,
            swampCost: 0, ///5,
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
                        costs.set(structure.pos.x, structure.pos.y, COSTMATRIX_BLOCK_VALUE);
                    }
                });
                //Visualizer.visualizeCostMatrix(costs,room);
                return costs;
            }
        });
        return myPath;
    }







    getClosedRoomMatrix()
    {
        return  PathFinder.CostMatrix.deserialize(this._mCloseRoomMatrix);
    }

    log(pLevel,pMsg)
    {
        Log(pLevel,'PathManager: '+pMsg);
    }

}
module.exports = PathManager;
