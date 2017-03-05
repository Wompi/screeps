extend = function()
{
    Object.defineProperties(Resource.prototype,
    {
        'isMy':
        {
            configurable: true,
            get: function()
            {
                // TODO: a resource could be hostile in war aka we don't want to go for resources that are dangerous
                // maybe this should be a nother check somewhere else but for now every resource is counted as my
                return true;
            },
        }
    });
};
extend();
