var statsLogistics =
{
    run: function()
    {

	},

    getCreepEnergy: function()
    {
        var allCreepEnergy = 0;
        for (var name in Game.creeps)
        {
            var creep = Game.creeps[name];

            var myEnergy = creep.carry[RESOURCE_ENERGY];
            //console.log(creep.memory.role + ' ' +creep.name + ' - ' + myEnergy);
            allCreepEnergy = allCreepEnergy + myEnergy;
        }
        console.log('ALL CREEP ENERGY: ' + allCreepEnergy);
    },

    getExtensionEnergy: function()
    {
        for (var structureID in Game.structures)
        {
                var structure = Game.structures[structureID];
                console.log('STRUCTURE: ' + structure.structureType + ' ACTIVE: ' + structure.isActive());
        }
    },

    getScatterEnergy: function()
    {
        var scatterEnergys = Game.rooms['E66N49'].find(FIND_DROPPED_RESOURCES);

        for ( var scatterID in scatterEnergys)
        {
            var carryCreep = this.getCreepCloseTo(scatterEnergys[scatterID]);
            if (carryCreep != undefined)
            {
                console.log('SCATTER ENERGY: '+scatterEnergys.length +' POS: '+scatterEnergys[scatterID].pos.x+' '
                +scatterEnergys[scatterID].pos.y+' AMOUNT: '+scatterEnergys[scatterID].amount+' CLOSEST: '+carryCreep.name);
            }
            else
            {
                console.log('SCATTER ENERGY: '+scatterEnergys.length +' POS: '+scatterEnergys[scatterID].pos.x+' '
                +scatterEnergys[scatterID].pos.y+' AMOUNT: '+scatterEnergys[scatterID].amount+' CLOSEST: undefined');
            }
        }
    },

    getExtentionCloseTo: function(sourcePos)
    {
        var myClosestExtension = sourcePos.pos.findClosestByRange(FIND_STRUCTURES,
        {
            filter: (myExt) =>
            {
                return (myExt.structureType == STRUCTURE_EXTENSION
                            && myExt.energy < myExt.energyCapacity);
            }
        });
        return myClosestExtension;
    },


    getCreepCloseTo: function(sourcePos)
    {
        var myClosestCreep = sourcePos.pos.findClosestByRange(FIND_MY_CREEPS,
        {
            filter: (myCreep) =>
            {
                return (myCreep.getActiveBodyparts(CARRY) > 0 && myCreep.carry[RESOURCE_ENERGY] < myCreep.carryCapacity);
            }
        });
        return myClosestCreep;
    },

    getMiningBox: function()
    {
        var myStructures = Game.rooms['E66N49'].lookForAt(LOOK_STRUCTURES,41,41);

        var miningBox = undefined;
        if (myStructures.length)
        {
            for (var structureID in myStructures)
            {
                if (myStructures[structureID].structureType == STRUCTURE_CONTAINER)
                {
                    miningBox = myStructures[structureID];
                    //console.log('MININGBOX['+structureID+']: '+myStructures[structureID].store[RESOURCE_ENERGY]+' LENGTH: '+myStructures.length);
                }
            }
        }
        else
        {
            console.log('NO MINING BOX FOUND!');
        }
        return miningBox;
    },

    getClosestBox: function(withMiningBox, sourcePos)
    {
        var myClosestBox = sourcePos.pos.findClosestByRange(FIND_STRUCTURES,
        {
            filter: (myBox) =>
            {
                return (myBox.structureType == STRUCTURE_CONTAINER
                    && ((withMiningBox) ? true : myBox.pos.x != 41 && myBox.pos.y != 41)
                    && myBox.store[RESOURCE_ENERGY] < myBox.storeCapacity
                );
            }
        })
        return myClosestBox;
    },

    getClosestEnergyBox:function(sourcePos)
    {
        var myClosestBox = sourcePos.pos.findClosestByRange(FIND_STRUCTURES,
        {
            filter: (myBox) =>
            {
                return (myBox.structureType == STRUCTURE_CONTAINER
                    && myBox.store[RESOURCE_ENERGY] > 0
                );
            }
        })
        return myClosestBox;
    }

};

module.exports = statsLogistics;
