var statsLogistics = require('stats.logistics');

var roleHauler = {

    /** @param {Creep} creep **/
    run: function(creep)
    {
        if (creep.memory.isHauling == true && creep.carry.energy == 0)
        {
            creep.memory.isHauling = false;
        }
        if (creep.memory.isHauling == false && creep.carry.energy == creep.carryCapacity)
        {
            creep.memory.isHauling = true;
        }
        if (creep.memory.isHauling == undefined)
        {
            creep.memory.isHauling = false;
        }

	    if(creep.memory.isHauling == false)
	    {
            var miningBox = statsLogistics.getMiningBox();
            if (miningBox != undefined && miningBox.store[RESOURCE_ENERGY] > 0)
            {
                if(creep.withdraw(miningBox,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(miningBox);
                    creep.say('Miningbox..');
                }
            }
            else
            {
                console.log('WARN: hauler has no miningbox!');
            }
        }
        else
        {
            var myDeliverBox = statsLogistics.getClosestBox(false,creep);
            if (myDeliverBox != undefined)
            {
                if(creep.transfer(myDeliverBox, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(myDeliverBox);
                    creep.say('Box..');
                }
                else
                {
                    creep.say('Transfer!');
                }
            }
            else
            {
                console.log('WARN: hauler has no delivery box');
            }

        }
	}
};
module.exports = roleHauler;
