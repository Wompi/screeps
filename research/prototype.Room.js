

Room.prototype.test = function()
{
    console.log('DERP');
};

Room.prototype.cache = require('case.Memory');

Room.prototype.init = function()
{
    console.log('ROOM INIT -------');
    //var MemoryManager = require('case.MemoryManager');

    Object.defineProperties(Room.prototype,
    {
        'derpProperty':
        {
            configurable: true,
            get: function ()
            {
                console.log('ROOM: derpproperty - '+_.isUndefined(this._derpProperty));
                if (_.isUndefined(this._derpProperty))
                {
                    this._derpProperty = 'depp';
                }
                return this._derpProperty;
            }
        },
        'mySources':
        {
            configurable: true,
            get: function ()
            {

                // var that = this;
                // var aFilter = function()
                // {
                //     return that.find(FIND_SOURCES);
                // };
                // //var aLoop = (aExtension) => { aExtension.init();};
                // this._mySources = this.cache(
                //     that._mySources,
                //     'rooms.'+this.name+'.mySources',
                //     undefined,
                //     aFilter
                // );

                if (_.isUndefined(this._mySources))
                {
                    this._mySources = this.find(FIND_SOURCES);
                }

                return this._mySources;
            }
        },

    });
};
