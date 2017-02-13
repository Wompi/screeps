
var myCPU = {};

var a = Game.cpu.getUsed();
var ServerNode = require('case.admin.ServerNode');

var Visualization = require('case.debug.Visualization');
var Constants = require('case.admin.Constants');
var Functions = require('case.admin.Functions');
var RoomPosition = require('prototype.RoomPosition');
var StructureController = require('prototype.StructureController');
var Source = require('prototype.Source');
var Mineral = require('prototype.Mineral');
var ProtoRoomVisual = require('prototype.RoomVisual');
var ClassExtensions = require('case.admin.ClassExtensions');
var RoomExtension = require('prototype.Room');
var Test = require('case.debug.Test');
var RespawnOperation = require('case.operations.respawn.Operation');
myCPU['require'] = Game.cpu.getUsed() - a;



var a = Game.cpu.getUsed();
_.assign(global,Constants);
_.assign(global,Functions);
_.assign(global,{ Visualizer: new Visualization()});
myCPU['assignConstants'] = Game.cpu.getUsed() - a;

// global operation stuff
var aRespawn = new RespawnOperation()
aRespawn.processOperation();

// var a = Game.cpu.getUsed();
// var aServerNode = new ServerNode(module);
// myCPU['globalServerNode'] = Game.cpu.getUsed() - a;






module.exports.loop = function ()
{
    var a = Game.cpu.getUsed();
    global.memorySize = RawMemory.get().length;
	global.Memory = JSON.parse(RawMemory.get());
	console.log("overhead: "+(Game.cpu.getUsed()-a)+" for "+global.memorySize+" bytes");


    var a = Game.cpu.getUsed();
    //aServerNode.updateTick(true);
    myCPU['tickServerNode'] = Game.cpu.getUsed() - a;

    return;
    console.log('CPU: '+JS(myCPU,true));


    var aSpawn = _.find(Game.spawns, (a) => a);
    var ROOM_NAME = aSpawn.pos.roomName;
    var aRoom = Game.rooms[ROOM_NAME];

    var c1 = aRoom.controller;
    var mySources = aRoom.find(FIND_SOURCES);


    var s1 = mySources[0];

    var path = aRoom.findPath(aSpawn.pos, s1.pos,{range: 1});
    var cs1_path = aRoom.findPath(s1.pos, c1.pos,{range: 1});


    new RoomVisual(ROOM_NAME).poly(path, {stroke: '#fff', strokeWidth: .15, opacity: .2, lineStyle: 'dashed'});
    new RoomVisual(ROOM_NAME).poly(cs1_path, {stroke: COLOR.yellow, strokeWidth: .15, opacity: .2, lineStyle: 'dashed'});

    var a = Game.cpu.getUsed();
    var aResult = aRoom.controller.upgradePositions(true);
    Visualizer.visualizePoints(ROOM_NAME,aResult,{ fill: COLOR.green});
    var b = Game.cpu.getUsed();
    console.log('PROFILE controller: '+(b-a).toFixed(2));


    var a = Game.cpu.getUsed();
    _.forEach(mySources, (aSource) =>
    {
        var aResult = aSource.possibleMiningPositions(true);
    });
    var b = Game.cpu.getUsed();
    console.log('PROFILE mining positions: '+(b-a).toFixed(2));

    /// mineral handling
    var a = Game.cpu.getUsed();
    var aMineral = aRoom.mineral;
    console.log('MINERAL: '+JSON.stringify(aMineral));

    var aMineral = aRoom.mineral;
    console.log('MINERAL: '+JSON.stringify(_.keys(aMineral)));
    var b = Game.cpu.getUsed();
    console.log('PROFILE mineral positions: '+(b-a).toFixed(2));


    console.log('SIZE: '+aRoom.visual.getSize());

};

main()
{

}
