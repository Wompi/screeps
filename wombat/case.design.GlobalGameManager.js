/**
 * This class is a organizer for structure / important positions and general easy use of all game entities
 *
 * - all tick operations should grab the entities from this class because it will only cost CPU once at a new commit
 *
 *
 */
class GlobalGameManager
{
    constructor()
    {
        this.mEntities = {};
        this.init();
    }

    /**
     * This reads the CACHE and filters the informations to its related sub collections
     *  -
     */
    init()
    {
        this.mEntities = {};
        for (var aEntity of Cache.mCache)
        {
            if (!_.isUndefined(aEntity))
            {
                var aType = aEntity.entityType;
                if (_.isUndefined(this.mEntities[aType]))
                {
                    this.mEntities[aType] = [];
                }
                this.mEntities[aType].push(aEntity);
            }
        }
    }

    getEntityForType(pType)
    {
        if (_.isUndefined(this.mEntities[pType]))
        {
            return [];
        }

        return this.mEntities[pType];
    }

    getStructureForRoom(pType,pRoom)
    {
        if (_.isUndefined(this.mEntities[pType]))
        {
            return [];
        }

        return _.filter(this.mEntities[pType], (aEntity) => aEntity.structureType == pType);
    }
}
module.exports = GlobalGameManager;
