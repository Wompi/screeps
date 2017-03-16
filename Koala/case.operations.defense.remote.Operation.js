class DefenseRemoteOperation extends Operation
{
    constructor(pRoomID)
    {
        super('DefenseRemoteOperation');
        this.mCreep = undefined;
        this.mRoomID = pRoomID;
    }

    processOperation()
    {
        this.log(LOG_LEVEL.error,'processOperation()');
        this.spawnDefender();
        this.doDefend();
    }

    doDefend()
    {
        if (_.isUndefined(this.mCreep) || this.mCreep.spawning) return;

        if (this.mCreep.pos.roomName != this.mCreep.memory.target)
        {
            let res = this.mCreep.travelTo({pos: new RoomPosition(25,25,this.mCreep.memory.target)});
            this.log(LOG_LEVEL.debug,this.mCreep.name+' travel to room - '+this.mCreep.memory.target+' res: '+ErrorString(res));
        }
        else
        {
            let myHostiles = _.filter(PCache.getHostileEntityCache(ENTITY_TYPES.creep), (aH) => aH.pos.roomName == this.mCreep.pos.roomName);
            if (myHostiles.length > 0)
            {
                let aHostile = _.min(myHostiles, (aH) => aH.pos.getRangeTo(this.mCreep));

                // TODO: fiddle with the costmatrix a bit here - later to make better engage decisions
                this.mCreep.moveTo(aHostile.entity, {range: 1, resusePath: 0});

                let res = this.mCreep.attack(aHostile.entity);
                if (res != OK)
                {
                    this.doHeal();
                }

                this.doRangedAttack(myHostiles);
                this.log(LOG_LEVEL.debug,this.mCreep.name+' engaged hostile - '+aHostile.pos.toString()+' res: '+ErrorString(res));
            }
            else
            {
                this.mCreep.travelTo(this.mCreep.room.controller, {range: 3});

                if (this.mCreep.pos.inRangeTo(this.mCreep.room.controller,3))
                {
                    this.moveCreepFromRoad(this.mCreep);
                }
                this.doHeal();
            }
        }
    }

    doRangedAttack(pHostiles)
    {
        let myHostiles = _.filter(pHostiles, (aH) =>
        {
            if (!aH.pos.inRangeTo(this.mCreep,3)) return false;
            return true;
        })

        if (myHostiles.length > 0)
        {
            let aHostile = myHostiles[0];
            if (myHostiles.length > 1)
            {
                // TODO: this might not be so good but for a start I engage healers with ranged so he has to heal himself
                aHostile = _.max(myHostiles, (aH) => aH.getActiveBodyparts(HEAL));
            }
            let res = this.mCreep.rangedAttack(aHostile.entity);
            this.log(LOG_LEVEL.debug,this.mCreep.name+' ranged engaged - '+aHostile.pos.toString()+' res: '+ErrorString(res));
        }
    }

    doHeal()
    {
        if (this.mCreep.hits < this.mCreep.hitsMax)
        {
            let res = this.mCreep.heal(this.mCreep);
            this.log(LOG_LEVEL.debug,this.mCreep.name+' heal res: '+ErrorString(res));
        }
    }

    moveCreepFromRoad(pCreep)
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

    spawnDefender()
    {
        var myCreeps = getCreepsForRole(CREEP_ROLE.remoteDefender);
        var aRoomID = this.mRoomID;
        this.mCreep = _.find(myCreeps, (aCreep) => aCreep.memory.target == aRoomID);

        if (!_.isUndefined(this.mCreep)) return;

        var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
        {
            if (_.isUndefined(aCreepMem.target)) return false;
            if (!_.isUndefined(Game.creeps[aCreepName])) return false;
            return aCreepMem.target == aRoomID && aCreepMem.role == CREEP_ROLE.remoteDefender;
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
            let aPos = new RoomPosition(25,25,aRoomID);
            let aSpawn = _.min(mySpawns, (aS) => aS.pos.wpos.getRangeTo(aPos.wpos));

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
                let res = aSpawn.createCreep(aBody.body,aName,{role: CREEP_ROLE.remoteDefender, target: aRoomID, spawn: aSpawn.pos.wpos.serialize()})
                this.log(LOG_LEVEL.info,'createCreep - '+ErrorString(res));
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

        // TODO: the carry parts should be adjusted to the current task - so if the task is heavy un/loading
        //       to the terminal/storage it should have more parts otherwise just normal 1
        //
        var aSearch =
        {
            name: TOUGH,
            max: 2,
        };
        var aBodyOptions =
        {
            hasRoads: false,
            moveBoost: '',
        };

        var aSpawn = _.max(PCache.getFriendlyEntityCache(ENTITY_TYPES.spawn), (aS) => aS.room.energyCapacityAvailable);
        let aEnergy = aSpawn.room.energyCapacityAvailable;
        var aBody =
        {
            [ATTACK]:
            {
                count: 4
            },
            [HEAL]:
            {
                count: 1,
            },
            [RANGED_ATTACK]:
            {
                count: 1,
            },
        };
        var aResult = aCreepBody.bodyFormula(aEnergy,aSearch,aBody,aBodyOptions);

        this.log(LOG_LEVEL.debug,'body: '+JS(aResult));
        return aResult;
    }
}
module.exports = DefenseRemoteOperation;
