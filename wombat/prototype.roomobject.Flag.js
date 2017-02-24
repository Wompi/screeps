
extend = function()
{
    Object.defineProperties(Flag.prototype,
    {
        'id':
        {
            configurable: true,
            get: function()
            {
                return this.name;
            },
        }
    });
};
extend();
