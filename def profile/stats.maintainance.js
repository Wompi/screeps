var statsMaintainance =
{
    getConstructionSite: function()
    {
        var mySites = Game.rooms['E66N49'].find(FIND_CONSTRUCTION_SITES);
        var myConstructionSite = undefined;

        if (mySites != undefined)
        {
            var myConstructionOrder = [STRUCTURE_CONTAINER,STRUCTURE_EXTENSION,STRUCTURE_TOWER,STRUCTURE_WALL,STRUCTURE_RAMPART,STRUCTURE_ROAD];

            for ( var conID in myConstructionOrder)
            {
                for ( var siteID in mySites)
                {
                    if (mySites[siteID].structureType == myConstructionOrder[conID])
                    {
                        //console.log('SITE: '+mySites[siteID].structureType);
                        myConstructionSite = mySites[siteID];
                        break;
                    }
                }

                if (myConstructionSite != undefined)
                {
                     break;
                }
            }
        }
        else
        {
            console.log('INFO: no construction sites');
        }

        return myConstructionSite;
    },

    getRoadToFix: function()
    {
        var myRoads = Game.rooms['E66N49'].find(FIND_STRUCTURES,
        {

            filter: (myRoad) =>
            {
                return (myRoad.structureType == STRUCTURE_ROAD);
            }
        });

        var roadToFix = undefined;
        if (myRoads != undefined)
        {
            var myMin = 100;
            for (var roadID in myRoads)
            {
                var myRoad = myRoads[roadID];
                if (myRoad.hits < myRoad.hitsMax)
                {
                    var fixState = myRoad.hits * 100 / myRoad.hitsMax;
                    if (fixState < myMin)
                    {
                        myMin = fixState;
                        roadToFix = myRoad;
                    }
                }
            }
            //console.log('DEBUG: ROAD: '+roadToFix.pos.x+' '+roadToFix.pos.y+' STATE: '+myMin);
        }
        else
        {
            console.log('INFO: we have no roads!');
        }
        return roadToFix;
    },

    getContainersToFix: function()
    {
        var myContainers = Game.rooms['E66N49'].find(FIND_STRUCTURES,
        {
            filter: (myBox) =>
            {
                return (myBox.structureType == STRUCTURE_CONTAINER);
            }
        });
        var boxToFix = undefined;
        if (myContainers != undefined)
        {
            for (var containerID in myContainers)
            {
                var myBox = myContainers[containerID];
                if (myBox.hits < myBox.hitsMax)
                {
                    // TODO: this only checks the first broken box - but should be better the nearest broken box
                    boxToFix = myBox;
                    break;
                }
            }
        }
        else
        {
            console.log('WARN: we have NO CONTAINERS in room E66N49!');
        }
        return boxToFix;
    }
};

module.exports = statsMaintainance;
