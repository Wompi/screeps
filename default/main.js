
var GameManager = require('case.controller.GameManager');
var RoomManager = require('case.controller.RoomManager');
var RoomTraderManager = require('case.controller.RoomTraderManager');
var RemoteManager = require('case.controller.RemoteManager');

var TimeLine = require('case.main.TimeLine');


module.exports.loop = function ()
{
    var startCPU = Game.cpu.getUsed();
    var a0 = Game.cpu.getUsed();
    require('case.globals').init(require('case.parameters'));
    require('case.extensions').extend();
    var b01 = Game.cpu.getUsed();

    // clean memory
    var a01 = Game.cpu.getUsed();
    for(var name in Memory.creeps)
    {
        if (Game.creeps[name] == undefined)
        {
            delete Memory.creeps[name];
        }
    }
    var b0 = Game.cpu.getUsed();

    var a1 = Game.cpu.getUsed();
    var aGameManager = new GameManager();
    aGameManager.init();
    var b1 = Game.cpu.getUsed();

    var a2 = Game.cpu.getUsed();
    var aLoop = (aRoom) =>
    {
        console.log('------------------------ ROOM - '+aRoom.name+' ----------------------------------------------');
        //aGameManager.printStats(aRoom.name);
        var aRoomManager = new RoomManager(aRoom);
        //aRoomManager.printRoomStats();
        aRoomManager.process();
    };
    _.forEach(Game.rooms,aLoop);
    var b2 = Game.cpu.getUsed();


    console.log('------------------------ ROOM TRADER ----------------------------------------------');
    var aRoomTraderManager = new RoomTraderManager();
    aRoomTraderManager.process();

    console.log('------------------------ REMOTE MANAGER ----------------------------------------------');
    var aRemoteManagerManager = new RemoteManager();
    aRemoteManagerManager.process();



    logWARN('PROFILE SCRIPT INIT: '+(b0-a0).toFixed(2)+' '+(b01-a0).toFixed(2)+' '+(b0-a01).toFixed(2));
    logWARN('PROFILE GAME INIT: '+(b1-a1).toFixed(2));
    logWARN('PROFILE ROOM LOOP: '+(b2-a2).toFixed(2));


    // TEST Stuff
    var a = Game.cpu.getUsed();
    _.forEach(Game.rooms, (a) => { logDERP('['+a.name+'] Maintenance costs: '+a.myMaintenanceCost) });
    var b = Game.cpu.getUsed();
    logWARN('PROFILE MAINTENANCE: '+(b-a));


    //logDERP(`<progress style='width: 1000px;' value='75' max='100'/>`);

    var endCPU = Game.cpu.getUsed();
    console.log(
            'CPU START: '+startCPU.toFixed(2)
            +'\t\tDELTA: '+(endCPU-startCPU).toFixed(2)
            +'\tALL: '+endCPU.toFixed(2)
            +'\tBUCKET: '+Game.cpu.bucket
            +'\tTICK: '+Game.time
    );

    // Test Stuff
    // var a = Game.cpu.getUsed();
    // var oFixer = aGameManager.mFixerOperation;
    // _.forEach(aGameManager.mCreepManager.getCreepsForRole('fixer'), (aFixer) =>
    // {
    //     oFixer.registerEntity(aFixer,ROOM_OBJECT_TYPE.creep);
    // })
    // oFixer.processOperation();
    // var b = Game.cpu.getUsed();
    // logWARN('PROFILE: operations fixer - '+(b-a));


    Util.getMineralStorage();



    // var a = Game.cpu.getUsed();
    // var aTimeLine = new TimeLine();
    // aTimeLine.populateCreeps();
    // var b = Game.cpu.getUsed();
    // logWARN('PROFILE: timeline processing - '+(b-a));


    var aRoom = Game.rooms['E64N49'];
    var aBody = Formula.calcUpgrader(aRoom);
    logDERP('U: '+JSON.stringify(aBody));


    //runBrawler();
    //runScout();
};

runScout = function()
{
    var myScout = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == 'scout'})
    if (_.isUndefined(myScout)) return;

    myScout.moveTo(new RoomPosition(25,25,'E64N49'));
}

runBrawler = function()
{
    var myCreeps = _.filter(Game.creeps, (a) => {return (a.memory.role == 'derp' && !a.spawning);});
    if (myCreeps.length == 0) return;
    // for starters we only handle one fixer
    var aCreep = myCreeps[0];

    logDERP('BLARK')

    var aRoom = aCreep.room;

    if (aRoom.name != 'E66N48')
    {
        var resultA = aCreep.moveTo(new RoomPosition(25,25,'E64N49'));
        return;
    }

    // if (aRoom.name != 'E65N48')
    // {
    //     var result = aCreep.moveTo(new RoomPosition(25,25,'E65N48'));
    //     logDERP(' BRAWLER moves to ... room .. '+ErrorSting(result));
    //     return;
    // }
    logDERP('DERP')
    var invaders = aRoom.find(FIND_HOSTILE_CREEPS);

    // var mySpawns = aRoom.find(FIND_STRUCTURES,
    // {
    //     filter: (a) =>
    //     {
    //         return a.structureType == STRUCTURE_SPAWN;
    //     }
    // });
    // var aSpawn = mySpawns[0]
    // if (_.isUndefined(aSpawn))
    // {
    //     if (invaders.length == 0)
    //     {
    //         var myExtensions = aRoom.find(FIND_STRUCTURES,
    //         {
    //             filter: (a) =>
    //             {
    //                 return a.structureType == STRUCTURE_EXTENSION;
    //             }
    //         });
    //         if (myExtensions.length == 0) return;
    //
    //         var aExtension = _.min(myExtensions, (a) => { return aCreep.pos.getRangeTo(a);});
    //         var resultA = aCreep.moveTo(aExtension);
    //         var resultB = aCreep.attack(aExtension);
    //
    //         logDERP(' BRAWLER =  '+ErrorSting(resultA)+' '+ErrorSting(resultB));
    //         return;
    //     }
    //     var aInvader = _.min(invaders, (a) => { return aCreep.pos.getRangeTo(a)});
    //
    //     if (!aCreep.pos.isNearTo(aInvader))
    //     {
    //         var result = aCreep.moveTo(aInvader)
    //         logDEBUG('Brawler engages .....'+ErrorSting(result));
    //     }
    //     var result = aCreep.attack(aInvader);
    //     logWARN('ATTACK: '+ErrorSting(result));
    //     return;
    // }

    var resultA = aCreep.moveTo(invaders[0]);
    var resultB = aCreep.attack(invaders[0]);

    logDERP(' BRAWLER =  '+ErrorSting(resultA)+' '+ErrorSting(resultB));
}
