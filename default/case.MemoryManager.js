var mod =
{
    cacheMemory: function(propertyValue,rootMemory,loop,filter,receiver)
    {
        if (_.isUndefined(propertyValue) )
        {
            //logERROR('EXT: new .. '+_.isUndefined(this.memory.myStructureExtensions));
            if (_.isUndefined(rootMemory) || rootMemory.hasChanged)
            {
                //logERROR('EXT: new memory');
                rootMemory = { id: [] , hasChanged: false};

                propertyValue = filter.apply(receiver,[]);

                _.forEach(propertyValue,(aExt) =>
                {
                    rootMemory.id.push(aExt.id);
                });
                logERROR('MEMORY_MANAGER: recalculate cache .....');
                //logERROR('DERP: '+JSON.stringify(propertyValue));
                logERROR('DERP: '+JSON.stringify(rootMemory));
            }
            else
            {
                //logERROR('EXT: load from memory');
                propertyValue = [];
                _.forEach(rootMemory.id, (aID) =>
                {
                    var aExt = Game.getObjectById(aID);
                    //logWARN(JSON.stringify(aExt));
                    if (_.isNull(aExt))
                    {
                        rootMemory.hasChanged = true;
                    }
                    else
                    {
                        propertyValue.push(aExt);
                    }
                });
            }
            _.forEach(propertyValue,loop);
        }
        return propertyValue;
    },
};
module.exports = mod;
