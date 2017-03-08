class DefenseOperation
{
    constructor()
    {
        this.mTowers = PCache.getFriendlyEntityCache(ENTITY_TYPES.tower);
    }

    processOperation(pVisualize = false)
    {
        _.each(this.mTowers, (aTower) =>
        {
            if (pVisualize)
            {
                this.visalizeCombatArea(aTower);
            }


            var myInvaders = aTower.room.find(FIND_HOSTILE_CREEPS);


            let aCreep = _.find(Game.creeps, (aCreep) => aCreep.hits < aCreep.hitsMax)
            if (!_.isUndefined(aCreep))
            {
                let res = aTower.heal(aCreep);
                Log(LOG_LEVEL.info,'heal '+ErrorString(res));
            }
            else if (myInvaders.length > 0)
            {
                var aInvader = myInvaders[0];
                let a = _.filter(this.mTowers, (aT) => aT.pos.roomName == aInvader.pos.roomName);

                let aMap = {};
                for (let aT of this.mTowers)
                {
                    for (let aI of myInvaders)
                    {
                        let aDmg = aT.calculateTowerEffectiveness(aT.pos.getRangeTo(aI),TOWER_POWER_ATTACK);
                        _.set(aMap,aI.id,_.get(aMap,aI.id,0) + aDmg);
                    }
                }


                Log(LOG_LEVEL.info,'TOWER DMG: '+JS(aMap));


                aInvader = _.min(myInvaders, (aCreep) =>
                {
                    if ( aCreep.getActiveBodyparts(ATTACK) == 0) return Infinity;
                    return aCreep.pos.getRangeTo(aTower);
                });

                if ( (aInvader.pos.x < 46 && aInvader.pos.x > 4 ) && (aInvader.pos.y < 46 && aInvader.pos.y > 4 ))
                {
                    var res = aTower.attack(aInvader);
                    Log(undefined, 'ATTACK: '+ErrorString(res));
                }
                else
                {
                    Log(LOG_LEVEL.info,'Invader: '+aInvader.pos.toString()+' is near the edge NO SHOOTING!');
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
}
module.exports = DefenseOperation;
