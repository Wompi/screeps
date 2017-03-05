extend = function()
{
    Object.defineProperties(ConstructionSite.prototype,
    {
        'isMy':
        {
            configurable: true,
            get: function()
            {
                return this.my    // a site has ownership
            },
        }
    });
};
extend();
