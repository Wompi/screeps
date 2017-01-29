var mySpawnCenter = require('case.SpawnCenter');

class ConstructorSpawn extends require('spawn.creep.AbstractSpawn')
{
    constructor(roleName)
    {
        super(roleName)
    }

    isSpawnActive()
    {
        return true;
    }

    processSpawn(pSpawn)
    {
        logDEBUG('CONSTRUCTOR SPAWN PROCESSED.....');
        if (!this.isSpawnValid(pSpawn)) return;
        var aRoom = pSpawn.room;

        var myRoomCreeps = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.creep);

        var myRole = new CREEP_ROLE[this.myName].role(this.myName);
        var myCreeps = _.filter(myRoomCreeps,(a) => { return a.memory.role == 'builder'});


        if (myCreeps.length > 0)
        {
            return;
        }
        var hasEmergency = aRoom.hasEmergencyState();


        var myRoomConstructionSites = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.constructionSite);
        logDERP('BUILDER DERP '+myRoomConstructionSites.length)
        if (myRoomConstructionSites.length == 0) return;

        var myFlagNames = (Flag.findName(Flag.FLAG_COLOR.construction.primaryConstruction,aRoom));
        var myAllFlags = myFlagNames.concat(Flag.findName(Flag.FLAG_COLOR.construction,aRoom));

        logDERP('BUILDER DERP')
        if (myAllFlags.length == 0 )
        {
            logERROR('CONSTRUCTOR SPAWN '+aRoom.name+' has construction sites but NO FLAGS .. place some to start!');
            return;
        }

        if (hasEmergency)
        {
            this.spawnEmergencyCreep(pSpawn);
            return;
        }

        this.spawnCalculatedCreep(pSpawn);

    }

    spawnCalculatedCreep(pSpawn)
    {
        if (pSpawn.room.energyAvailable < 300) return;

        var aBody = Formula.calcBuilder(pSpawn.room);
        if (_.isUndefined(aBody)) return;

        var result = pSpawn.createCreep(aBody,undefined,{ role: 'builder'});
        if (typeof result === 'string')
        {
            logWARN('New CONSTRUCTOR Creep '+result+' .. '+ErrorSting(result));
            Game.creeps[result].init();
        }
        else
        {
            logERROR('Something fishy with CONSTRUCTOR creep creation .. ');
        }
    }

    spawnEmergencyCreep(pSpawn)
    {
        // TODO: no contructors when emergency ....
    }
}
module.exports = ConstructorSpawn;
