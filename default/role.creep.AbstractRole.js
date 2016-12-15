class AbstractRole
{
    constructor(roleName)
    {
        this.myName = roleName;
    }

    toString()
    {
        return this.myName;
    }

    isRoleActive()
    {
        return false;
    }

    isRoleValid(pCreep)
    {
        if (!this.isRoleActive())
        {
            logWARN(' Role '+this.myName+' is not active!');
        }
        return this.isRoleActive() && !_.isUndefined(pCreep) && !pCreep.spawning;
    }

    processRole(room)
    {
        logERROR('AbstractRole - can not process anything ...');
    }

    print()
    {
        logDEBUG('STATS for role '+this.myName+' bla bla bla');
    }
}
module.exports = AbstractRole;
