class MiningMemory
{
    constructor(pOperation)
    {
        this.mOperation = pOperation;
        this.init();
    }

    spawnSourceRelations()
    {
        /// wow very nice delayed spawn -> source dist caclulation
        var spawnTest = MemoryManager.ensure(Memory,'spawnTest');
        _.forEach(Game.spawns, (aSpawn) =>
        {
            var aSpawnMemory = MemoryManager.ensure(spawnTest, aSpawn.name);
            _.forEach(Game.rooms, (aRoom) =>
            {
                _.forEach(aRoom.getRoomObjects(ROOM_OBJECT_TYPE.source), (aSource) =>
                {
                    MemoryManager.ensure(aSpawnMemory,aSource.id, () => 0);
                })
            })
        })

        var mySpawns = [];
        var mySources = [];
        _.forEach(Game.rooms, (aRoom) =>
        {
            if (aRoom.my)
            {
                mySources = mySources.concat(aRoom.getRoomObjects(ROOM_OBJECT_TYPE.source));
                mySpawns = mySpawns.concat(aRoom.getRoomObjects(ROOM_OBJECT_TYPE.spawn));
            }
        })
        for (var i=0; i<mySpawns.length;i++)
        {
                var aSpawn = mySpawns[i];
                for (var j=0; j<mySources.length;j++)
                {
                    var aSource = mySources[j];
                    var aMod = (Game.time + (i*mySources.length + j)) % (mySpawns.length*mySources.length);
                    if ( aMod == 0)
                    {
                        var aSpawnPos = aSpawn.getSpawnPos();
                        var aPath = Util.getPath(aSource.pos,(_.isUndefined(aSpawnPos) ? aSpawn.pos : aSpawnPos));
                        logDERP('Spawn: ['+i+' '+j+']['+aSpawn.name+'] '+'['+aSource.pos.x+' '+aSource.pos.y+'] - '+aPath.path.length+' incomplete='+aPath.incomplete);
                        Memory.spawnTest[aSpawn.name][aSource.id] = aPath.path.length;
                    }
                }
        }

        _.forEach(Memory.spawnTest, (aSpawn,key) =>
        {
            var aSum  = _.sum(aSpawn);
            logDERP('SPAWN: '+JSON.stringify(key)+' sum = '+aSum);
        })

    }


    init()
    {
        var MEM_ROOT = 'operationsTest';   // TODO: change this to operations when ready!
        var MEM_OPERATION = 'mining';

        if (_.isUndefined(Memory[MEM_ROOT]))
        {
            Memory[MEM_ROOT] = {}
        }
        if (_.isUndefined(Memory[MEM_ROOT][MEM_OPERATION]))
        {
            Memory[MEM_ROOT][MEM_OPERATION] = {};
        }
    }

}
module.exports = MiningMemory;
