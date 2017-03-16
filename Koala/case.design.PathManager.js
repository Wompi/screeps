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

    getCleanPath(pos1,pos2, aReferencePath = undefined)
    {
        var myPath = PathFinder.search(pos1,{ pos:pos2, range:1 },
        {
            plainCost: 2,
            swampCost: 3,
            maxOps: 20000,
            roomCallback: function(roomName)
            {
                let room = Game.rooms[roomName];
                // In this example `room` will always exist, but since PathFinder
                // supports searches which span multiple rooms you should be careful!

                let costs = new PathFinder.CostMatrix;

                if (!_.isUndefined(aReferencePath))
                {
                    _.each(aReferencePath, (aP) =>
                    {
                        if (aP.roomName == roomName)
                        {
                            costs.set(aP.x,aP.y, 1);
                        }
                    });
                }
                else
                {
                    //Log(undefined,'CALL: '+roomName);
                }


                if (!room) return costs;

                room.find(FIND_STRUCTURES).forEach(function(structure)
                {
                    if (structure.structureType === STRUCTURE_ROAD)
                    {
                        // Favor roads over plain tiles
                        if (costs.get(structure.pos.x, structure.pos.y) == 0)
                        {
                            costs.set(structure.pos.x, structure.pos.y, 1);
                        }
                    }
                    else if (structure.structureType !== STRUCTURE_CONTAINER && (structure.structureType !== STRUCTURE_RAMPART || !structure.my))
                    {
                        // Can't walk through non-walkable buildings
                        costs.set(structure.pos.x, structure.pos.y, COSTMATRIX_BLOCK_VALUE);
                    }
                });

                // let myBays = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.flag),FLAG_TYPE.extensionBay);
                // _.each(myBays, (aB) =>
                // {
                //     if (aB.pos.roomName == roomName)
                //     {
                //         let x = aB.pos.x;
                //         let y = aB.pos.y;
                //         _.times(7,(aIndex) =>
                //         {
                //             _.times(7, (bIndex) =>
                //             {
                //                 costs.set(x-3+aIndex,y-3+bIndex,COSTMATRIX_BLOCK_VALUE);
                //             })
                //         })
                //     }
                // })


                //Visualizer.visualizeCostMatrix(costs,room);

                return costs;
            }
        });
        return myPath;
    }

    newTest()
    {
        let aSP = new RoomPosition(24,36,'W47N84'); // spawn pos
        let aSTP = new RoomPosition(40,34,'W47N84'); // storage pos

        let aSNP = new RoomPosition(35,44,'W47N84'); // source near
        let aSFP = new RoomPosition(18,3,'W47N84'); // source far
        let aMP = new RoomPosition(21,43,'W47N84'); // mineral

        let bSNP = new RoomPosition(41,14,'W48N83'); // source -> near
        let bCP = new RoomPosition(27,30,'W48N83'); // controller

        let cSNP = new RoomPosition(13,33,'W48N84');
        let cSFP = new RoomPosition(4,36,'W48N84');
        let cCP = new RoomPosition(18,8,'W48N84');

        let dSNP = new RoomPosition(22,16,'W47N83');
        let dSFP = new RoomPosition(6,28,'W47N83');
        let dCP = new RoomPosition(17,34,'W47N83');

        let eSNP = new RoomPosition(16,14,'W46N83');
        let eSFP = new RoomPosition(33,33,'W46N83');
        let eCP = new RoomPosition(35,23,'W46N83');



        let a = this.derpTest(aSP,aSTP,COLOR.yellow);           // spawn -> storage
        let b = this.derpTest(aSP,aSNP,COLOR.blue,a.path);      // spawn -> source near
        let c = this.derpTest(aSP,aSFP,COLOR.red,a.path);       // spawn -> source far
        let d = this.derpTest(aMP,aSTP,COLOR.green,a.path);       // mineral -> storage

        let e = this.derpTest(aSP,bSNP,COLOR.blue,c.path);       // spawn -> room W48N83 source near
        let f = this.derpTest(aSP,bCP,COLOR.yellow,e.path);       // spawn -> room W48N83 controller

        let g = this.derpTest(aSP,cSNP,COLOR.blue,e.path);       // spawn -> room W48N84 source near
        let h = this.derpTest(aSP,cSFP,COLOR.red,g.path);       // spawn -> room W48N84 source far
        let i = this.derpTest(aSP,cCP,COLOR.yellow,g.path);       // spawn -> room W48N84 controller

        let j = this.derpTest(aSP,dSNP,COLOR.blue,a.path);       // spawn -> room W47N83 source near
        let k = this.derpTest(aSP,dCP,COLOR.yellow,j.path);       // spawn -> room W47N83 controller
        let l = this.derpTest(aSP,dSFP,COLOR.red,j.path);       // spawn -> room W47N83 source far
        
        let m = this.derpTest(aSP,eSNP,COLOR.blue,b.path);       // spawn -> room W47N83 source near
        let n = this.derpTest(aSP,eCP,COLOR.yellow,m.path);       // spawn -> room W47N83 controller
        let o = this.derpTest(aSP,eSFP,COLOR.red,n.path);       // spawn -> room W47N83 source far

    }



    test()
    {
        let aPOS = new RoomPosition(24,36,'W47N84');

        let bPOS = new RoomPosition(35,23,'W46N83');
        let cPOS = new RoomPosition(16,14,'W46N83');
        let dPOS = new RoomPosition(33,33,'W46N83');

        let ePOS = new RoomPosition(41,14,'W48N83'); // source
        let fPOS = new RoomPosition(27,30,'W48N83'); // controller


        let jPOS = new RoomPosition(42,34,'W49N83');
        let kPOS = new RoomPosition(44,7,'W49N83');
        let lPOS = new RoomPosition(15,28,'W49N83');

        let mPOS = new RoomPosition(22,16,'W47N83');
        let nPOS = new RoomPosition(6,28,'W47N83');
        let oPOS = new RoomPosition(17,34,'W47N83');




        // let b = this.derpTest(aPOS,cPOS, COLOR.blue);
        // let a = this.derpTest(aPOS,bPOS,COLOR.YELLOW,b.path);
        // let c = this.derpTest(aPOS,dPOS, COLOR.red,a.path);


        let d = this.derpTest(aPOS,jPOS);
        let e = this.derpTest(aPOS,kPOS, COLOR.blue,d.path);
        let f = this.derpTest(aPOS,lPOS, COLOR.blue,d.path);

        // let g = this.derpTest(aPOS,hPOS, COLOR.blue,e.path);
        // let h = this.derpTest(aPOS,iPOS, COLOR.red,g.path);
        // let f = this.derpTest(aPOS,gPOS, COLOR.yellow,g.path);
        //
        // let i = this.derpTest(aPOS,jPOS, COLOR.yellow, h.path);
        // let j = this.derpTest(aPOS,kPOS, COLOR.blue, i.path);
        // let k = this.derpTest(aPOS,lPOS, COLOR.red, i.path);
        //
        // let n = this.derpTest(aPOS,oPOS, COLOR.yellow);
        // let l = this.derpTest(aPOS,mPOS, COLOR.blue,n.path);
        // let m = this.derpTest(aPOS,nPOS, COLOR.red,n.path);
        //

        // aPath.path = [];
        //
        //
        // Log(LOG_LEVEL.debug,'PATH: '+JS(aPath)+' len: '+len+' first: '+JS(aFirst));
     }



     derpTest(p1, p2, pColor = COLOR.yellow, aReferencePath = undefined)
     {
         let aPath = this.getCleanPath(p1,p2,aReferencePath);
         let len = aPath.path.length;

         let aRoomPath = {}
         _.each(aPath.path, (aPathPos) =>
         {
             let a = _.get(aRoomPath,aPathPos.roomName,[]);
             a.push(aPathPos);
             _.set(aRoomPath,aPathPos.roomName, a);
         });

         _.each(aRoomPath, (aP,aName) =>
         {
             new RoomVisual(aName).poly(aP,{lineStyle: 'dashed' , stroke: pColor, opacity: 1});
             new RoomVisual(aName).text(aP.length+'('+len+')',_.last(aP));
         });

         let aFirst = _.first(aPath.path);
         let aLast = _.last(aPath.path);
         let result = aPath;

        let {path,ops,cost,incomplete} = aPath;
        let derp = {
            path: [],
            ops: ops,
            cost: cost,
            incomplete: incomplete,
        }
         Log(LOG_LEVEL.debug,'PATH: '+JS(derp)+' first: '+aFirst.toString()+' last: '+aLast.toString());
         return result;
     }

    getClosedRoomMatrix()
    {
        return  PathFinder.CostMatrix.deserialize(this._mCloseRoomMatrix);
    }


    getEndPoints()
    {
        let myRoads
    }


    log(pLevel,pMsg)
    {
        Log(pLevel,'PathManager: '+pMsg);
    }

}
module.exports = PathManager;
