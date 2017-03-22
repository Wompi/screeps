class SpawnManager
{
    constructor()
    {
        this.mSpawnStats = {};
    }

    makeStats()
    {
        _.each(Game.creeps,(aC) =>
        {
            if (!aC.spawning)
            {
                let aSpawn = aC.memory.spawn;
                if (!_.isUndefined(aSpawn))
                {
                    _.set(this.mSpawnStats,[aSpawn,aC.id],
                    {
                        live: aC.ticksToLive,
                        spawnTime: aC.spawnTime,
                        tick: Game.time + aC.ticksToLive - (aC.getActiveBodyparts(CLAIM) ? CREEP_CLAIM_LIFE_TIME : CREEP_LIFE_TIME),
                        energy: aC.cost,
                        spawn: aC.memory.spawn,
                    });
                }
            }
        });
    }



    printStats()
    {
        _.each(this.mSpawnStats, (aMap,aID) =>
        {
            let aSpawnWPos = WorldPosition.deserialize(aID);
            let aSpawnPos = aSpawnWPos.toRoomPosition();
            let aList = _.map(aMap);
            let myDelta = [];
            let myLive = [];
            let myCost = [];
            let myOFF = [];
            let aCost = 0;
            let aSpawnTime = 0;
            aList = _.sortBy(aList,'tick');
            _.each(aList, (aS,i) =>
            {
                if (i > 0)
                {
                    let a = aList[i].tick - aList[i-1].tick;
                    myDelta.push(a);
                    myOFF.push(a-aS.spawnTime);
                }
                aCost = aCost + aS.energy;
                aSpawnTime = aSpawnTime + aS.spawnTime;
                myLive.push(aS.live);
                myCost.push(aS.energy);
            })

            Log(LOG_LEVEL.debug,'CREEPS: spawn ['+aID+'] '+aSpawnWPos.toRoomPosition().toString()+' spawntime - '+aSpawnTime+' cost - '+aCost+' energy: '+Game.rooms[aSpawnPos.roomName].energyAvailable+'/'+Game.rooms[aSpawnPos.roomName].energyCapacityAvailable);
            Log(LOG_LEVEL.debug,'LIVE: '+myLive);
            Log(LOG_LEVEL.debug,'DELTA: '+myDelta);
            Log(LOG_LEVEL.debug,'COST: '+myCost);
            Log(LOG_LEVEL.debug,'OFF: '+myOFF);

        })
    }
}
module.exports = SpawnManager;
