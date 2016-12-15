var mod =
{
    extend: function()
    {
        Object.defineProperties(Mineral.prototype,
        {
            'hasExtractor':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._hasExtractor) )
                    {
                        this._hasExtractor = this.myExtractor.length > 0;
                    }
                    return this._hasExtractor;
                }
            },
            'myExtractor':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._myExtractor) )
                    {
                        this._myExtractor = [];
                        var myRoomExtractors = this.room.getRoomObjects(ROOM_OBJECT_TYPE.extractor);
                        if (myRoomExtractors.length > 0)
                        {
                            this._myExtractor = myRoomExtractors;
                        }
                    }
                    return this._myExtractor;
                }
            },
            'myMiningBoxes':
            {
                configurable: true,
                get: function ()
                {

                    if (_.isUndefined(this._myMiningBoxes))
                    {
                        var myRoomContainers = this.room.getRoomObjects(ROOM_OBJECT_TYPE.container);
                        myContainers = _.filter(myRoomContainers,(a) => { return a.pos.isNearTo(this.pos)});
                        this._myMiningBoxes = myContainers;
                    }
                    return this._myMiningBoxes;
                }
            },
            'hasMiningBox':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._hasMiningBox) )
                    {
                        this._hasMiningBox = (this.myMiningBoxes.length > 0);
                    }
                    return this._hasMiningBox;
                }
            },
        });

        Mineral.prototype.init = function()
        {
            delete this._hasExtractor;
            delete this._myExtractor;
            delete this._myMiningBoxes;
            delete this._hasMiningBox;

            if (FUNCTION_CALLS_MINERAL)
            {
                logDEBUG('MINERAL: init - ['+this.pos.x+' '+this.pos.y+'] T: '
                        +this.mineralType+' A: '+this.mineralAmount.toFixed(2)+' T: '+this.ticksToRegeneration);
            }

        };
    }
};
module.exports = mod;
