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
        _.each(this.mTags, (aT,aKey) =>
        {
            Log(LOG_LEVEL.profile,'sum '+aKey+' -> '+this.mCounts[aKey]+' -> '+aT.toFixed(4));
        })
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
