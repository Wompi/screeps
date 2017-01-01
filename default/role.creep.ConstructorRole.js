class ConstructorRole extends require('role.creep.AbstractRole')
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
        logDEBUG('BUILDER ROLE PROCESSED.....');
        if (!this.isRoleValid(pCreep)) return;

        var aRoom = pCreep.room;
        var myRoomSpawns = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.spawn);
        if (myRoomSpawns.length == 0) return;
        var aSpawn = myRoomSpawns[0];

        var myRoomConstructionSites = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.constructionSite);
        myRoomConstructionSites = myRoomConstructionSites.reverse();
        if (myRoomConstructionSites.length == 0)
        {
            this.moveToRecycle(aRoom,pCreep,aSpawn);
            this.removeFlags();
            return;
        }

        var check = this.handleFags(aRoom,pCreep,myRoomConstructionSites);
        var aFlag = check.flag;
        var aSite = check.site;
        if (_.isUndefined(aFlag)) return;

        var aBox = this.findEnergyContainer(aRoom,pCreep);
        //logDERP('aBox = '+aBox.structureType);
        if (_.isUndefined(aBox)) return;

        var ignore = true;
        if (pCreep.pos.inRangeTo(aSpawn,3))
        {
            ignore = false;
        }

        if (pCreep.ticksToLive < 100 )
        {
            var result = pCreep.moveTo(aSpawn.pos,{ignoreCreeps: ignore});
            logDEBUG('BUILDER '+pCreep.name+' back to spawn for emergency repair ... '+ErrorSting(result));
            return;
        }

        if (pCreep.carry.energy == 0 && !pCreep.pos.isNearTo(aBox.pos))
        {
            var result = pCreep.moveTo(aBox, {ignoreCreeps: ignore});
            logDEBUG('BUILDER '+pCreep.name+' moves to closest box ['+aBox.pos.x+' '+aBox.pos.y+'] .. ' +ErrorSting(result));
        }
        else
        {
            // adjust this when we have more spawns in a room
            if (pCreep.pos.isNearTo(aSpawn.pos) && (pCreep.getLiveRenewTicks() > 0))
            {
                logDEBUG('BUILDER '+pCreep.name+' waites for full repair .. ');
                // wait till full repair
                return;
            }



            if (pCreep.ticksToLive < 500 && pCreep.pos.getRangeTo(aSpawn.pos) < 3)
            {
                var result = pCreep.moveTo(aSpawn.pos,{ignoreCreeps: ignore});
                logDEBUG('BUILDER '+pCreep.name+' back to spawn for fixup repair ... '+ErrorSting(result));
            }


            var isReloading = pCreep.pos.isNearTo(aBox.pos) && pCreep.carry.energy < pCreep.carryCapacity;
            if (isReloading)
            {
                var result = pCreep.withdraw(aBox,RESOURCE_ENERGY);
                logDEBUG('BUILDER '+pCreep.name+' grabs from closest box .. ' +ErrorSting(result));
            }

            if (!pCreep.pos.isEqualTo(aFlag.pos) )
            {
                var result = pCreep.moveTo(aFlag,{ignoreCreeps: ignore});
                logDEBUG('BUILDER '+pCreep.name+' moves to flag ['+aFlag.pos.x+' '+aFlag.pos.y+'].. ' +ErrorSting(result));
            }

            if (pCreep.pos.getRangeTo(aSite) < 4)
            {
                var result = pCreep.build(aSite);
                logDEBUG('BUILDER '+pCreep.name+' builds a construction ['+aSite.pos.x+' '+aSite.pos.y+'].. ' +ErrorSting(result));
            }

            logDERP('-------------------- BUILDER ---------------------');
        }
    }

    findEnergyContainer(pRoom,pCreep)
    {
        var myRoomContainers = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.container);
        var myRoomLinks = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.link);
        var myRoomExtensions = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.extension);

        var myContainers = _.filter(myRoomContainers, (a) => { return (a.store[RESOURCE_ENERGY] > 0 ) });
        var myLinks = _.filter(myRoomLinks, (a) => { return (a.energy > 0) });
        var myExtensions = _.filter(myRoomExtensions, (a) => { return (a.energy > 0) });

        myContainers  =myContainers.concat(myLinks);


        var aStorage = pRoom.storage;
        if (!_.isUndefined(aStorage) && aStorage.store[RESOURCE_ENERGY] > 0 )
        {
            var derp = _.filter(myLinks, (a) =>
            {
                return a.pos.isNearTo(pCreep);
            });
            if (derp.length == 0)
            {
                myContainers.push(aStorage);
            }
        }

        var aBox = undefined;
        if (myContainers.length == 0)
        {
            //hmmm think about what to do when we have no box
            // this needs adjustment the first source might not the one who has the miner on it
            // also if it has no mining box - well derp
            //aBox = room.myMiningSources[0].myMiningBoxes[0];
            return undefined;
        }
        // TODO: this should be a function with amount of energy and range - but fo now it should be ok
        return _.min(myContainers, (a) => { return a.pos.getRangeTo(pCreep) ;})
    }

    handleFags(pRoom,pCreep,pConstructionSites)
    {
        var result = { flag: undefined, site: undefined };
        var myFlagNames = (Flag.findName(Flag.FLAG_COLOR.construction.primaryConstruction,pRoom));
        var myAllFlags = myFlagNames.concat(Flag.findName(Flag.FLAG_COLOR.construction,pRoom));
        if (myAllFlags.length == 0 )
        {
            logERROR('BUILDER '+pCreep.name+' has construction sites but NO FLAGS .. place some to start!');
            return result;
        }

        var aFlag = Flag.getClosestFlag(pCreep.pos,myAllFlags);

        var isValid = false;
        var aSite = undefined;
        for (var bSite of pConstructionSites)
        {
            if (bSite.pos.inRangeTo(aFlag.pos,3))
            {
                isValid = true;
                aSite = bSite;
                break;
            }
            // here we could try some priority but it should be ok to just take whater is last in the list
        }

        if (!isValid)
        {
             // not quite the solution - if the construction point is finished we remove the flag and
             // wait for the next tick
            aFlag.remove();
            return result;
        }

        return { flag: aFlag, site: aSite }
    }

    moveToRecycle(pRoom,pCreep,pSpawn)
    {
        //logERROR('BUILDER move to recycle not implemented yet!');
        var recyclePos = Room.RECYCLE_POSITIONS[pRoom.name];

        if (_.isUndefined(recyclePos))
        {
            logERROR('ROOM '+pRoom.name+' HAS NO RECYCLE POSITION - adjust this in Room.RECYCLE_POSITIONS!');
            return;
        }

        if (pCreep.pos.isEqualTo(recyclePos[0].x,recyclePos[0].y))
        {
            var result = pSpawn.recycleCreep(pCreep);
            logWARN('BUILDER '+pCreep.name+' is recycled  .. ' +ErrorSting(result));
        }
        else
        {
            var result = pCreep.moveTo(new RoomPosition(recyclePos[0].x,recyclePos[0].y,pRoom.name),{ignoreCreeps: true});
            logWARN('BUILDER '+pCreep.name+' moves to recycle postion .. ' +ErrorSting(result));
        }
    }

    removeFlags()
    {
        logERROR('BUILDER remove flags not implemented yet!');
    }

}
module.exports = ConstructorRole;
