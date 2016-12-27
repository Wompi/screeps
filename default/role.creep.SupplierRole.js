class SupplierRole extends require('role.creep.AbstractRole')
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
        logDEBUG('SUPPLIER ROLE PROCESSED.....');
        if (!this.isRoleValid(pCreep)) return;

        var aRoom = pCreep.room;
        var myRoomSpawns  = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.spawn);
        //
        // var myRoomContainers  = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.container);
        // var myRoomResources  = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.resource);
        //
        // if (!_.isUndefined(aRoom.storage))
        // {
        //     myRoomContainers.push(aRoom.storage);
        // }
        //
        // var aRescource = myRoomResources[0];
        var aSpawn = myRoomSpawns[0];
        var aStorage = aRoom.storage;

        var mySuppliers = this.findSupplierTargets(aRoom);
        var aTower = this.processTowerSupply(aRoom,pCreep);

        if (pCreep.pos.isNearTo(aSpawn) && aSpawn.isEnergyNeeded())
        {
            var result = pCreep.transfer(aSpawn,RESOURCE_ENERGY);
            logDEBUG('SUPPLIER '+pCreep.name+' transfers ['+aSpawn.pos.x+' '+aSpawn.pos.y+'] ... '+ErrorSting(result));
        }

        if (!aSpawn.spawning && pCreep.pos.isNearTo(aSpawn) && (pCreep.getLiveRenewTicks() > 0))
        {
            logDEBUG('SUPPLIER '+pCreep.name+' waites for full repair at ['+aSpawn.pos.x+' '+aSpawn.pos.y+']');
            return;
        }

        if (pCreep.ticksToLive < 100 )
        {
            var result = pCreep.moveTo(aSpawn,{ignoreCreeps: true});
            logDEBUG('SUPPLIER '+pCreep.name+' back to spawn ['+aSpawn.pos.x+' '+aSpawn.pos.y+'] for emergency repair ... '+ErrorSting(result));
            return;
        }

        //
        if (_.sum(pCreep.carry) == 0)
        {
            var aNextOUT = undefined;
            _.forEach(mySuppliers.aOUT,(a) =>
            {
                var aCapacity = pCreep.carryCapacity;
                var aDelta = _.sum(a.store);
                var isValid = aDelta >= aCapacity;
                //logDERP('OUT BOX '+a.structureType+' valid: '+isValid+' c: '+aCapacity+' b: '+aDelta+' ['+a.pos.x+' '+a.pos.y+'] R: '+(_.sum(a.store) * 100 / a.storeCapacity).toFixed(2));

                if (isValid && _.isUndefined(aNextOUT)) aNextOUT = a;
                else if (isValid)
                {
                    var aFillRatio = _.sum(a.store) * 100 / a.storeCapacity;
                    var aLastFillRatio = _.sum(aNextOUT.store) * 100 / aNextOUT.storeCapacity;
                    aNextOUT = (aFillRatio > aLastFillRatio) ? a : aNextOUT;
                }
            });

            if (_.isUndefined(aNextOUT) && !_.isUndefined(aStorage) && aStorage.store[RESOURCE_ENERGY] > 0)
            {
                //logDERP('SUPPLIER - adjustment to  ----OUT---- box list because all other boxes are full ...');
                aNextOUT = aRoom.storage;
            }

            if (_.isUndefined(aNextOUT))
            {
                // TODO: no resources to grab from .... move to idle position or something
                logERROR('SUPPLIER '+pCreep.name+' IS STUCK (NO OUT BOX) FIX THIS ... ');

                var aIDLE = Room.IDLE_POSITIONS[aRoom.name];
                if (_.isUndefined(aIDLE[0]))
                {
                    logERROR('SUPPLIER has no IDLE position for room '+aRoom.name);
                    return;
                }

                logDERP(JSON.stringify(aIDLE));
                var aPos = new RoomPosition(aIDLE[0].x,aIDLE[0].y,aRoom.name);
                if (!pCreep.pos.isEqualTo(aPos))
                {
                    var result = pCreep.moveTo(aPos,{ignoreCreeps: true});
                    logDEBUG('SUPPLIER moves to IDLE ['+aIDLE[0].x+' '+aIDLE[0].y+'] .. '+ErrorSting(result));
                }

                return;
            }

            if (!pCreep.pos.isNearTo(aNextOUT))
            {
                var result = pCreep.moveTo(aNextOUT,{ignoreCreeps: true,range:1});
                logDEBUG('SUPPLIER '+pCreep.name+' moves to next grab box ['+aNextOUT.pos.x+' '+aNextOUT.pos.y+'] ... '+ErrorSting(result));
            }

            if (pCreep.pos.isNearTo(aNextOUT))
            {
                if (aNextOUT.store[RESOURCE_ENERGY] > 0)
                {
                    aResourceType = RESOURCE_ENERGY;
                }
                else
                {
                    aResourceType = maxCarryResourceType(aNextOUT.store);
                }
                var result = pCreep.withdraw(aNextOUT,aResourceType);
                logDEBUG('SUPPLIER '+pCreep.name+' grabs '+aResourceType+' from ['+aNextOUT.pos.x+' '+aNextOUT.pos.y+'] ... '+ErrorSting(result));
            }
        }
        else if (!_.isUndefined(aTower))
        {
            if (!pCreep.pos.isNearTo(aTower))
            {
                var result = pCreep.moveTo(aTower,{ignoreCreeps: true});
                logDEBUG('SUPPLIER moves to resupply tower ['+aTower.pos.x+' '+aTower.pos.y+'] .. '+ErrorSting(result));
            }
            else
            {
                var result = pCreep.transfer(aTower,RESOURCE_ENERGY);
                logDEBUG('SUPPLIER resupplys tower ['+aTower.pos.x+' '+aTower.pos.y+'] .. '+ErrorSting(result));
            }
        }
        else
        {
            // TODO: beware of rooms without a storage - this willbe broken here
            if (maxCarryResourceType(pCreep.carry) != RESOURCE_ENERGY)
            {
                if (!pCreep.pos.isNearTo(aStorage))
                {
                    var result = pCreep.moveTo(aStorage,{ignoreCreeps: true,range:1});
                    logDEBUG('SUPPLIER '+pCreep.name+' moves to storage  .. '+ErrorSting(result));
                }

                var result = pCreep.transfer(aStorage,maxCarryResourceType(pCreep.carry));
                logDEBUG('SUPPLIER '+pCreep.name+' transfers '+maxCarryResourceType(pCreep.carry)+' ... '+ErrorSting(result));
            }
            else
            {
                var aNextIN = undefined;
                _.forEach(mySuppliers.aIN,(a) =>
                {
                    var aCapacity = pCreep.carry.energy;
                    var aDelta = a.storeCapacity - _.sum(a.store);
                    var isValid = aDelta >= aCapacity;
                    //logDERP('IN BOX '+a.structureType+' valid: '+isValid+' c: '+aCapacity+' b: '+aDelta+' ['+a.pos.x+' '+a.pos.y+'] R: '+(_.sum(a.store) * 100 / a.storeCapacity).toFixed(2));

                    if (isValid && _.isUndefined(aNextIN))
                    {
                        //logDERP('IN BOX START ['+a.pos.x+' '+a.pos.y+'] R: '+(_.sum(a.store) * 100 / a.storeCapacity).toFixed(2));
                        aNextIN = a;
                    }
                    else if (isValid)
                    {
                        var aFillRatio = _.sum(a.store) * 100 / a.storeCapacity;
                        var aLastFillRatio = _.sum(aNextIN.store) * 100 / aNextIN.storeCapacity;
                        aNextIN = (aFillRatio < aLastFillRatio) ? a : aNextIN;
                        //logDERP('IN BOX NEXT '+aNextIN.structureType+' ['+aNextIN.pos.x+' '+aNextIN.pos.y+'] R: '+(_.sum(aNextIN.store) * 100 / aNextIN.storeCapacity).toFixed(2));
                    }
                });
                if (_.isUndefined(aNextIN) && !_.isUndefined(aStorage))
                {
                    aNextIN = aStorage;
                }

                if (_.isUndefined(aNextIN))
                {
                    // TODO: no resources to grab from .... move to idle position or something
                    logERROR('SUPPLIER '+pCreep.name+' IS STUCK (NO IN BOX) FIX THIS ... ');
                    var aIDLE = Room.IDLE_POSITIONS[aRoom.name];
                    if (_.isUndefined(aIDLE[0]))
                    {
                        logERROR('SUPPLIER has no IDLE position for room '+aRoom.name);
                        return;
                    }

                    logDERP(JSON.stringify(aIDLE));
                    var aPos = new RoomPosition(aIDLE[0].x,aIDLE[0].y,aRoom.name);
                    if (!pCreep.pos.isEqualTo(aPos))
                    {
                        var result = pCreep.moveTo(aPos,{ignoreCreeps: true});
                        logDERP('SUPPLIER moves to IDLE ['+aIDLE[0].x+' '+aIDLE[0].y+'] .. '+ErrorSting(result));
                    }
                    return;
                }

                if (!pCreep.pos.isNearTo(aNextIN))
                {
                    var result = pCreep.moveTo(aNextIN,{ignoreCreeps: true,range:1});
                    logDEBUG('SUPPLIER '+pCreep.name+' moves to next drop box ['+aNextIN.pos.x+' '+aNextIN.pos.y+'] ... '+ErrorSting(result));
                }

                var aResourceType = maxCarryResourceType(pCreep.carry);
                var result = pCreep.transfer(aNextIN,aResourceType);
                logDEBUG('SUPPLIER '+pCreep.name+' transfers '+aResourceType+' to ['+aNextIN.pos.x+' '+aNextIN.pos.y+'] ... '+ErrorSting(result));
            }
        }
    }

    processTowerSupply(pRoom,pCreep)
    {
        var aResourceType = maxCarryResourceType(pCreep.carry);
        if (aResourceType != RESOURCE_ENERGY) return undefined;

        var myRoomTowers = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.tower);
        if (myRoomTowers.length == 0 ) return undefined;

        var aTower = _.min(myRoomTowers, (a) =>
        {
            return a.getEnergyState();
        });
        if (aTower.getEnergyState() == 100) return undefined;

        return aTower;
    }

    findSupplierTargets(pRoom)
    {
        var myRoomContainers = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.container);
        var myRoomTerminals = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.terminal);
        var myRoomLinks = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.link);

        var myIN = _.filter(myRoomContainers, (a) => { return a.isIN() }).reverse();
        var myOUT = _.filter(myRoomContainers, (a) => { return a.isOUT()});

        var myRoomController = pRoom.getRoomObjects(ROOM_OBJECT_TYPE.controller);

        myOUT = myOUT.concat(_.filter(myRoomLinks, (aLink) =>
        {
            var result = true;
            if (aLink.isReceiver())
            {
                _.forEach(myRoomController, (aController) =>
                {
                    if (aController.pos.inRangeTo(aLink,3))
                    {
                        result = false;
                    }
                });
            }
            else
            {
                result = false;
            }
            return result;
        }));
        //
        // var aStorage = pRoom.storage
        // if (!_.isUndefined(aStorage))
        // {
        //     if (aStorage.store[RESOURCE_ENERGY] < STORAGE_MAINTENANCE_RESERVE_LIMIT)
        //     {
        //         myIN = [aStorage];
        //     }
        // }

        _.forEach(myOUT, (a) =>
        {
            var d1 = _.sum(a.store) * 100 / a.storeCapacity;
            var d2 = _.sum(a.store)+'/'+a.storeCapacity;
            //logDERP('OUT at ['+a.pos.x+' '+a.pos.y+'] - '+a.structureType+' ['+d2+'] ['+d1+']');
        });

        _.forEach(myIN, (a) =>
        {
            var d1 = _.sum(a.store) * 100 / a.storeCapacity;
            var d2 = _.sum(a.store)+'/'+a.storeCapacity;
            //logDERP('IN at ['+a.pos.x+' '+a.pos.y+'] - '+a.structureType+' ['+d2+'] ['+d1+']');
        });

        return  {
                    aIN: myIN,
                    aOUT: myOUT,
                };
    }
};
module.exports = SupplierRole;
