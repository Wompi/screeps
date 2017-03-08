class CreepBody
{
    constructor()
    {
        this._mEnergy = 0;
        this._mSearch = {};
        this._mBodyParts = {};
        this._mOptions = {};
    }

    setEnergy(pEnergy)
    {
        this.mEnergy = pEnergy;
    }

    setSearch(pSearchPart,pSearchPartOptions)
    {
        _.set(this._mSearch,pSearchPart,pSearchPartOptions);
    }

    setBodyPart(pBodyPart,pBodyPartOptions)
    {
        _.set(this._mSearch,pBodyPart,pBodyPartOptions);        
    }

    setOptions(pOptions)
    {
        this.mOptions = pOptions;
    }



    /**
     * FORMULA: this is a the universal formula to calculate a creep bodyFormula
     *  - ENERGY =
     *                  WORK_PARTS * BODYPART_COST[WORK]
     *                + MOVE_PARTS * BODYPART_COST[MOVE]
     *                + ... and so on for all possible bodyparts
     *  - the ENERGY is known it is the current available room energy or the capacity of the room
     *  - what we now need is one part that we are looking for and functions for all other parts
     *      example: harvester - ENERGY = 1200, WORK ? (max: 5) CARRY (with links/repair?) MOVE (roads?) all other 0
     */
    bodyFormula(pEnergy, pSearch, pBody, pOptions = undefined)
    {
        if (_.isUndefined(pOptions))
        {
            pOptions =
            {
                hasRoads: true,
                moveBoost: '',
            };
        }

        var aBody = {};
        _.each(pBody, (aPartOption,aPartName) =>
        {
            _.each(aPartOption, (aOptionValue, aOptionKey) =>
            {
                if ((typeof aOptionValue === "function"))
                {
                    _.set(aBody,[aPartName,aOptionKey],aOptionValue.call(this,this));
                }
                else
                {
                    _.set(aBody,aPartName,aPartOption);
                }
            });
        });

        //Log(undefined,('aBody: '+JS(aBody)))

        var aMoveAdjust = pOptions.hasRoads ? 1/2 : 1
        if (!_.isUndefined(BOOSTS[MOVE][pOptions.moveBoost]))
        {
            aMoveAdjust = aMoveAdjust / BOOSTS[MOVE][pOptions.moveBoost][BOOST_TASK_FATIGUE];
        }
        var aMoveCost = aMoveAdjust * BODYPART_COST[MOVE];

        // W = (E - _sum(BODY_PARTS) - _sum(CARRY_FOR_BODYPARTS))

        var aSum =  _.reduce(aBody, (result,aPart,aPartKey) =>
        {
            result = result + aPart.count*(BODYPART_COST[aPartKey] + aMoveCost);
            return result;
        },0);
        var aSearchCount = _.floor((pEnergy - aSum) / (BODYPART_COST[pSearch.name] + aMoveCost));

        var aMaxCount = _.floor((50 / (1 + aMoveAdjust)) - _.sum(aBody, 'count'));
        if (_.isUndefined(pSearch.max))
        {
            aSearchCount = _.min([aMaxCount,aSearchCount]);
        }
        else
        {
            var aSearchMax = (typeof pSearch.max === "function") ? pSearch.max.call(arguments[0],this) : pSearch.max;
            aSearchCount = _.min([aMaxCount,aSearchCount,aSearchMax]);
        }

        var aResult = [];
        if (aSearchCount > 0)
        {
            aResult = new Array(aSearchCount).fill(pSearch.name);
            _.each(aBody, (aPart,aPartName) =>
            {
                aResult = aResult.concat(new Array(aPart.count).fill(aPartName));
            });

            var aMoveCount = pOptions.hasRoads ? aResult.length/2 : aResult.length;
            if (!_.isUndefined(BOOSTS[MOVE][pOptions.moveBoost]))
            {
                aMoveCount = aMoveCount / BOOSTS[MOVE][pOptions.moveBoost][BOOST_TASK_FATIGUE];
            }
            aMoveCount = _.ceil(aMoveCount);

            aResult = aResult.concat(new Array(aMoveCount).fill(MOVE));
        }


        var aDerp =
        {
            body: _.sortBy(aResult, p => _.indexOf([TOUGH,MOVE,WORK,CARRY,ATTACK,RANGED_ATTACK,HEAL,CLAIM],p)),
            spawnTime: (_.sum(_.countBy(aResult), (aCount,aPartName) => aCount) * CREEP_SPAWN_TIME),
            aCost: _.reduce(aResult, (result,aPartName) => result = result + BODYPART_COST[aPartName],0),
        }
        return aDerp;
    }

    /**
     * MINER: what does a miner need?
     *  - WORK:
     *      - the work parts are dependent of the source size
     *              SOURCE_ENERGY_CAPACITY: 3000,
     *              SOURCE_ENERGY_NEUTRAL_CAPACITY: 1500,
     *              SOURCE_ENERGY_KEEPER_CAPACITY: 4000,
     *      - a source respawns with
     *              ENERGY_REGEN_TIME: 300,
     *      - the work part has a harvest capacity of
     *              HARVEST_POWER: 2
     *      - this makes the formula for harvesting:
     *              PARTS = SIZE/TIME/POWER (unboosted)
     *                  SOURCE_OWNED: 5
     *                  SOURCE_NEUTRAL: 2.5
     *                  SOURCE_KEEPER: 6.6666
     *              PARTS = SIZE/TIME/(POWER * BOOSTPOWER) (boosted [ 4 6 8 ])
     *                  SOURCE_OWNED:   [ 1.250, 0.8333, 0.6250]
     *                  SOURCE_NEUTRAL: [ 0.625, 0.4166, 0.3125]
     *                  SOURCE_KEEPER:  [ 1.666, 1.1111, 0.8333]
     *      - not only the needed work parts are interesting as well the time it needs to clean the source.
     *        this time could be used to make a harvester that can travel between sources and clean both sources
     *        and for keeper sources it would be rewarding to clean the source as fast as possible
     *      - lets make a calculation:
     *              (32 parts -> maxBoost -> keeperSource)
     *                   TIME = SIZE / (PARTS * (POWER * BOOSTPOWER)) = 7.8
     *
     * B = 2*A;
     * C = (A+B) / 2
     * E = A * 100 * B * 50 + C * 50;
     *
     *
     *
     */
}
module.exports = CreepBody;
