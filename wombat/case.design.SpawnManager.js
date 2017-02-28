/**
 *  SPAWNMANAGER: this class should be the handler for all spawning actions and its decisions
 *  - needs a spawn queue and a register function where every Operation can put its spawns
 *
 *  - TODO: think a bit about the whole concept
 */
class SpawnManager
{
    constructor()
    {
        this.mSpawns = Game.spawns;
        this.mQueue = {};
    }

    registerSpawn()
    {

    }
}
module.exports = SpawnManager;
