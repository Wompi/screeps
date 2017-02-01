class ProfilerManager
{
    constructor()
    {
        this.mCreeps = {};
        this.mStart = undefined;
        this.mEnd = undefined;
    }


    start(pRole)
    {
        this.mStart = Game.cpu.getUsed();
    }

    end(pRole)
    {
        this.mEnd = Game.cpu.getUsed();

        if (_.isUndefined(this.mCreeps[pRole]))
        {
            this.mCreeps[pRole] = {
                cpu: 0,
                count: 0,
            };
        }

        this.mCreeps[pRole].cpu += this.mEnd - this.mStart;
        this.mCreeps[pRole].count += 1;
    }

    printReport()
    {
        for (var aID in this.mCreeps)
        {
            var aRole = this.mCreeps[aID];
            logWARN('PROFILE: '+aID+' cpu: '+aRole.cpu.toFixed(2)+' count: '+aRole.count);
        }
    }
}
module.exports = ProfilerManager;
