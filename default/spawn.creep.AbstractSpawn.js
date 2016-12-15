class AbstractSpawn
{
    constructor(roleName)
    {
        this.myName = roleName;
    }

    toString()
    {
        return this.myName;
    }

    isSpawnActive()
    {
        return false;
    }

    isSpawnValid(pSpawn)
    {
        if (!this.isSpawnActive())
        {
            logWARN(' Spawn '+this.myName+' is not active!');
        }
        return this.isSpawnActive() && !_.isUndefined(pSpawn) && !pSpawn.spawning;
    }

    getBody(pEnergyAvailable,pEnergyCapacity)
    {
        logERROR('AbstractSpawn - has no body (overload this method) ... ');
        return undefined;
    }

    processSpawn(pSpawn)
    {
        logERROR('AbstractSpawn - can not process anything (overload this method) ...');
    }

    print()
    {
        logDEBUG('STATS for spawn '+this.myName+' bla bla bla');
    }
}
module.exports = AbstractSpawn;
