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
        _.each(PCache.getFriendlyEntityCache(ENTITY_TYPES.road), (aR) =>
       {
           let aRoomMap = this.mRoomRoadMap[aR.pos.roomName];
           if (_.isUndefined(aRoomMap))
           {
               aRoomMap = new Array(2500).fill(0);
               _.set(this.mRoomRoadMap,aR.pos.roomName,aRoomMap);
           }
           let x = aR.pos.x;
           let y = aR.pos.y;
           aRoomMap[(y * 49) + x] = 1;
       });

       // 1 4 5 6 (and negatives are the indexes for the adjacent fields)
       let aMask = [
                       -49-1, -49-0, -49+1 ,
                          -1,            1 ,
                       +49-1, +49+0, +49+1
                   ];

       _.each(PCache.getFriendlyEntityCache(ENTITY_TYPES.road), (aR) =>
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
                  aCount = aCount + this.mRoomRoadMap[aR.pos.roomName][j];
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

    printNetworkStats()
    {
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
