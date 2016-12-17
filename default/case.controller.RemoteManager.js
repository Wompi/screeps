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
        // TODO: Ahhhhhhhhhh... this needs a very big redesign .. the whole remote stuff is messy as hell
        var aSpawn = Game.spawns['Nexuspool'];
        if (_.isUndefined(aSpawn)) return;
        var myRoomSpawns =
        [
            new CREEP_ROLE['remote builder'].spawn('remote builder'),
            new CREEP_ROLE['remote claimer'].spawn('remote claimer'),
            new CREEP_ROLE['dismantle'].spawn('dismantle'),
            new CREEP_ROLE['remote miner'].spawn('remote miner'),
            new CREEP_ROLE['remote miner hauler'].spawn('remote miner hauler'),
            new CREEP_ROLE['remote reserve'].spawn('remote reserve'),
        ];
        _.forEach(myRoomSpawns, (a) => { a.processSpawn(aSpawn); });
    }

    processCreeps()
    {
        var myCreeps = _.filter(Game.creeps,(a) =>
        {
            return      a.memory.role == 'remote builder'
                    ||  a.memory.role == 'remote claimer'
                    ||  a.memory.role == 'dismantle'
                    ||  a.memory.role == 'remote miner hauler'
                    ||  a.memory.role == 'remote miner'
                    ||  a.memory.role == 'remote reserve'

        });
        for (var aCreep of myCreeps)
        {
            aCreep.processRole();
        }
    }
};
module.exports = RemoteManager;
