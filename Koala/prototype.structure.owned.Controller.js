
StructureController.prototype.visualize = function()
{
    var aArea = this.upgradePositions;

    Visualizer.visualizeArea(aArea.area, ({x,y,value}) =>
    {
        var aColor = COLOR.yellow;
        if (value == aArea.max)
        {
            aColor = COLOR.green;
        }
        else if (value == 0)
        {
            aColor = COLOR.red;
        }
        this.room.visual.circle(Number(x),Number(y), {fill: aColor});
    });
}

StructureController.prototype.getEntityEvents = function()
{
    return {
        currentEntity: () => Game.getObjectById(this.id),
        onUpdate: (pProxy) =>
        {
            if (!this.my)
            {
                pProxy.id = this.id;
                pProxy.reservation = this.reservation;
                pProxy.safeModeCooldown = this.safeModeCooldown;
                pProxy.ticksToDowngrade = this.ticksToDowngrade;
                pProxy.safeModeAvailable = this.safeModeAvailable;
                pProxy.safeMode = this.safeMode;
                pProxy.progressTotal = this.progressTotal;
                pProxy.progress = this.progress;
                pProxy.level = this.level;
                pProxy.structureType = this.structureType;
                pProxy.pos = pProxy.pos;
                let a = _.find(PCache.getHostileEntityCache(ENTITY_TYPES.creep),(aC) => aC.pos.roomName == this.pos.roomName);
                if (!_.isUndefined(a))
                {
                    pProxy.danger = Game.time + a.ticksToLive;
                }
            }
        },
        onInvalid: (pLastUpdate,pProxy) =>
        {
            pProxy.entity = undefined;

            // TODO: save the controller to memory here?
            let aDerp = Mem.getEnsured(Memory,['reservations',pProxy.id],pProxy);
            _.set(Memory,['reservations',pProxy.id],pProxy);

            return INVALID_ACTION.delete;
        },
    };
}



/**
    INFO: ClaimOperation:
    CONTROLLER: [W46N83 35,23]
    {
        "entity":
        {
            "room":
                {
                    "name":"W46N83",                <----
                    "mode":"world",
                    "energyAvailable":0,
                    "energyCapacityAvailable":0,
                    "visual":
                    {
                        "roomName":"W46N83"
                    }
                },
                "pos":                              <---- maybe
                {
                    "x":35,
                    "y":23,
                    "roomName":"W46N83"
                },
                "id":"5873bc9111e3e4361b4d7d0b",    <----
                "reservation":                      <----
                {
                    "username":"Casegard",
                    "ticksToEnd":1
                },
                "level":0,
                "safeModeAvailable":0,
                "my":false,
                "hits":0,
                "hitsMax":0,
                "structureType":"controller"
            },
            "isMy":false,
            "lastUpdate":17947141,                  <----
            "isValid":true
        }
    }
 */
StructureController.prototype.save = function()
{
}

StructureController.prototype.init = function(pProxy)
{
    //Log(LOG_LEVEL.info,'STRUCTURE CONTROLLER: '+this.pos.toString()+' init - '+pProxy.id+' proxy: '+pProxy.toString());
    var aRange = 3;
    var aArea = this.pos.inBoundPositions(aRange);
    pProxy.upgradePositions = aArea;
    pProxy.isMy = isMine(this);
}

// extend = function()
// {
//     Object.defineProperties(StructureController.prototype,
//     {
//         'upgradePositions':
//         {
//             configurable: true,
//             get: function()
//             {
//                 var aRange = 3;
//                 return this.pos.inBoundPositions(aRange);
//             },
//         }
//
//     });
// };
// extend();
