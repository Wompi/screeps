var mod =
{
    // // Useful for ensuring that memory objects exist.
    // // This can be done like this:
    // const sourcesForRoom = ensure(Memory, 'sourcesForRoom');  // roomName --> [source]
    // for (const room of _.values(Game.rooms))
    // {
    //     ensure(sourcesForRoom, room.name, () => room.find(FIND_SOURCES));
    // }
    //

    // // ensure() avoids this kind of repeated pattern in your code
    // if (!Memory.sourcesForRoom) Memory.sourcesForRoom = {};
    // const sourcesForRoom = Memory.sourcesForRoom;
    ensure: function(parent, childKey, constructor = ()=>({}))
    {  // ensures that the child object exists.
        let child = parent[childKey];
        if (!child)
        {
            child = constructor();
            parent[childKey] = child;
        }
        return child;
    },

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
