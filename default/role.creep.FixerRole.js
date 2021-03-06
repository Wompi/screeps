class FixerRole extends require('role.creep.AbstractRole')
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
        logDEBUG('FIXER ROLE PROCESSED.....');
        if (!this.isRoleValid(pCreep)) return;

        var aRoom = pCreep.room;

        var myRoomContainers  = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.container);
        var myRoomSpawns  = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.spawn);
        var myRoomResources  = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.resource);
        var myRoomLinks  = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.link);
        var myRoomExtensions  = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.extension);
        //var myRoomTowers  = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.tower);

        var myContainers = _.filter(myRoomContainers, (aBox) => { return aBox.store[RESOURCE_ENERGY] > 0 });
        var myLinks = _.filter(myRoomLinks, (aLink) => { return aLink.energy > 0 });
        //var myExtensions = _.filter(myRoomExtensions, (aExtension) => { return aExtension.energy > 0 });
        //var myTowers = _.filter(myRoomTowers, (aTower) => { return aTower.energy > 0 });

        _.forEach(myLinks, (aLink) => { myContainers.push(aLink);});
        //_.forEach(myExtensions, (aExtension) => { myContainers.push(aExtension);});
        //_.forEach(myTowers, (aTower) => { myContainers.push(aTower);});


        if (!_.isUndefined(aRoom.storage) && aRoom.storage.store[RESOURCE_ENERGY] > 0)
        {
            myContainers.push(aRoom.storage);
        }

        if (!_.isUndefined(aRoom.terminal) && aRoom.terminal.store[RESOURCE_ENERGY] > 0)
        {
            myContainers.push(aRoom.terminal);
        }


        var aResource = myRoomResources[0];
        var aSpawn = myRoomSpawns[0];
        var aCloseContainer = undefined;
        if (myContainers.length > 0)
        {
            aCloseContainer = _.min(myContainers, (a) =>
            {
                //logERROR('DERP ---- '+a);
                var result = a.pos.getRangeTo(pCreep);
                return result;
            });
        }

        var ignore = true;
        if (!_.isUndefined(aSpawn))
        {
            // if (pCreep.pos.inRangeTo(aSpawn,3))
            // {
            //     ignore = false;
            // }

            if (pCreep.pos.isNearTo(aSpawn.pos) && (pCreep.getLiveRenewTicks() > 0))
            {
                logDEBUG('FIXER '+pCreep.name+' waites for full repair at ['+aSpawn.pos.x+' '+aSpawn.pos.y+'] .. ');
                // wait till full repair

                //TODO: consider repairing nearby strucures here aswelll

                return;
            }
        }

        if (pCreep.carry.energy == 0 && (_.isUndefined(aCloseContainer) || !pCreep.pos.isNearTo(aCloseContainer.pos)))
        {
            if (_.isUndefined(aCloseContainer))
            {
                logDERP(JSON.stringify(aResource))
                if (!_.isUndefined(aResource))
                {
                    if (pCreep.pos.isNearTo(aResource))
                    {
                        pCreep.pickup(aResource);
                    }
                    var result = pCreep.travelTo(aResource);
                }

            }
            else
            {
                var result = pCreep.travelTo(aCloseContainer);
                logDEBUG('FIXER: moves needs restock and moves to closest box ['+aCloseContainer.pos.x+' '+aCloseContainer.pos.y+'] .. '+ErrorSting(result));
            }
        }
        else
        {
            if (pCreep.carry.energy < pCreep.carryCapacity && !_.isUndefined(aCloseContainer) && pCreep.pos.isNearTo(aCloseContainer.pos))
            {
                var result = pCreep.withdraw(aCloseContainer,RESOURCE_ENERGY);
                logDEBUG('FIXER: grabs resources from closest box ['+aCloseContainer.pos.x+' '+aCloseContainer.pos.y+']'+ErrorSting(result));
            }

            var myRepair = this.findRepairObject(pCreep,aRoom);

            var myTarget = pCreep.memory.target;

            if (!_.isUndefined(myRepair))
            {
                var result = pCreep.repair(myRepair.repairStructure);
                logDEBUG('FIXER repairs structure at ['+myRepair.emergency+']['+myRepair.repairStructure.pos.x+' '+myRepair.repairStructure.pos.y+'] - '+myRepair.repairStructure.structureType+' .. '+ErrorSting(result));
            }

            if (pCreep.pos.isEqualTo(myTarget.x,myTarget.y))
            {
                var roomGraph = Room.FIXER_GRAPH[pCreep.room.name];
                //pCreep.memory.target = pCreep.memory.endPoints[pCreep.memory.target.next];
                pCreep.memory.target = roomGraph[pCreep.memory.target.next];
                logDEBUG('FIXER adjusts target position ..');
            }

            if (pCreep.ticksToLive < 200)
            {

//                var result = pCreep.moveTo(aSpawn,{ ignoreCreeps: ignore, range: 1});
                var result = pCreep.travelTo(aSpawn);
                logDEBUG('FIXER needs repair and moves to spawn ... '+ErrorSting(result));
            }
            else if (!_.isUndefined(myRepair) && myRepair.emergency)
            {
                pCreep.say('Oh boy!');

                var myPos = pCreep.pos.look();
                logDERP('MY POS = '+JSON.stringify(_.countBy(myPos,'type')));

                var derp = _.findKey(myPos,'structure');
                if (!_.isUndefined(derp))
                {
                    logDERP('derp = '+JSON.stringify(derp));
                    var myEmptySpots = _.filter(pCreep.pos.findEmptyNearbySpot(),(a) =>
                    {
                        var aLook = a.look();
                        var aRange = a.getRangeTo(myRepair.repairStructure);
                        var aLookTypes = _.countBy(aLook,'type');
                        //logDERP(' pos ['+a.x+' '+a.y+']  ---- > ['+myRepair.repairStructure.pos.x+' '+myRepair.repairStructure.pos.y+']' );
                        //logDERP(' pos ['+a.x+' '+a.y+'] ['+aRange+'] - '+JSON.stringify(aLookTypes));

                        return (aRange < 4 && _.keys(aLookTypes).length == 1);
                    });

                    //logDERP(' emptySpots: '+myEmptySpots.length)
                    //logDERP(JSON.stringify(myEmptySpots));
                    if (myEmptySpots.length > 0)
                    {
                        //var result = pCreep.moveTo(myEmptySpots[0]);
                        var result = pCreep.travelTo({pos:myEmptySpots[0]});
                        logDEBUG('FIXER steps aside for emergency repair! .. '+ErrorSting(result));
                    }
                }
            }
            else
            {
                // var result = pCreep.moveTo(new RoomPosition(myTarget.x,myTarget.y,pCreep.room.name),{ ignoreCreeps: ignore});
                var result = pCreep.travelTo({pos:new RoomPosition(myTarget.x,myTarget.y,pCreep.room.name)});
                logDEBUG('FIXER moves to target position ['+myTarget.x+' '+myTarget.y+']... '+ErrorSting(result));
            }
        }
    }

    findRepairObject(pCreep,pRoom)
    {
        var result = undefined;
        var aArea =
        {
            top:        _.max([(pCreep.pos.y-3), 0] ),
            left:       _.max([(pCreep.pos.x-3), 0] ),
            bottom:     _.min([(pCreep.pos.y+3),49] ),
            right:      _.min([(pCreep.pos.x+3),49] ),
        };
        var hasEmergency = false;
        var myStructuresInRange = pRoom.lookForAtArea(LOOK_STRUCTURES,aArea.top,aArea.left,aArea.bottom,aArea.right,true);
        if (myStructuresInRange.length == 0) return undefined;

        var myFixables = _.filter(myStructuresInRange,(a) =>
        {
            //return (a.structure.hitsMax - a.structure.hits) >= (REPAIR_POWER * pCreep.getActiveBodyparts(WORK));
            return (a.structure.hitsMax - a.structure.hits) >= (REPAIR_POWER);
        });
        if (myFixables.length == 0) return undefined;
        var aFix = _.min(myFixables, (a) =>
        {
            return a.structure.hits * 100 / a.structure.hitsMax;
        })
        result = Game.getObjectById(aFix.structure.id);
        return {
                    repairStructure: result,
                    emergency: ((_.isNull(result)) ? false : ((result.hits * 100 / result.hitsMax) < 80)),
                };
    }
};

module.exports = FixerRole;
