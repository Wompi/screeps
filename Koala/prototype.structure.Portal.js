extend = function()
{
    Object.defineProperties(StructurePortal.prototype,
    {
        'isMy':
        {
            configurable: true,
            get: function()
            {
                return true; // count every portal as mine - technically it is neutral but well
            },
        }
    });
};
extend();
