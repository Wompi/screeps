class ReactionsHaulerMemory
{
    constructor(pOperation)
    {
        this.mOperation = pOperation;
        this.mRoomName = this.mOperation.mRoomName;
    }

    processMemory()
    {
        if (_.isUndefined(Memory.operations.reactions))
        {
            Memory.operations.reactions = {};
        }
        if (_.isUndefined(Memory.operations.reactions.hauler))
        {
            Memory.operations.reactions.hauler = {};
        }

        //delete Memory.operations.reactions.hauler[pRoomName];

        var myStats = Memory.operations.reactions.hauler[this.mRoomName];
        if (_.isUndefined(myStats))
        {
            var aStats =
            {
                [RESOURCE_UTRIUM_HYDRIDE]:
                {
                    labID: null,
                    labAmount: 0,
                },
                [RESOURCE_UTRIUM_OXIDE]:
                {
                    labID: null,
                    labAmount: 0,
                }

            }
            Memory.operations.reactions.hauler[this.mRoomName] = aStats;
        }

        this.setLabID(RESOURCE_UTRIUM_OXIDE,'586c4b1463d011e1364344ae')
        this.setLabID(RESOURCE_UTRIUM_HYDRIDE,'5877ecd15dc3eff517f28f15')

        // consider to delay this request because the amount is likely not to change over a very large
        // amount of turns (I need this freeking TIMELINE dammit)

        if (Game.time % 10 == 0)
        {
            _.forEach(Memory.operations.reactions.hauler[this.mRoomName], (aReactionValue, aReactionKey) =>
            {
                //logDERP('aReactionValue: '+JSON.stringify(aReactionValue)+' aReactionKey: '+aReactionKey);
                var aLab = Game.getObjectById(this.getLabID(aReactionKey));
                if (!_.isNull(aLab))
                {
                    this.setReactionAmount(aReactionKey,aLab.mineralAmount)
                }
            });
        }
    }

    setReactionAmount(pReaction,pAmount)
    {
        Memory.operations.reactions.hauler[this.mRoomName][pReaction].labAmount = pAmount;
    }

    getReactionAmount(pReaction)
    {
        return Memory.operations.reactions.hauler[this.mRoomName][pReaction].labAmount;
    }

    setLabID(pReaction,pID)
    {
        if (_.isNull(Memory.operations.reactions.hauler[this.mRoomName][pReaction].labID))
        {
            Memory.operations.reactions.hauler[this.mRoomName][pReaction].labID = pID;
        }
    }

    getLabID(pReaction)
    {
        return Memory.operations.reactions.hauler[this.mRoomName][pReaction].labID;
    }

    getReactions()
    {
        return _.keys(Memory.operations.reactions.hauler[this.mRoomName]);
    }
}
module.exports = ReactionsHaulerMemory;
