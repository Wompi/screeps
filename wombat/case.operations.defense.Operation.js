class DefenseOperation
{
    constructor()
    {
        this.mTowers = _.filter(Game.structures, (aTower) => aTower.structureType == STRUCTURE_TOWER);
    }

    processOperation(pVisualize = false)
    {
        _.each(this.mTowers, (aTower) =>
        {
            if (pVisualize)
            {
                this.visalizeCombatArea(aTower);
            }


            var aRoom = aTower.room;
            var myInvaders = aRoom.find(FIND_HOSTILE_CREEPS);
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
            var aRoom = pTower.room;

            var x = _.max([0,pTower.pos.x-aRange]);
            var y = _.max([0,pTower.pos.y-aRange]);
            aRoom.visual.rect(x, y, _.min([aRange*2,49-x]), _.min([aRange*2,49-y]),aStyle);
        });
    }
}
module.exports = DefenseOperation;
