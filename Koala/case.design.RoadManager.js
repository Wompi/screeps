class RoadManager
{
    constructor()
    {
        this.mRoomRoadMap = {};
        this.mEndPositions = [];
        this.mCrossPositions = [];
        this.mRepairRoads = {};
    }

    makeNetwork()
    {
        let myRoads = PCache.getFriendlyEntityCache(ENTITY_TYPES.road);
        _.each(myRoads, (aR) =>
       {
           let aRoomMap = this.mRoomRoadMap[aR.pos.roomName];
           if (_.isUndefined(aRoomMap))
           {
               aRoomMap = new Array(2500).fill(0);
               _.set(this.mRoomRoadMap,aR.pos.roomName,aRoomMap);
           }
           let x = aR.pos.x;
           let y = aR.pos.y;
           aRoomMap[(y * 49) + x] = aR.id;
       });

       // 1 4 5 6 (and negatives are the indexes for the adjacent fields)
       let aMask = [
                       -49-1, -49-0, -49+1 ,
                          -1,            1 ,
                       +49-1, +49+0, +49+1
                   ];

       _.each(myRoads, (aR) =>
      {
          let x = aR.pos.x;
          let y = aR.pos.y;
          let aIndex = (y * 49) + x
          let aCount = 0;
          _.each(aMask, (i) =>
          {
              let j = aIndex + i;
              if (_.gte(j,0) && _.lte(j,2500))
              {
                  if (this.mRoomRoadMap[aR.pos.roomName][j] != 0)
                  {
                      aCount = aCount + 1;
                  }
              }
          });

          if (aCount == 0) aR.roadType = ROAD_TYPE.single;
          else if (aCount == 1)
          {
               aR.roadType = ROAD_TYPE.end;
               this.mEndPositions.push(aR.pos);
          }
          else if (aCount == 2) aR.roadType = ROAD_TYPE.normal;
          else if (aCount > 2)
          {
              aR.roadType = ROAD_TYPE.cross;
              this.mCrossPositions.push(aR.pos);
          }
      });
    }

    getEndRoads()
    {
        return this.mEndPositions;
    }

    getRepairRoads()
    {
        return this.mRepairRoads;
    }

    registerRepairRoad(aRoadProxy)
    {
        if (_.isUndefined(aRoadProxy)) return;
        this.mRepairRoads[aRoadProxy.id] = aRoadProxy;
    }

    getRoadsInRange(pCenter, pRange, pVisual = false)
    {
        let result = {};
        let aRoomName = _.isUndefined(pCenter.pos) ? pCenter.roomName : pCenter.pos.roomName;
        let aMap = this.mRoomRoadMap[aRoomName];
        if (_.isUndefined(aMap)) return result;


        let aIndex = _.isUndefined(pCenter.pos) ? pCenter.rIndex : pCenter.pos.rIndex;
        //let aRange = _.range(aIndex-pRange*50,aIndex+pRange*50+1,1);
        let aRange = [];

        Pro.profile( () =>
        {
            for (let i=-pRange; i<(pRange+1); i++)
            {
                let aStart = _.max([0,aIndex+i*49-pRange]);
                aRange = aRange.concat(_.range(aStart,_.min([2500,aStart+2*pRange+1]),1));
            }
        }, 'road range loop');


        let aRoomVisual = undefined;
        if (pVisual)
        {
            aRoomVisual = new RoomVisual(aRoomName);
        }

        Pro.profile( () =>
        {
            _.each(aRange, (i) =>
            {
                let aColor = COLOR.yellow;
                if (aMap[i] != 0)
                {
                    let aRoad = PCache.getFriendlyEntityCacheByID(aMap[i]);
                    if (!_.isUndefined(aRoad))
                    {
                        result[aRoad.id] = aRoad;
                        aColor = COLOR.green;


                    }
                }

                if (pVisual)
                {
                    let aPos = getRoomPostionFromIndex(i,aRoomName);
                    aRoomVisual.circle(aPos.x,aPos.y,{stroke: aColor});
                    // new RoomVisual(aRoomName).text(aRest,aPos.x,aPos.y,{font: 0.6, color: aColor});
                }
            });
        },'road extract loop');
        return result;
    }

    getRoomMap(pRoomName)
    {
        return this.mRoomRoadMap[pRoomName];
    }

    printNetworkStats()
    {
        // Pro.register( () =>
        // {
        //     let myEndpoints = RMan.getEndRoads();
        //     _.each(myEndpoints, (aE) =>
        //     {
        //         new RoomVisual(aE.roomName).circle( aE.x,aE.y,{fill: 'transparent', stroke: COLOR.red })
        //         new RoomVisual(aE.roomName).text(aE.wpos.toString() ,aE.x+1,aE.y,{align: 'left'});
        //     })
        //     Log(LOG_LEVEL.debug,'END ROADS: '+myEndpoints.length);
        // },'all roads');


        // Pro.register( () =>
        // {
        //     let derp = RMan.getRepairRoads();
        //     _.each(derp, (aR) =>
        //     {
        //         let aP = aR.hits/aR.hitsMax
        //         if (!_.isUndefined(aR.room) && aP < 0.8)
        //         {
        //             let aColor = COLOR.white;
        //             if (aP < 0.75) aColor = COLOR.red;
        //             else if (aP < 0.80) aColor = COLOR.yellow;
        //
        //             aR.room.visual.text(aP.toFixed(2),aR.pos.x,aR.pos.y,{font: 0.4,opacity: 1, color: aColor});
        //         }
        //     })
        // },'roads visual');


        // _.each(this.mRoomRoadMap, (aM,aRoomName) =>
        // {
        //     let aVisable = new RoomVisual(aRoomName);
        //     _.each(aM, (aValue,aIndex) =>
        //     {
        //         if (aValue == 1)
        //         {
        //             let aX = aIndex % 49;
        //             let aY = (aIndex - aX) / 49;
        //             aVisable.circle(aX,aY,{fill: 'transparent', stroke: COLOR.yellow });
        //         }
        //     });
        // });
    }
}
module.exports = RoadManager;
