class UpgraderOperation
{
    constructor(pRoomName,pUpgraderName)
    {
        this.mUpgraderName = pUpgraderName;
        this.mRoomName = pRoomName;
        this.mController = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.controller), (aController) => aController.pos.roomName == this.mRoomName);
        this.mCreep = undefined;
        this.mStorage = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.storage), (aStorage) => aStorage.pos.roomName == this.mRoomName);
        this.mResources =  PCache.getFriendlyEntityCache(ENTITY_TYPES.resource);

        this.mConstructions = PCache.getFriendlyEntityCache(ENTITY_TYPES.constructionSite);
    }

    processOperation()
    {
        let aID = _.isUndefined(this.mStorage) ? 'no storage' : this.mStorage.pos.toString();
        this.log(LOG_LEVEL.error,'processOperation() storage: '+aID);
        this.spawnUpgrader();
        this.doUpgrade();
    }

    doUpgrade()
    {
        if (_.isUndefined(this.mCreep) || this.mCreep.spawning) return;

        if (this.mResources.length > 0)
        {
            var aResource = _.find(this.mResources, (aDrop) => aDrop.pos.isNearTo(this.mCreep));
            if (!_.isUndefined(aResource))
            {
                let res = this.mCreep.pickup(aResource.entity);
                //Log(undefined,'RESOURCE:'+ErrorString(res));
            }
        }

        let myConstructions = _.filter(this.mConstructions, (aC) => aC.pos.inRangeTo(this.mCreep,3))
        if (myConstructions.length > 0)
        {
            let aConstruction = _.min(myConstructions, (aC) => aC.progress);
            let res = this.mCreep.build(aConstruction.entity);
            this.log(LOG_LEVEL.debug,this.mCreep.name+' build '+aConstruction.pos.toString());
        }


        if (_.sum(this.mCreep.carry) == 0)
        {
            if (!this.mCreep.pos.isNearTo(this.mStorage))
            {
                let res = this.mCreep.travelTo(this.mStorage.entity);
            }

            let res = this.mCreep.withdraw(this.mStorage.entity,RESOURCE_ENERGY);
            this.log(LOG_LEVEL.debug,this.mCreep.name+' withdraw '+this.mStorage.pos.toString());
        }
        else
        {
            let res = this.mCreep.upgradeController(this.mController.entity);
            if (res != OK)
            {
                let res = this.mCreep.travelTo(this.mController.entity);
                this.log(LOG_LEVEL.debug,this.mCreep.name+' move to '+this.mController.pos.toString());
            }
            else if (res == OK)
            {
                this.moveUpdaterFromRoad(this.mCreep);
            }

        }
    }

    spawnUpgrader()
    {
        var myCreeps = getCreepsForRole(CREEP_ROLE.upgrader);
        this.mCreep = _.find(myCreeps, (aCreep) => aCreep.name == this.mUpgraderName); // TODO: this will not work with multiple upgraders
        if (!_.isUndefined(this.mCreep)) return;
        if (_.isUndefined(this.mStorage))return;
        if (this.mStorage.store[RESOURCE_ENERGY] < 150000) return;

        var aSpawn = _.min(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aProxy) =>
        {
            if (!aProxy.my) return Infinity;
            return aProxy.pos.getRangeTo(this.mController);
        });
        this.log(LOG_LEVEL.debug,'possible spawn - '+aSpawn.name);

        var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        {
            if (!_.isUndefined(Game.creeps[aCreepName])) return false;
            return aCreepMem.role == CREEP_ROLE.upgrader && aCreepName == this.mUpgraderName;
        });
        if (_.isUndefined(aName))
        {
            aName = this.mUpgraderName;
        }

        this.log(LOG_LEVEL.debug,'reuse name: '+aName);

        var aCreepBody = new CreepBody();

        // TODO: the cary parts should be adjusted to the current task - so if the task is heavy un/loading
        //       to the terminal/storage it should have more parts otherwise just normal 1
        //
        var aSearch =
        {
            name: WORK,
            max: 10,
        };
        var aBodyOptions =
        {
            hasRoads: true,
            moveBoost: '',
        };

        var aEnergy = aSpawn.room.energyCapacityAvailable;
        var aBody =
        {
            [CARRY]:
            {
                count: 6,
            }
        };
        var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);

        this.log(LOG_LEVEL.debug,'body: '+JS(aResult));

        if (aResult.aCost <=  aSpawn.room.energyAvailable)
        {
            let res = aSpawn.createCreep(aResult.body,aName,{role: CREEP_ROLE.upgrader})
            this.log(LOG_LEVEL.info,'upgrader createCreep - '+ErrorString(res));
        }
    }

    moveUpdaterFromRoad(pCreep)
    {
        let aRoad = _.find(pCreep.pos.look(), (a) =>
        {
            return (_.get(a,['structure','structureType']) == STRUCTURE_ROAD)
        });
        if (_.isUndefined(aRoad)) return;

        let aController = _.find(PCache.getFriendlyEntityCache(ENTITY_TYPES.controller), (aC) => pCreep.pos.roomName == aC.pos.roomName);
        if (_.isUndefined(aController)) return;
        let myControllerPos = aController.upgradePositions.area;
        //this.log(LOG_LEVEL.debug,JS(myControllerPos));

        let aArea = pCreep.pos.adjacentPositions(2);
        let myPos = [];
        _.each(aArea, (a,x) =>
        {
            _.each(a, (ia,y) =>
            {
                if (!_.isUndefined(myControllerPos[x]) && !_.isUndefined(myControllerPos[x][y]))
                {
                    let aPos = new RoomPosition(x,y,pCreep.pos.roomName);
                    let aLook = _.find(_.map(aPos.look(),'type'), (a) => a == 'structure' || a == 'creep');
                    if (_.isUndefined(aLook))
                    {
                        myPos.push(aPos);
                        //this.log(LOG_LEVEL.debug,'LOOK: '+JS(aPos));
                    }
                }
            });
        });
        //this.log(LOG_LEVEL.debug,'hit: '+JS(myPos));

        let aPos = undefined;
        if (myPos.length > 0)
        {
            aPos = _.min(myPos, (a) => aController.pos.getRangeTo(a));
            if (!pCreep.pos.isEqualTo(aPos))
            {
                let res = pCreep.moveTo(aPos,{range: 0, reusePath: 0});
                this.log(LOG_LEVEL.debug,'move from road '+pCreep.name+' '+aPos.toString()+' '+ErrorString(res));
            }
        }
    }

    log(pLevel,pMsg)
    {
        Log(pLevel,'UpgraderOperation '+this.mRoomName+': '+pMsg);
    }
}
module.exports = UpgraderOperation;
