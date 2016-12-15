
var GameManager = require('case.controller.GameManager');
var RoomManager = require('case.controller.RoomManager');
 
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

    logWARN('PROFILE SCRIPT INIT: '+(b0-a0).toFixed(2)+' '+(b01-a0).toFixed(2)+' '+(b0-a01).toFixed(2));
    logWARN('PROFILE GAME INIT: '+(b1-a1).toFixed(2));
    logWARN('PROFILE ROOM LOOP: '+(b2-a2).toFixed(2));


    // TEST Stuff
    var a = Game.cpu.getUsed();
    _.forEach(Game.rooms, (a) => { logDERP('['+a.name+'] Maintenance costs: '+a.myMaintenanceCost) });
    var b = Game.cpu.getUsed();
    logWARN('PROFILE MAINTENANCE: '+(b-a));




    var endCPU = Game.cpu.getUsed();
    console.log(
            'CPU START: '+startCPU.toFixed(2)
            +'\t\tDELTA: '+(endCPU-startCPU).toFixed(2)
            +'\tALL: '+endCPU.toFixed(2)
            +'\tBUCKET: '+Game.cpu.bucket
            +'\tTICK: '+Game.time
    );



    // Test Stuff
    //Test.checkRoadMap('E66N49');
    // var a = Game.cpu.getUsed();
    // Test.gravityTest('E65N49');
    // var b = Game.cpu.getUsed();
    // logWARN('PROFILE GRAVITY: '+(b-a));


};
