class ClaimOperation
{
    constructor()
    {
        this.CLAIM_ROOMS = ['W87S34','W87S32'];
        this.mCreep = undefined;
        this.isClaim = false;

        this.mClaimPosition = this.searchClaimRoom();
    }

    processOperation()
    {
        let aID = _.isUndefined(this.mClaimPosition) ? undefined : this.mClaimPosition.toString()
        this.log(LOG_LEVEL.error,'processOperation() '+aID);
        this.spawnClaimer();
        this.doClaiming();
    }

    doClaiming()
    {
        if (_.isUndefined(this.mCreep) || this.mCreep.spawning) return;

        if (_.isUndefined(this.mClaimPosition))
        {
            this.log(LOG_LEVEL.info,'claimer is IDLE! - move it somewhere! FIX THIS');
            return;
        }

        if (this.mCreep.getActiveBodyparts(CARRY) > 0 && this.mCreep.carry[RESOURCE_ENERGY] == 0 )
        {
            let aStorage = _.min(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aS) => aS.pos.getRangeTo(this.mCreep.pos));
            if (!this.mCreep.pos.isNearTo(aStorage))
            {
                let res = this.mCreep.travelTo({pos: aStorage.pos});
                this.log(LOG_LEVEL.debug,this.mCreep.name+' moves to storage '+this.aStorage.pos.toString()+' res: '+ErrorString(res));
            }
            let res = this.mCreep.withdraw(aStorage.entity,RESOURCE_ENERGY);
            this.log(LOG_LEVEL.debug,this.mCreep.name+' withdraw storage '+this.aStorage.pos.toString()+' res: '+ErrorString(res));

            if (res != OK)
            {
                return;
            }
        }

        Log(LOG_LEVEL.debug,'CLAIMPOS: '+JS(this.mClaimPosition));

        if (!this.mCreep.pos.isNearTo(this.mClaimPosition))
        {
            let res = this.mCreep.moveTo(this.mClaimPosition);
            this.log(LOG_LEVEL.debug,this.mCreep.name+' moves to '+this.mClaimPosition.toString()+' res: '+ErrorString(res));
        }
        else
        {
            let aController = _.find(PCache.getAllEntityCache(ENTITY_TYPES.controller), (aC) => aC.pos.isNearTo(this.mCreep.pos));

            if (_.isUndefined(aController))
            {
                //aController = PCache.derpRegisterEntity(this.mCreep.room.controller); // TODO: this is just a fallback for not registered controllers - fix this
            }

            if (!aController.isMy)
            {
                let res = this.mCreep.claimController(aController.entity);
                this.log(LOG_LEVEL.debug,this.mCreep.name+' claims '+aController.pos.toString()+' res: '+ErrorString(res));
            }
            else
            {
                let res = this.mCreep.upgradeController(aController.entity);
                this.log(LOG_LEVEL.debug,this.mCreep.name+' upgrades '+aController.pos.toString()+' res: '+ErrorString(res));
            }
        }
    }

    spawnClaimer()
    {
        var myCreeps = getCreepsForRole(CREEP_ROLE.claimer);
        this.mCreep = _.find(myCreeps); // TODO: this will not work with multiple claimer
        if (!_.isUndefined(this.mCreep)) return;
        if (_.isUndefined(this.mClaimPosition)) return; // INFO: none of our controllers is under 1000 downgrade time

        var aSpawn = _.min(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aProxy) =>
        {
            if (!aProxy.my) return Infinity;
            if (aProxy.pos.roomName != this.mClaimPosition.roomName) return Infinity;
            return aProxy.pos.getRangeTo(this.mCenter);
        });

        if (_.isUndefined(aSpawn)) return;
        this.log(LOG_LEVEL.debug,'possible spawn - '+aSpawn.name);


        var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        {
            if (!_.isUndefined(Game.creeps[aCreepName])) return false;
            return aCreepMem.role == CREEP_ROLE.claimer;
        });

        var aCreepBody = new CreepBody();

        // TODO: the cary parts should be adjusted to the current task - so if the task is heavy un/loading
        //       to the terminal/storage it should have more parts otherwise just normal 1
        //

        var aEnergy = aSpawn.room.energyCapacityAvailable;

        var aSearch =
        {
            name: CARRY,
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
                count: 1,
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
        if (aResult.aCost <=  aSpawn.room.energyAvailable)
        {
            let res = aSpawn.createCreep(aResult.body,aName,{role: CREEP_ROLE.claimer})
            this.log(LOG_LEVEL.info,'claimer createCreep - '+ErrorString(res));
        }
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

            if (_.isUndefined(aRoom))
            {
                this.isClaim = true;

                let aRoom = Game.rooms[aName];
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
                    //aController = PCache.derpRegisterEntity(aRoom.controller); // TODO: this is just a fallback for not registered controllers - fix this
                }

                if (!aController.isMy)
                {
                    return aController.pos;
                }
                else
                {
                    myClaimedControllers.push(aController);
                }
            }
        }


        let aController = _.min(myClaimedControllers, (aC) => aC.ticksToDowngrade);
        let derp = ((aController.ticksToDowngrade < 1000) ? aController.pos : undefined);
        this.log(LOG_LEVEL.debug,'DERP: '+derp+' '+JS(aController));
        return aController;
    }


    log(pLevel,pMsg)
    {
        Log(pLevel,'ClaimOperation: '+pMsg);
    }
}
module.exports = ClaimOperation;
