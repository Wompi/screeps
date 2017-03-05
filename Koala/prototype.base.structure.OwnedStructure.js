



extend = function()
{
    Object.defineProperties(OwnedStructure.prototype,
    {
        'isMy':
        {
            configurable: true,
            get: function()
            {
                return this.my;
            },
        }
    });
};
extend();
