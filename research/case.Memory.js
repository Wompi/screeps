

var register = function(propertyValue,rootMemory,loop,filter)
{
    console.log('CALL REGISTER!');
    if (_.isUndefined(propertyValue) )
    {
        //console.log('EXT: new '+rootMemory+'.. '+_.isUndefined(_.get(Memory,rootMemory)));
        if (_.isUndefined(_.get(Memory,rootMemory)) || rootMemory.hasChanged)
        {
            //logERROR('EXT: new memory');
            //rootMemory = ;
            _.set(Memory,rootMemory,{ id: [] , hasChanged: false});

            propertyValue = filter();

            var derp = _.get(Memory,rootMemory+'.id');
            _.forEach(propertyValue,(aExt) =>
            {
                derp.push(aExt.id);
                console.log('ID: '+aExt.id);
            });
            //console.log('MEMORY_MANAGER: recalculate cache .....');
            //logERROR('DERP: '+JSON.stringify(propertyValue));
            //console.log('DERP: '+JSON.stringify(rootMemory));
        }
        else
        {
            //logERROR('EXT: load from memory');
            propertyValue = [];
            _.forEach(_.get(Memory,rootMemory+'.id'), (aID) =>
            {
                var aExt = Game.getObjectById(aID);
                //logWARN(JSON.stringify(aExt));
                if (_.isNull(aExt))
                {
                    _.set(Memory,rootMemory+'.hasChanged', true );
                }
                else
                {
                    propertyValue.push(aExt);
                }
            });
        }
        if (!_.isUndefined(loop))
        {
            _.forEach(propertyValue,loop);
        }
    }
    return propertyValue;
};



// var register = function(derp)
// {
//     console.log('REGISTER: '+derp);
// };
module.exports = register;
