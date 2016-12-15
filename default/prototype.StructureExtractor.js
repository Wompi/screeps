var mod =
{
    extend: function()
    {
        Object.defineProperties(StructureExtractor.prototype,
        {
            'myMiningBoxes':
            {
                configurable: true,
                get: function ()
                {

                    if (_.isUndefined(this._myMiningBoxes))
                    {
                        var aBox = [];
                        var aRoom = this.room;
                        if (!_.isUndefined(aRoom))
                        {
                            var myRoomContainers = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.container);

                            aBox = _.filter(myRoomContainers,(a) => { return a.pos.isNearTo(this.pos)});
                        }
                        this._myMiningBoxes = aBox;
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

        StructureExtractor.prototype.init = function()
        {
            delete this._hasMiningBox;

            if (FUNCTION_CALLS_STRUCTURE_EXTRACTOR)
            {
                logDEBUG('STRUCTURE EXTRACTOR: init - ['+this.pos.x+' '+this.pos.y+'] ');
            }

        };
    }
};
module.exports = mod;
