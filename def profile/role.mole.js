var statsLogistics = require('stats.logistics');

var roleMole = {

    /** @param {Creep} creep **/
    run: function(creep)
    {
        var sources = creep.room.find(FIND_SOURCES);

        var miningBox = statsLogistics.getMiningBox();
        if (miningBox != undefined)
        {
            var deltaCapacity =  miningBox.storeCapacity - miningBox.store[RESOURCE_ENERGY];
            if (deltaCapacity >= 10)
            {
                if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(41,41);
                }
                else
                {
                    creep.say('Mining!');
                }
            }
            else
            {
                //console.log('INFO: miningbox is full '+deltaCapacity);
            }
        }
	}
};

module.exports = roleMole;
