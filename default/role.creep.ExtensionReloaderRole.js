class ExtensionReloaderRole extends require('role.creep.AbstractRole')
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
        logDEBUG('EXTENSION RELOADER ROLE PROCESSED.....');
        if (!this.isRoleValid(pCreep)) return;

        var myTask =
        {
            aCreep: pCreep,
            aRoom: pCreep.room,
            aExtensionBay: undefined,

            aMove: undefined,
            aPickup:
            {
                aTarget: undefined,
                aAmount: 0,
            },
            aWithdraw:
            {
                aTarget: undefined,
                aAmount: 0,
            },
            aTransfer:
            {
                aTarget: undefined,
                aAmount: 0,
            },
            aDrop:
            {
                aType: undefined,
                aAmount: 0,
            },
        }

        myTask = this.assignExtensionBay(myTask);
        myTask = this.assignMoveTarget(myTask);
        myTask = this.assignTransferTarget(myTask);
        myTask = this.assignWithdrawTarget(myTask);


        if (!_.isUndefined(myTask.aMove))
        {
            var result =  myTask.aCreep.moveTo(myTask.aMove,{ignoreCreeps: true})
            logDEBUG('EXTENSION LOADER '+myTask.aCreep.name+' moves to ['+myTask.aMove.pos.x+' '+myTask.aMove.pos.y+'] .. '+ErrorSting(result));
        }

        if (!_.isUndefined(myTask.aTransfer.aTarget))
        {
            var result =  myTask.aCreep.transfer(myTask.aTransfer.aTarget,RESOURCE_ENERGY,myTask.aTransfer.aAmount);
            logDEBUG('EXTENSION LOADER '+myTask.aCreep.name+' transfers ['+myTask.aTransfer.aAmount+'] to ['+myTask.aTransfer.aTarget.pos.x+' '+myTask.aTransfer.aTarget.pos.y+'] .. '+ErrorSting(result));
        }


        if (!_.isUndefined(myTask.aWithdraw.aTarget))
        {
            var result = myTask.aCreep.withdraw(myTask.aWithdraw.aTarget,RESOURCE_ENERGY,myTask.aWithdraw.aAmount);
            logDEBUG('EXTENSION LOADER '+myTask.aCreep.name+' withdraws ['+myTask.aWithdraw.aAmount+'] from ['+myTask.aWithdraw.aTarget.pos.x+' '+myTask.aWithdraw.aTarget.pos.y+'] .. '+ErrorSting(result));
        }

        //logDERP('------------------- EXTENSION LOADER ---------------------------');
    }

    assignTransferTarget(pTask)
    {
        if (_.isUndefined(pTask.aExtensionBay)) return pTask;
        if (!_.isUndefined(pTask.aMove)) return pTask;
        if ( _.sum(pTask.aExtensionBay.store) == 0 ) return pTask;

        logDERP('DERP');
        var myRoomLabs = pTask.aRoom.getRoomObjects(ROOM_OBJECT_TYPE.lab);
        var myLabs = _.filter(myRoomLabs, (aLab) =>
        {
            //logDERP('a= '+aSpawn.isEnergyNeeded()+' b= '+aSpawn.pos.isNearTo(pTask.aCreep))
            return aLab.energy < aLab.energyCapacity && aLab.pos.isNearTo(pTask.aCreep);
        })
        if (myLabs.length > 0)
        {
            logDERP('EXTENSION: lab fill');
            var aLab = myLabs[0];
            var eA = pTask.aCreep.carry.energy;
            var eE =  aLab.energyCapacity - aLab.energy;
            var aAmount = _.min([eA,eE]);
            pTask.aTransfer.aTarget = aLab;
            pTask.aTransfer.aAmount = aAmount;
            return pTask;
        }

        var myRoomSpawns = pTask.aRoom.getRoomObjects(ROOM_OBJECT_TYPE.spawn);
        var mySpawns = _.filter(myRoomSpawns, (aSpawn) =>
        {
            //logDERP('a= '+aSpawn.isEnergyNeeded()+' b= '+aSpawn.pos.isNearTo(pTask.aCreep))
            return aSpawn.isEnergyNeeded() && aSpawn.pos.isNearTo(pTask.aCreep);
        })
        if (mySpawns.length > 0)
        {
            //logDERP('EXTENDSION: spawn fill');
            var aSpawn = mySpawns[0];
            var eA = pTask.aCreep.carry.energy;
            var eE =  aSpawn.energyCapacity - aSpawn.energy;
            var aAmount = _.min([eA,eE]);
            pTask.aTransfer.aTarget = aSpawn;
            pTask.aTransfer.aAmount = aAmount;
            return pTask;
        }

        var myRoomExtensions = pTask.aRoom.getRoomObjects(ROOM_OBJECT_TYPE.extension);
        var myExtensions = _.filter(myRoomExtensions,(a) =>
        {
            return pTask.aExtensionBay.pos.inRangeTo(a,2) && a.energy < a.energyCapacity;
        });
        if (myExtensions.length == 0 ) return pTask;
        var aNearExtension = _.min(myExtensions, (a) => {return a.pos.getRangeTo(pTask.aCreep)});


        var eA = pTask.aCreep.carry.energy;
        var eE =  aNearExtension.energyCapacity - aNearExtension.energy;
        var aAmount = _.min([eA,eE]);
        pTask.aTransfer.aTarget = aNearExtension;
        pTask.aTransfer.aAmount = aAmount;
        //logDERP(' --------- bay transfer ['+aAmount+'] ['+eA+' '+eE+'] ['+Game.time+']------ ');

        return pTask;
    }

    assignWithdrawTarget(pTask)
    {
        // TODO: adjust this to an aextension move taget test - only when we initial move to the bay we should
        // deny withdrawing
        if (_.isUndefined(pTask.aExtensionBay)) return pTask;
        if (!_.isUndefined(pTask.aMove)) return pTask;
        if ( _.sum(pTask.aExtensionBay.store) == 0 ) return pTask;

        var cA = pTask.aCreep.carryCapacity;
        var eA = _.sum(pTask.aCreep.carry)
        var bA = _.sum(pTask.aExtensionBay.store);
        var aAmount = cA - eA  ;

        //logDERP(' --------- bay withdraw ['+bA+'] ['+aAmount+'] ['+cA+' '+eA+'] ['+Game.time+']------ ');
        if (aAmount > 0)
        {
            pTask.aWithdraw.aTarget = pTask.aExtensionBay;
            pTask.aWithdraw.aAmount = aAmount;
        }
        return pTask;
    }

    assignExtensionBay(pTask)
    {
        if (_.isUndefined(pTask.aRoom)) return;

        var myRoomExtensionBays = pTask.aRoom.myExtensionBays;
        if (myRoomExtensionBays.length == 0 ) return pTask;
        var myRoomExtensions = pTask.aRoom.getRoomObjects(ROOM_OBJECT_TYPE.extension);
        if (myRoomExtensions.length == 0) return pTask;

        var aExtensionBay = Game.getObjectById(pTask.aCreep.memory.extensionBay);
        if (_.isNull(aExtensionBay))
        {
            logERROR('EXTENSION LOADER has no related extension bay - fix this!');
            return pTask;
        }
        pTask.aExtensionBay = aExtensionBay;
        return pTask;
    }

    assignMoveTarget(pTask)
    {
        if (_.isUndefined(pTask.aExtensionBay)) return pTask;

        if (!pTask.aCreep.pos.isNearTo(pTask.aExtensionBay) ||  _.sum(pTask.aExtensionBay.store) < pTask.aCreep.carryCapacity || pTask.aExtensionBay.store[RESOURCE_ENERGY] == 0)
        {
            pTask.aMove = pTask.aExtensionBay;
        }
        else
        {
            var myRoomExtensions = pTask.aRoom.getRoomObjects(ROOM_OBJECT_TYPE.extension);
            var myExtensions = _.filter(myRoomExtensions,(a) =>
            {
                var bA = pTask.aExtensionBay.pos.inRangeTo(a,2);
                var bB = (a.energy < a.energyCapacity);
                return bA && bB;
            });
            if (myExtensions.length == 0) // all extensions full
            {
                var myRoomLabs = pTask.aRoom.getRoomObjects(ROOM_OBJECT_TYPE.lab);
                var myLabs = _.filter(myRoomLabs, (aLab) =>
                {
                    //logDERP('a= '+aSpawn.isEnergyNeeded()+' b= '+aSpawn.pos.isNearTo(pTask.aCreep))
                    return aLab.energy < aLab.energyCapacity && aLab.pos.getRangeTo(pTask.aExtensionBay) <= 2;
                })

                var myRoomSpawns = pTask.aRoom.getRoomObjects(ROOM_OBJECT_TYPE.spawn);
                var mySpawns = _.filter(myRoomSpawns, (aSpawn) =>
                {
                    //logDERP('a= '+aSpawn.isEnergyNeeded()+' b= '+aSpawn.pos.isNearTo(pTask.aCreep))
                    return aSpawn.isEnergyNeeded() && aSpawn.pos.getRangeTo(pTask.aExtensionBay) <= 2;
                })

                if (myLabs.length > 0)
                {
                    logDERP('EXTENDSION: lab move');
                    var aLab = myLabs[0];
                    if (!pTask.aCreep.pos.isNearTo(aLab))
                    {
                        pTask.aMove  = aLab;
                    }
                }
                else if (mySpawns.length > 0)
                {
                    logDERP('EXTENDSION: spawn move');
                    var aSpawn = mySpawns[0];
                    if (!pTask.aCreep.pos.isNearTo(aSpawn))
                    {
                        pTask.aMove  = aSpawn;
                    }
                }
                else if (!pTask.aCreep.pos.isEqualTo(pTask.aExtensionBay.pos))
                {
                    pTask.aMove = pTask.aExtensionBay;
                }
            }
            else
            {
                var aNearExtension = _.min(myExtensions, (a) =>
                {
                    var rA = a.pos.getRangeTo(pTask.aCreep);
                    return rA
                });
                if (!pTask.aCreep.pos.isNearTo(aNearExtension) && !pTask.aCreep.pos.isEqualTo(pTask.aExtensionBay))
                {
                    pTask.aMove = pTask.aExtensionBay;
                }
                else if (!pTask.aCreep.pos.isNearTo(aNearExtension))
                {
                    pTask.aMove = aNearExtension;
                }
            }
        }
        return pTask;
    }
};


module.exports = ExtensionReloaderRole;
