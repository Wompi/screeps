class Profiler
{
    constructor()
    {
        this.mTags = {};
        this.mCounts ={};
    }

    // Designed for use with arrow functions
    // measure( () => stuff )
    profile(fn, tag = '', args = [])
    {
    	let a = Game.cpu.getUsed();
    	fn.apply(null, args);
    	let b = Game.cpu.getUsed();
        Log(LOG_LEVEL.profile,tag+' -> '+(b-a).toFixed(4));
    }

    register(fn, tag = '', args = [])
    {
    	let a = Game.cpu.getUsed();
    	fn.apply(null, args);
    	let b = Game.cpu.getUsed();
        _.set(this.mTags,tag,_.get(this.mTags,tag,0)+(b-a));
        _.set(this.mCounts,tag,_.get(this.mCounts,tag,0)+1);
    }

    printRegister()
    {
        let aList = _.map(this.mTags, (aT,aKey) =>
        {
            return {cpu: aT, tag: aKey};
        });

        aList = _.sortByOrder(aList,'cpu','asc');

        _.each(aList, (a) =>
        {
            Log(LOG_LEVEL.profile,this.mCounts[a.tag]+'\t-> '+a.cpu.toFixed(4)+' ('+(a.cpu/this.mCounts[a.tag]).toFixed(3)+') <- sum '+a.tag);
        });


        this.cleanRegister();
    }

    cleanRegister()
    {
        this.mTags = {};
        this.mCounts ={};
    }

    print()
    {
        console.log('Profiler .......');
    }
}
module.exports = Profiler;
