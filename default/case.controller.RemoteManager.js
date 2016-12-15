class RemoteManager
{
    constructor()
    {
    }

    toString()
    {
        return 'RemoteManager';
    }

    process()
    {
        this.processSpawns();
        this.processCreeps();
    }

    processSpawns()
    {
        // TODO: Ahhhhhhhhhh... this needs a very big redesign .. the wholeremote stuff is messy as hell
        var aSpawn = Game.spawns['Casepool'];
        if (_.isUndefined(aSpawn)) return;
        var myRoomSpawns =
        [
            new CREEP_ROLE['remote builder'].spawn('remote builder'),
            new CREEP_ROLE['remote claimer'].spawn('remote claimer'),
        ];
        _.forEach(myRoomSpawns, (a) => { a.processSpawn(aSpawn); });
    }

    processCreeps()
    {
        var myCreeps = _.filter(Game.creeps,(a) =>
        {
            return a.memory.role == 'remote builder'
                    || a.memory.role == 'remote claimer'
        });
        for (var aCreep of myCreeps)
        {
            aCreep.processRole();
        }
    }
};
module.exports = RemoteManager;
