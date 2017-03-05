extend = function()
{
    Object.defineProperties(Nuke.prototype,
    {
        'isMy':
        {
            configurable: true,
            get: function()
            {
                // TODO: most likely the nuke is hostile - because I can not build one for a long time
                // but when I can this should be also true
                // - a nuke has the launchRoomName as property - I could test against my rooms to check this
                return false;
            },
        }
    });
};
extend();
