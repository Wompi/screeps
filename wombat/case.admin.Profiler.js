class Profiler
{
    constructor()
    {

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

    print()
    {
        console.log('Profiler .......');
    }
}
module.exports = Profiler;
