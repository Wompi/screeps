class RoomManager
{
    constructor(pRoom)
    {
        this.myRoom = pRoom;
        //this.myRoom.init();
    }

    toString()
    {
        return 'RoomManager - '+this.room.name;
    }

    process()
    {
        if (!this.myRoom.my) return;

        //var a = Game.cpu.getUsed();
        //this.processSpawns();
        // var b = Game.cpu.getUsed();
        // logWARN('PROFILE: room - processSpawns() = '+(b-a));
        // var a = Game.cpu.getUsed();
        //this.processCreeps();
        // var b = Game.cpu.getUsed();
        // logWARN('PROFILE: room - processCreeps() = '+(b-a));
        // var a = Game.cpu.getUsed();
        //this.processTowers();
        // var b = Game.cpu.getUsed();
        // logWARN('PROFILE: room - processTowers() = '+(b-a));
        // var a = Game.cpu.getUsed();
        //this.processLinks();
        // var b = Game.cpu.getUsed();
        // logWARN('PROFILE: room - processLinks() = '+(b-a));

    //    roomTowerLoop(room);
    //    roomCreepLoop(room);
    //    roomRescourceLoop(room);
   }

   // TODO: this is just avery basic link logic implementation - find a link near a mining source and make him a
   // provider - all other links are receivers (dead simple)
   // - for later consider a sort of linkmanager and handle the flow through needs
   processLinks()
   {
       var myLinks = this.myRoom.getRoomObjects(ROOM_OBJECT_TYPE.link).reverse();
       if (myLinks.length == 0 ) return;

       var myProviders = _.filter(myLinks, (a) => { return a.isProvider()});
       var myReceivers = _.filter(myLinks, (a) => { return a.isReceiver()});

       _.forEach(myProviders, (aProvider) =>
       {
           _.forEach(myReceivers, (aReceiver) =>
           {
                if (aProvider.cooldown == 0 && aProvider.energy == aProvider.energyCapacity && aReceiver.energy == 0)
                {
                    var result = aProvider.transferEnergy(aReceiver);
                    logDEBUG('LINKS: provider link ['+aProvider.pos.x+' '+aProvider.pos.y+'] transfers energy to ['+aReceiver.pos.x+' '+aReceiver.pos.y+'] ... '+ErrorSting(result));
                }
           })
       });
   }

   processSpawns()
   {
       var myCreeps = this.myRoom.getRoomObjects(ROOM_OBJECT_TYPE.creep);
       var mySpawns = this.myRoom.getRoomObjects(ROOM_OBJECT_TYPE.spawn);

       var myRoomSpawns =
       [
           new CREEP_ROLE['fixer'].spawn('fixer'),
           new CREEP_ROLE['miner'].spawn('miner'),
           new CREEP_ROLE['mineral miner'].spawn('mineral miner'),
           new CREEP_ROLE['mineral hauler'].spawn('mineral hauler'),
           new CREEP_ROLE['supplier'].spawn('supplier'),
           new CREEP_ROLE['extension reloader'].spawn('extension reloader'),
           new CREEP_ROLE['upgrader'].spawn('upgrader'),
           new CREEP_ROLE['builder'].spawn('builder'),
           new CREEP_ROLE['broker'].spawn('broker'),
       ];
       var aSpawn = _.find(mySpawns, (aSpawn) =>
       {
           return !aSpawn.spawning;
       });

       _.forEach(myRoomSpawns, (a) => { a.processSpawn(aSpawn); });

       var myCreeps = this.myRoom.find(FIND_MY_CREEPS);
       var spawnLoop = aSpawn =>
       {
           if (!aSpawn.spawning)
           {
               aSpawn.repairCreep(myCreeps);
           }
       };
       _.forEach(mySpawns,spawnLoop);
   }

   processCreeps()
   {
       var myCreeps = this.myRoom.getRoomObjects(ROOM_OBJECT_TYPE.creep);
       for (var aCreep of myCreeps)
       {
           var a = Game.cpu.getUsed();
           aCreep.processRole();
           var b = Game.cpu.getUsed();
           logWARN('PROFILE: creep - '+aCreep.myRole+' = '+(b-a));

       }
   }

   processTowers()
   {
       var myTowers = this.myRoom.getRoomObjects(ROOM_OBJECT_TYPE.tower);
       _.forEach(myTowers,(aTower) =>
       {

           if (aTower.myRepairStructures.length == 0 ) StructureTower.registerRepairStructures(this.myRoom);
           if (this.myRoom.hasInvaders)
           {
               aTower.attackInvader();
           }
           else
           {
               aTower.healWounded();
               aTower.repairStructure();
           }
       });
   }

   printRoomStats()
   {
       var aRoom  = this.myRoom
       logERROR('ROOM MANAGER STATS: room - '+aRoom.name+' ------------------------------------------------');
       _.forEach(_.keys(aRoom.myRoomObjects),(a) =>
       {
           logERROR('ROOM_MANAGER KEY: '+a+'\tCOUNT: '+aRoom.myRoomObjects[a].length);
       });
   }
};
module.exports = RoomManager;
