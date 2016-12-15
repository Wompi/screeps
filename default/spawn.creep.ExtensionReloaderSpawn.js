var mySpawnCenter = require('case.SpawnCenter');

class ExtensionReloaderSpawn extends require('spawn.creep.AbstractSpawn')
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
        logDEBUG('EXTENSION RELOADER SPAWN PROCESSED.....');
        if (!this.isSpawnValid(pSpawn)) return;

        var aRoom = pSpawn.room;

        var myRoomCreeps = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.creep);
        var myRoomExtensionBays = aRoom.myExtensionBays;

        var myRole = new CREEP_ROLE[this.myName].role(this.myName);
        var myCreeps = _.filter(myRoomCreeps,(a) => { return a.myRole.myName == myRole.myName});

        if (myCreeps.length >= myRoomExtensionBays.length)
        {
            return;
        }

        var aBody = undefined;
        if (aRoom.energyAvailable >= 100)
        {
            aBody = [CARRY,MOVE];
        }
        if (_.isUndefined(aBody)) return;

        var aExtensionBay = undefined;
        if (myCreeps.length > 0)
        {
            var derp = _.filter(myRoomExtensionBays,(a) =>
            {
                for (var bCreep of myCreeps)
                {
                    var registeredExtension = Game.getObjectById(bCreep.memory.extensionBay)
                    if (_.isNull(registeredExtension))
                    {
                        logERROR('REGISTERED EXTENSION is not valid anymore!');
                        continue;
                    }
                    if (registeredExtension.id != a.id)
                    {
                        return true;
                    }
                }
                return false;
            });
            if (derp.length == 0)
            {
                logERROR('SPAWN: EXTENSION LOADER - could not find a undefined extension bay!');
                return
            }
            aExtensionBay = derp[0];
        }
        else
        {
            aExtensionBay = myRoomExtensionBays[0];
        }

        var result = pSpawn.createCreep(aBody,undefined,{ role: 'extension reloader',extensionBay: aExtensionBay.id});
        //var result = undefined;
        if (typeof result === 'string')
        {
            logWARN('EXTENSION LOADER '+result+' is spawning .. '+ErrorSting(result));
            Game.creeps[result].init();
        }
        else
        {
            logERROR('EXTENSION LOADER  something fishy with creep creation .. ');
        }
    }
}
module.exports = ExtensionReloaderSpawn;
