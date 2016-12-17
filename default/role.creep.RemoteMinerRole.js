class RemoteMinerRole extends require('role.creep.AbstractRole')
{
    constructor(roleName)
    {
        super(roleName)
    }

    isRoleActive()
    {
        return true;
    }

    processRole(pCreep)
    {
        logDERP('REMOTE MINER ROLE PROCESSED.....');
        if (!this.isRoleValid(pCreep)) return;

        var myFlagNames = _.filter(Game.flags,Flag.FLAG_COLOR.remote.miner.filter);
        if (myFlagNames.length == 0 )
        {
            // TODO: if nothing is to do consider moving to recycle position
            return;
        }
        var myFlag = _.min(myFlagNames, (a) => { return a.pos.getRangeTo(pCreep)});

        var myTask =
        {
            aCreep: pCreep,
            aRoom: pCreep.room,
            aSource: undefined,
            aFlag: myFlag,

            aMove: undefined,
            aHarvest: undefined,
            aBuild: undefined,
            aRepair: undefined,

        }
        myTask = this.assignMoveTarget(myTask);
        myTask = this.assignHarvestTarget(myTask);
        myTask = this.assignBuildTarget(myTask);
        myTask = this.assignRepairTarget(myTask);


        // moveTask
        if (!_.isUndefined(myTask.aMove))
        {
            var result = pCreep.moveTo(myTask.aMove,{ignoreCreeps: true});
            logDERP('REMOTE MINER '+myTask.aCreep.name+' moves to source ['+myTask.aMove.pos.x+' '+myTask.aMove.pos.y+'] .. '+ErrorSting(result));
        }


        if (!_.isUndefined(myTask.aHarvest))
        {
            var result = myTask.aCreep.harvest(myTask.aHarvest);
            logDERP('REMOTE MINER '+myTask.aCreep.name+' harvests source ['+myTask.aHarvest.pos.x+' '+myTask.aHarvest.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aBuild))
        {
            var result = pCreep.build(myTask.aBuild);
            logDERP('REMOTE MINER '+myTask.aCreep.name+' builds ['+myTask.aBuild.pos.x+' '+myTask.aBuild.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aRepair))
        {
            var result = pCreep.repair(myTask.aRepair);
            logDERP('REMOTE MINER '+myTask.aCreep.name+' repairs ['+myTask.aRepair.pos.x+' '+myTask.aRepair.pos.y+'] .. '+ErrorSting(result));
        }

        logDERP(' -------------------------- REMOTE MINER ----------------------');
    }

    assignMoveTarget(pTask)
    {
        if (!pTask.aCreep.pos.isNearTo(pTask.aFlag))
        {
            pTask.aMove = pTask.aFlag;
        }
        return pTask;
    }

    assignHarvestTarget(pTask)
    {

        if (pTask.aCreep.pos.isNearTo(pTask.aFlag))
        {
            var mySource = pTask.aRoom.find(FIND_SOURCES,
            {
                filter: (a) =>
                {
                    return pTask.aCreep.pos.isNearTo(a);
                }
            });
            if (mySource.length == 0)
            {
                logERROR('REMOTE MINER is at FLAG but ther eis nor mining source .. fix this!');
                return;
            }
            var aSource = mySource[0];

            if (aSource.energy == 0) return pTask;


            var myStructures = pTask.aRoom.find(FIND_STRUCTURES,
            {
                filter: (a) =>
                {
                    return     a.structureType == STRUCTURE_CONTAINER
                            && pTask.aCreep.pos.isNearTo(a)
                }
            });
            if (myStructures.length != 0)
            {
                var aBox = myStructures[0];
                logDERP(' ----------DERP --------');
                if (aBox.getDeltaCapacity() >= (pTask.aCreep.getActiveBodyparts(WORK)*HARVEST_POWER))
                {
                    pTask.aHarvest = aSource;
                }
                else
                {
                    logDEBUG('REMOTE MINER '+pTask.aCreep.name+' box at ['+aBox.pos.x+' '+aBox.pos.y+'] is full - stopped harvesting!');
                }
            }
            else
            {
                // TODO: drop mining - test this
                pTask.aHarvest = aSource;
            }
        }
        return pTask;
    }

    assignBuildTarget(pTask)
    {
        if (pTask.aCreep.pos.isNearTo(pTask.aFlag))
        {
            var mySites = _.filter(Game.constructionSites, (a) =>
            {
                return pTask.aCreep.pos.inRangeTo(a,3);
            })
            if (mySites.length == 0) return pTask;

            var myStructures = pTask.aRoom.find(FIND_STRUCTURES,
            {
                filter: (a) =>
                {
                    return     a.structureType == STRUCTURE_CONTAINER
                            && pTask.aCreep.pos.isNearTo(a)
                }
            });
            if (myStructures.length == 0)
            {
                pTask.aBuild = mySites[0];
            }
            else
            {
                var aBox = myStructures[0];
                if (_.sum(aBox.store) > 1000)
                {
                    pTask.aBuild = mySites[0];
                }
            }
        }
        return pTask;
    }

    assignRepairTarget(pTask)
    {
        if (pTask.aCreep.pos.isNearTo(pTask.aFlag))
        {
            // var mySource = pTask.aRoom.find(FIND_SOURCES,
            // {
            //     filter: (a) =>
            //     {
            //         return pTask.aCreep.pos.isNearTo(a);
            //     }
            // });
            // if (mySource.length == 0)
            // {
            //     logERROR('REMOTE MINER is at FLAG but ther eis nor mining source .. fix this!');
            //     return;
            // }
            // var aSource = mySource[0];
            //if (aSource.energy == 0)
            {
                var myStructures = pTask.aRoom.find(FIND_STRUCTURES,
                {
                    filter: (a) =>
                    {
                        var wP = pTask.aCreep.getActiveBodyparts(WORK);
                        var needRepair = (a.hitsMax - a.hits) > (wP * REPAIR_POWER);
                        var hasEnergy = pTask.aCreep.carry.energy >= wP * 5;
                        var inRange = pTask.aCreep.pos.inRangeTo(a,3);

                        return      (      a.structureType == STRUCTURE_ROAD
                                        || a.structureType == STRUCTURE_CONTAINER
                                    )
                                    && inRange
                                    && needRepair
                                    && hasEnergy;
                    }
                });
                if (myStructures.length == 0) return pTask;
                pTask.aRepair = myStructures[0];
            }
        }
        return pTask;
    }

}
module.exports = RemoteMinerRole
