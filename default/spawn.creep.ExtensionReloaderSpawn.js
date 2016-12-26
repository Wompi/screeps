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
        if (myRoomExtensionBays.length == 0) return;

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
            var assignedExtensions = [];
            _.forEach(myCreeps, (a) =>
            {
                var registeredExtension = Game.getObjectById(a.memory.extensionBay)
                if (_.isNull(registeredExtension))
                {
                    logERROR('REGISTERED EXTENSION is not valid anymore!');
                }
                else
                {
                    assignedExtensions.push(registeredExtension);
                }

            });

            _.forEach(myRoomExtensionBays, (a) =>
            {
                var assigned = false;
                _.forEach(assignedExtensions, (b) =>
                {
                    if (a.id == b.id)
                    {
                        assigned = true;
                    }
                });
                if (!assigned)
                {
                    aExtensionBay = a;
                    return;
                }
            });

            if (_.isUndefined(aExtensionBay)) return;
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
