/**
 *  GloablCache: a class that is supposed to be the global cache for structures
 *	 - the cache is just a plain list of all game entities and should not be used for infarmation gathering
 *	    - for this you should use the GlobalGameManager
 *	 - the chache will be generated once from scretch (new commit / server start) and after this it will
 *	   be just updated from memory - therefore you only pay once for the full update
 *
 *
 */
class GlobalCache
{
	constructor(pMemoryPath)
	{
		this.mLastUpdate = Game.time;
		this.mCache = [];
	}

	updateCache()
	{
		var needsCleaning = false;
		_.each(this.mCache, (aEntity,aIndex) =>
		{
			if (!_.isUndefined(aEntity))
			{
				var aCurrenEntity = Game.getObjectById(aEntity.id);
				if (aCurrenEntity != null)
				{
					this.mCache[aIndex] = aCurrenEntity;
				}
				else
				{
					delete this.mCache[aIndex];
					needsCleaning = true;
				}
			}
		});

		// TODO: this is not realy needed because the GlobalGameManager should filter it out as well
		if (needsCleaning)
		{
			Log(undefined,'----- CLeaning ------');
			this.mCache = _.filter(this.mCache, (aEntity) => !_.isUndefined(aEntity));
		}
	}


	/**
	 *  the make function is called as callback from the Servernodes and has 2 states [new|update]
	 *  - not sure how to approach this
	 *	- the new one is the same as the update but with a [delete Memory.structures;] for reseting the
	 *    memory
	 *
	 */
	makeCache(pIsReset)
	{
		var aMem = Mem.getEnsured(Memory,['cache','entities'],
		{
			lastUpdate: Game.time,
			IDs: [],
		});


		if (pIsReset)
		{
			aMem.IDs = [];
			Log(undefined,'Cache: make new');
	        // _.each(Game.structures, (aStruct) =>
	        // {
			// 	var aDerp = Mem.getEnsured(this.mStructures.cache,aStruct.structureType,[]);
	        //     aDerp.push(aStruct);
	        //     aMem.IDs.push(aStruct.id);
	        //     Log(WARN,'CHACHE RESET: add '+aStruct.id+' '+aStruct.structureType+' to chache!');
	        // });
			_.each(Game.rooms, (aRoom) =>
	        {
				var myRoomStructures = aRoom.find(FIND_STRUCTURES);
				this.mCache = this.mCache.concat(myRoomStructures);
				aMem.IDs = aMem.IDs.concat(_.map(myRoomStructures,'id'));
		        Log(WARN,'CHACHE RESET: add '+myRoomStructures.length+' entities for room '+aRoom.name+' to chache!');
	        });
		}
	    else
	    {
	        Log(undefined,'Cache: make from memory');
			var needsCleaning = false;
			this.mCache = _.map(aMem.IDs, (aID,aIndex) =>
			{
				var aEntity = Game.getObjectById(aID);
				if (aEntity == null)
				{
					aEntity = undefined;
					needsCleaning = true;
					delete aMem.IDs[aIndex];
				}
				return aEntity;
			});
			Log(WARN,'CHACHE MEM: added  '+this.mCache.length+' to chache!');

			// TODO: not realy needed because it should be handled in GlobalGameManager
			if (needsCleaning)
			{
	        	aMem.IDs = _.filter(aMem.IDs, (aID) => !_.isUndefined(aID));
			}
	    }


	    Log(undefined, 'CACHE: global cache available - '+this.mLastUpdate)
	};
}
module.exports = GlobalCache;
