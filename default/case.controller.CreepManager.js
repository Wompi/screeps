class CreepManager
{
    constructor()
    {
        this.mCreeps = {};
    }

    getCreepsForRole(pRole)
    {
        if (_.isUndefined(pRole)) return;
        var result = this.mCreeps[pRole];
        return ( result == undefined ? [] : result );
    }

    registerCreep(pCreep)
    {
        if (_.isUndefined(pCreep)) return;
        var aRole = pCreep.myRole;
        if (_.isUndefined(aRole)) return;

        var value = this.mCreeps[aRole.toString()];


        if (_.isUndefined(value))
        {
            this.mCreeps[aRole.toString()] = [];
        }
        this.mCreeps[aRole.toString()].push(pCreep);
        return this.mCreeps[aRole.toString()];
    };

    printReport()
    {
        var aHeader = ['role','count'];
        var aReport = [];
        _.forEach(_.keys(this.mCreeps), (aKey) =>
        {
            aReport.push([aKey,this.mCreeps[aKey].length]);

        });

        var aTable = Test.table(aHeader,aReport);
        logDERP(aTable);


    }
}
module.exports = CreepManager;
