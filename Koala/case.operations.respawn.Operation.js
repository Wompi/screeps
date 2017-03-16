class RespawnOperation extends Operation
{
    constructor()
    {
        super('RespawnOperation');
    }

    processOperation()
    {
        // initial setup when memory is clear
        var myRespawnConditions =
        {
            rooms: _.size(Game.rooms) == 1,
            spawns: _.size(Game.spawns) == 1,
            structures: _.size(Game.structures) == 2,
            creeps: _.size(Game.creeps) == 0,
        }
        var aRespawn = _.every(myRespawnConditions);

        // if the general condition is not met - return here - aka no RESPAWN
        if (!aRespawn) return;

        var aMemory = {
            root: Memory,
            path: ['game','respawnRoom'],
        };

        var aRoomName = {
            new: _.findKey(Game.rooms),
            last: _.get(aMemory.root,aMemory.path),
        }

        if (aRoomName.new != aRoomName.last)
        {
            console.log('RESPAWN .........');
            this.cleanMemory();
            _.set(aMemory.root,aMemory.path,aRoomName.new);
        }
    }

    cleanMemory()
    {
        for(let f in Game.flags)
        {
            Game.flags[f].remove();
        }
        _.each(_.keys(Memory),(aKey) => delete Memory[aKey]);
        //RawMemory.set('');
    }
}

module.exports = RespawnOperation;
