var mod =
{
    extend: function()
    {
        Object.defineProperties(StructureController.prototype,
        {
            'myUpgraderBoxes':
            {
                configurable: true,
                get: function ()
                {

                    if (_.isUndefined(this._myUpgraderBoxes))
                    {
                        var myRoomContainers = this.room.getRoomObjects(ROOM_OBJECT_TYPE.container);
                        myContainers = _.filter(myRoomContainers,(a) => { return a.pos.inRangeTo(this.pos,3)});
                        this._myUpgraderBoxes = myContainers;
                    }
                    return this._myUpgraderBoxes;
                }
            },
            'hasUpgraderBox':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._hasUpgraderBox) )
                    {
                        this._hasUpgraderBox = (this.myUpgraderBoxes.length > 0);
                    }
                    return this._hasUpgraderBox;
                }
            },
            'mySpawn':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._mySpawn))
                    {
                        var myRoomSpawns = this.room.getRoomObjects(ROOM_OBJECT_TYPE.spawn);
                        var mySpawns = _.filter(myRoomSpawns, (a) =>
                        {
                            return a.pos.getRangeTo(this.pos) < 3;
                        });
                        this._mySpawn = mySpawns;
                    }
                    return this._mySpawn;
                }
            },
            'isCloseToSpawn':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._isCloseToSpawn))
                    {
                        this._isCloseToSpawn = (this.mySpawn.length > 0);
                    }
                    return this._isCloseToSpawn;
                }
            },
        });

        StructureController.prototype.init = function()
        {
            delete this._myUpgraderBoxes;
            delete this._hasUpgraderBox;
            delete this._isCloseToSpawn;
            delete this._mySpawn;

            if (FUNCTION_CALLS_STRUCTURE_CONTROLLER)
            {
                logDEBUG('STRUCTURE CONTROLLER: init - ['+this.pos.x+' '+this.pos.y+'] ');
            }
        };
    }
};
module.exports = mod;
