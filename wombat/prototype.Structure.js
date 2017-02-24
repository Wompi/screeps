
extend = function()
{
    Object.defineProperties(Structure.prototype,
    {
        'entityType':
        {
            configurable: true,
            get: function()
            {
                return  this.structureType;;
            },
        },
    });
};
extend();
