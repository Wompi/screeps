class RoomTraderManager
{
    constructor()
    {
    }

    toString()
    {
        return 'RoomTraderManager';
    }

    process()
    {
        this.processSpawns();
        this.processCreeps();
    }

    processSpawns()
    {
        var aSpawn = Game.spawns['Nexuspool'];
        if (_.isUndefined(aSpawn)) return;
        var myRoomSpawns =
        [
            new CREEP_ROLE['room trader'].spawn('room trader'),

        ];
        _.forEach(myRoomSpawns, (a) => { a.processSpawn(aSpawn); });
    }

    processCreeps()
    {
        var myCreeps = _.filter(Game.creeps,(a) => { return a.memory.role == 'room trader'});

        for (var aCreep of myCreeps)
        {
            aCreep.processRole();
        }
    }
};
module.exports = RoomTraderManager;
