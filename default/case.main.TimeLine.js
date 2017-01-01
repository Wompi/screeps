class TimeLine
{
    constructor()
    {
        this.mTime = Game.time;
        this.mEvents = {};
    }

    populateCreeps()
    {
        _.forEach(Game.creeps, (aCreep) =>
        {
            var aSpawn =aCreep.pos.findClosestSpawn();
            var aLive = _.isUndefined(aCreep.ticksToLive) ? CREEP_LIFE_TIME : aCreep.ticksToLive

            var aSpawnOffset = 0;
            if (aCreep.spawning)
            {
                _.forEach(Game.spawns, (aSpawn) =>
                {
                    var aSpawnInfo = aSpawn.spawning;
                    if (!_.isNull(aSpawnInfo))
                    {
                        logDERP('Spawn: '+aSpawn.name+' Info: '+JSON.stringify(aSpawnInfo));
                        if (_.isEqual(aSpawnInfo.name,aCreep.name))
                        {
                            aSpawnOffset = aSpawnInfo.remainingTime;
                        }
                    }
                });
            }
            var aDead = this.mTime + aLive + aSpawnOffset;
            logDERP('Name: '+aCreep.name+' Dead: '+aDead+' Rest: '+(aLive + aSpawnOffset) +' Spawn: '+aSpawn.goal.name+' ('+aSpawn.length+')');
            if (_.isUndefined(this.mEvents[aDead]))
            {
                this.mEvents[aDead] = [];
            }
            this.mEvents[aDead].push(aCreep.name);
        });

        // delete Memory.test;
        // Memory.test = this.mEvents;


        var aSort = _.sortBy(_.keys(this.mEvents));

        _.forEach(aSort, (a,b) =>
        {
            if (b > 0)
            {
                logDERP('D: '+(aSort[b]-aSort[b-1])+' items: '+JSON.stringify(this.mEvents[a]))
            }
            else
            [
                logDERP('D: '+(aSort[b]-Game.time)+' items: '+JSON.stringify(this.mEvents[a]))
            ]
        })





    }
}
module.exports = TimeLine;
