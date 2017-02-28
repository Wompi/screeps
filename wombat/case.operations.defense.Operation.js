class DefenseOperation
{
    constructor()
    {
        this.mTowers = PCache.getEntityCache(ENTITY_TYPES.tower);
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
            if (myInvaders.length > 0)
            {
                var aInvader = _.min(myInvaders, (aCreep) => aCreep.pos.getRangeTo(aTower));
                var res = aTower.attack(aInvader);
                Log(undefined, 'ATTACK: '+ErrorString(res));
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
