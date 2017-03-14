class DefenseOperation
{
    constructor()
    {
        this.mTowers = PCache.getFriendlyEntityCache(ENTITY_TYPES.tower);
    }

    processOperation(pVisualize = false)
    {
        this.log(LOG_LEVEL.error,'processOperation()');

        _.each(this.mTowers, (aTower) =>
        {
            if (pVisualize)
            {
                this.visalizeCombatArea(aTower);
            }


            var myInvaders = aTower.room.find(FIND_HOSTILE_CREEPS);


            // let aCreep = _.find(Game.creeps, (aCreep) => aCreep.hits < aCreep.hitsMax)
            // if (!_.isUndefined(aCreep))
            // {
            //     let res = aTower.heal(aCreep);
            //     Log(LOG_LEVEL.info,'heal '+ErrorString(res));
            // }
            //else
            if (myInvaders.length > 0)
            {
                var aInvader = myInvaders[0];
                let myRoomTowers = _.filter(this.mTowers, (aT) => aT.pos.roomName == aInvader.pos.roomName);

                let aMap = {};
                for (let aT of myRoomTowers)
                {
                    for (let aI of myInvaders)
                    {
                        let aHealPower = aI.getActiveBodyparts(HEAL) * HEAL_POWER;
                        let aDmg = aT.calculateDamageTillBorder(aI.pos,aHealPower);
                        _.set(aMap,aI.id,_.get(aMap,aI.id,0) + aDmg);
                    }
                }

                // ,"owner":{"username":"Invader"}
                let myTargets = _.map(aMap, (aDmg,aID) =>
                {
                    let aH = _.find(myInvaders, (aI) => aI.id == aID);
                    this.log(LOG_LEVEL.debug,'aH: '+JS(aH));
                    if (aH.hits < aDmg) return aH;
                    if (!_.isUndefined(aH.owner) && aH.owner.username == 'Invader') return aH;
                    return undefined;
                })
                myTargets = _.filter(myTargets, (aT) => !_.isUndefined(aT));

                if (myTargets.length > 0)
                {
                    this.log(LOG_LEVEL.debug,'myTargets: '+JS(myTargets));

                    let aTarget = _.min(myTargets,'hits');
                    //let aTarget = _.min(myTargets,(aT) => aT.pos.getRangeTo(aTower));

                    this.log(LOG_LEVEL.debug,'aTarget: '+JS(aTarget));
                    Log(LOG_LEVEL.info,'TOWER DMG: '+JS(aMap));

                    if (!_.isUndefined(aTarget))
                    {
                        var res = aTower.attack(aTarget);
                        Log(undefined, 'ATTACK: '+ErrorString(res));
                    }
                }
                else
                {
                    this.log(LOG_LEVEL.info, 'TARGETS HAVE TO MUCH HITPOINTS! - danger?');
                }
            }
            else
            {
                let aCreep = _.find(Game.creeps, (aCreep) => aCreep.hits < aCreep.hitsMax)
                if (!_.isUndefined(aCreep))
                {
                    let res = aTower.heal(aCreep);
                }
            }
        });
    }


    visalizeCombatArea(pTower)
    {
        var myRanges =
        {
            [TOWER_OPTIMAL_RANGE]: {fill: 'transparent', stroke: COLOR.red },
            [TOWER_FALLOFF_RANGE]: {fill: 'transparent', stroke: COLOR.yellow },
        }

        _.each(myRanges, (aStyle,aRange) =>
        {
            aRange = Number(aRange);

            var x = _.max([0,pTower.pos.x-aRange]);
            var y = _.max([0,pTower.pos.y-aRange]);
            pTower.room.visual.rect(x, y, _.min([aRange*2,49-x]), _.min([aRange*2,49-y]),aStyle);
        });
    }

    log(pLevel,pMsg)
    {
        Log(pLevel,'DefenseOperation: '+pMsg);
    }
}
module.exports = DefenseOperation;
