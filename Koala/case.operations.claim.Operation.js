class ClaimOperation extends Operation
{
    constructor(pName,pRooms)
    {
        super('ClaimOperation');
        this.CLAIM_ROOMS = pRooms;
        this.mCreepName = pName
        this.mCreep = undefined;
        this.mCreeps = undefined;
        this.isClaim = false;

        this.mClaimPosition = this.searchClaimRoom();
        this.mResources = PCache.getFriendlyEntityCache(ENTITY_TYPES.resource);

    }

    processOperation()
    {
        let aID = _.isUndefined(this.mClaimPosition) ? undefined : this.mClaimPosition.toString()
        this.log(LOG_LEVEL.error,'processOperation() '+aID);
        this.spawnClaimer();

        //_.each(this.mCreeps, (aCreep) =>
        this.doClaiming(this.mCreep);
    }

    doClaiming(pCreep)
    {
        if (_.isUndefined(pCreep) || pCreep.spawning) return;

        if (_.isUndefined(this.mClaimPosition))
        {
            this.log(LOG_LEVEL.info,'claimer is IDLE! - move it somewhere! FIX THIS');
            return;
        }

        if (pCreep.getActiveBodyparts(CARRY) > 0 && pCreep.carry[RESOURCE_ENERGY] == 0 )
        {
            if (this.mResources.length > 0)
            {
                var aResource = _.find(this.mResources, (aDrop) => aDrop.pos.isNearTo(pCreep) && aDrop.resourceType == RESOURCE_ENERGY);
                if (!_.isUndefined(aResource))
                {
                    let res = pCreep.pickup(aResource.entity);
                    //Log(undefined,'RESOURCE:'+ErrorString(res));
                }
            }

            // TODO: this is very buggy - the claimer should not grab form boxes not near the claim position
            // right now it can be the claimer moves in the opposite direction to get the nearest box - very bad

            let myStorages = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.storage), (aS) => aS.store[RESOURCE_ENERGY] > 0);
            let aStorage = undefined;
            if (myStorages.length > 0)
            {
                aStorage = _.min(myStorages, (aS) => PMan.getCleanPath(aS.pos,pCreep.pos).path.length);
            }


            let myBoxes = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.container),(aS) => aS.store[RESOURCE_ENERGY] > 0);
            let aBox = undefined;
            if (myBoxes.length > 0)
            {
                aBox = _.min(myBoxes, (aS) =>  aS.pos.wpos.getRangeTo(pCreep.pos.wpos));  /// PMan.getCleanPath(aS.pos,pCreep.pos).path.length);
            }

            let aTarget = undefined
            if (!_.isUndefined(aBox))
            {
                aTarget = aBox.entity;
            }
            else if (!_.isUndefined(aStorage))
            {
                aTarget = aStorage.entity;
            }
            else
            {
                Log(LOG_LEVEL.error,'CALIM: no box no storage! - fix this')
                return;
            }

            if (!_.isUndefined(aTarget))
            {
                if (!pCreep.pos.isNearTo(aTarget))
                {
                    let res = pCreep.travelTo({pos: aTarget.pos});
                    //this.log(LOG_LEVEL.debug,pCreep.name+' moves to storage '+aTarget.pos.toString()+' res: '+ErrorString(res));
                }
                let res = this.mCreep.withdraw(aTarget,RESOURCE_ENERGY);
                //this.log(LOG_LEVEL.debug,pCreep.name+' withdraw storage '+aTarget.pos.toString()+' res: '+ErrorString(res));

                if (res != OK)
                {
                    return;
                }
            }
        }

        //Log(LOG_LEVEL.debug,'CLAIMPOS: '+JS(this.mClaimPosition));

        if (!pCreep.pos.isNearTo(this.mClaimPosition))
        {
            let res = this.mCreep.travelTo({pos: this.mClaimPosition});
            //this.log(LOG_LEVEL.debug,pCreep.name+' moves to '+this.mClaimPosition.toString()+' res: '+ErrorString(res));
        }
        else
        {
            let aController = _.find(PCache.getAllEntityCache(ENTITY_TYPES.controller), (aC) => aC.pos.isNearTo(pCreep.pos));

            if (_.isUndefined(aController))
            {
                //aController = PCache.derpRegisterEntity(this.mCreep.room.controller); // TODO: this is just a fallback for not registered controllers - fix this
            }

        //    this.log(LOG_LEVEL.info,'CONTROLLER: '+aController.pos.toString()+JS(aController));
            if (!aController.isMy)
            {
                let res = this.mCreep.claimController(aController.entity);
                if (res == ERR_FULL)
                {
                    let res = this.mCreep.reserveController(aController.entity);
                    //this.log(LOG_LEVEL.debug,pCreep.name+' reserve '+aController.pos.toString()+' res: '+ErrorString(res));
                }
                else
                {
                    //this.log(LOG_LEVEL.debug,pCreep.name+' claims '+aController.pos.toString()+' res: '+ErrorString(res));
                }
            }
            else
            {
                let res = this.mCreep.upgradeController(aController.entity);
                //this.log(LOG_LEVEL.debug,pCreep.name+' upgrades '+aController.pos.toString()+' res: '+ErrorString(res));
            }
        }
    }

    spawnClaimer()
    {
        var myCreeps = getCreepsForRole(CREEP_ROLE.claimer);
//        this.mCreeps = myCreeps;
        this.mCreep = _.find(myCreeps, (aC) => aC.name == this.mCreepName); // TODO: this will not work with multiple claimer
        if (!_.isUndefined(this.mCreep))
        {
            return;
        }
        if (_.isUndefined(this.mClaimPosition)) return; // INFO: none of our controllers is under 1000 downgrade time

        var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        {
            if (!_.isUndefined(Game.creeps[aCreepName])) return false;
            return aCreepMem.role == CREEP_ROLE.claimer;
        });


        let aBody = this.getBody();
        let mySpawns = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aS) =>
        {
            return  aS.room.energyAvailable >= aBody.aCost;
        })

        if (mySpawns.length > 0)
        {
            // TODO: this is a bit meh - not sure what a good decission for the spawn is right now - maybe later
            // the distance to the labs or something - or the storage <- this it probably is
            let aSpawn = _.min(mySpawns, (aS) => aS.pos.wpos.getRangeTo(this.mClaimPosition.wpos));

            if (!_.isUndefined(aSpawn))
            {
                if (aSpawn.spawning)
                {
                    this.log(LOG_LEVEL.debug,'possible spawn is bussy - '+aSpawn.name+' '+aSpawn.pos.toString());
                    return;
                }
                this.log(LOG_LEVEL.debug,'possible spawn - '+aSpawn.name+' '+aSpawn.pos.toString());
                this.log(LOG_LEVEL.debug,'possible name - '+aName);

                // TODO: consider a path approach here
                if (!_.isUndefined(aName)) aName = this.mCreepName;
                let res = aSpawn.createCreep(aBody.body,aName,{role: CREEP_ROLE.claimer, spawn: aSpawn.pos.wpos.serialize()})
                this.log(LOG_LEVEL.info,'claimer createCreep - '+ErrorString(res));
            }
        }
        else
        {
            this.log(LOG_LEVEL.debug,'no spawn room has enough energy - needed: '+aBody.aCost);
        }
    }

    getBody()
    {

        var aCreepBody = new CreepBody();

        // TODO: the cary parts should be adjusted to the current task - so if the task is heavy un/loading
        //       to the terminal/storage it should have more parts otherwise just normal 1
        //
        var aSpawn = _.max(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aS) => aS.room.energyCapacityAvailable);
        let aEnergy = aSpawn.room.energyCapacityAvailable;

        var aSearch =
        {
            name: CARRY,
            max: 2,   /// 1
        };
        var aBodyOptions =
        {
            hasRoads: false,
            moveBoost: '',
        };
        var aBody =
        {
            [WORK]:
            {
                count: 3, // 1
            }
        }

       if (this.isClaim)
        {
            var aSearch =
            {
                name: CLAIM,
                max: 1,
            };
            var aBodyOptions =
            {
                hasRoads: false,
                moveBoost: '',
            };
            var aBody =
            {
                [WORK]:
                {
                    count: 0,
                }
            }
        }
        var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);

        this.log(LOG_LEVEL.debug,'body: '+JS(aResult));
        return aResult;
    }

    searchClaimRoom()
    {
        let myRooms = PCache.getAllEntityCache(ENTITY_TYPES.room);
        let myControllers = PCache.getAllEntityCache(ENTITY_TYPES.controller);

        let myClaimedControllers = [];
        for ( let aName of this.CLAIM_ROOMS)
        {
            //Log(LOG_LEVEL.debug,'NAME: '+aName);
            let aRoom = _.find(myRooms, (aR) => aR.name == aName);

            //Log(LOG_LEVEL.debug,'NAME: '+JS(aRoom));

            if (_.isUndefined(aRoom) || !aRoom.isValid)
            {
                this.isClaim = true;

                // let aRoom = Game.rooms[aName];
                // if (!_.isUndefined(aRoom))
                // {
                //     PCache.derpRegisterEntity(aRoom);
                // }


                return new RoomPosition(25,25,aName);
            }
            else
            {
                let aController = _.find(myControllers, (aController) => aController.pos.roomName == aName);

                if (_.isUndefined(aController))
                {
                    // TODO: search the memory for a controller that might be reserved but is not visible anymore

                    //aController = PCache.derpRegisterEntity(aRoom.controller); // TODO: this is just a fallback for not registered controllers - fix this
                }

                if (!aController.isMy || (!_.isUndefined(aController.reservation) && aController.reservation.username == USER_NAME))
                {
                    this.isClaim = true;
                    return aController.pos;
                }
                else
                {
                    myClaimedControllers.push(aController);
                }
            }
        }


        let aController = _.min(myClaimedControllers, (aC) => aC.ticksToDowngrade);
        //let derp = ((aController.ticksToDowngrade < 1000) ? aController.pos : undefined);
        //this.log(LOG_LEVEL.debug,'DERP: '+derp+' '+JS(aController));
        return aController.pos;
    }
}
module.exports = ClaimOperation;
