
var RemoteMiningClaimer = require('case.operations.remote.mining.Claimer');
var RemoteMiningFixer = require('case.operations.remote.mining.Fixer');
var RemoteMiningHauler_ONE = require('case.operations.remote.mining.Hauler_ONE');
var RemoteMiningHauler_TWO = require('case.operations.remote.mining.Hauler_TWO');
var RemoteMiningMiner_ONE = require('case.operations.remote.mining.Miner_ONE');
var RemoteMiningMiner_TWO = require('case.operations.remote.mining.Miner_TWO');
var RemoteMiningDefender = require('case.operations.remote.mining.Defender');

class RemoteMiningOperation
{
    constructor()
    {
        this.mRoomName = 'E65N48'

        this.processStatistics(this.mRoomName);

        var aControllerStats = Memory.operations.remote.mining[this.mRoomName].controller;
        this.mControllerPos = new RoomPosition(aControllerStats.x,aControllerStats.y,this.mRoomName);
        this.mControllerReserveTime = aControllerStats.reservationTime-Game.time;

        logDERP(this.mRoomName+' reservation: '+(this.mControllerReserveTime));

        this.aClaimer = new RemoteMiningClaimer(this);
        this.aFixer = new RemoteMiningFixer(this);
        this.aHauler_ONE = new RemoteMiningHauler_ONE(this);
        this.aHauler_TWO = new RemoteMiningHauler_TWO(this);
        this.aMiner_ONE = new RemoteMiningMiner_ONE(this);
        this.aMiner_TWO = new RemoteMiningMiner_TWO(this);
        this.aDefender = new RemoteMiningDefender(this);

        this.isSecure = Memory.operations.remote.mining[this.mRoomName].isSecure;
    }

    processOperation()
    {
        this.aClaimer.process(this.mRoomName);
        this.aFixer.process(this.mRoomName);
        this.aMiner_ONE.process(this.mRoomName);
        this.aMiner_TWO.process(this.mRoomName);
        this.aHauler_ONE.process(this.mRoomName);
        this.aHauler_TWO.process(this.mRoomName);
        this.aDefender.process(this.mRoomName);
    }

    processStatistics(pRoomName)
    {
        if (_.isUndefined(Memory.operations.remote))
        {
            Memory.operations.remote = {};
        }
        if (_.isUndefined(Memory.operations.remote.mining))
        {
            Memory.operations.remote.mining = {};
        }

        var myStats = Memory.operations.remote.mining[pRoomName];
        if (_.isUndefined(myStats))
        {
            var aStats =
            {
                controller:
                {
                    id: undefined,
                    x: 0,
                    y: 0,
                    reservationTime: 0,
                    travelDistance: 0,
                },
                invaders:
                {
                    lastInvaders: [],
                    lastInvaderTimeout: 0,
                    invaderHistory: {},
                },
                source:
                {
                    amountSinceInvader: 0,
                },
                isSecure: false,
                lastVisit: 0,
            }
            Memory.operations.remote.mining[pRoomName] = aStats;
        }

        var aRoom = Game.rooms[pRoomName];
        if (_.isUndefined(aRoom))
        {
            // not visible
            logDERP('DERP not exists: '+JSON.stringify(pRoomName));
            logDERP('REMOTE: '+this.isSecure);
        }
        else
        {
            var aController = aRoom.controller;

            var aLen = Memory.operations.remote.mining[pRoomName].controller.travelDistance;
            if ( aLen == 0)
            {
                var aStartPos = Game.spawns['Nexuspool'].getSpawnPos();
                var aEndPos = aController.pos;
                var aPath = Util.getPath(aStartPos,aEndPos);
                aLen = aPath.path.length;

                // debug
                // logDERP('path[0] = '+JSON.stringify(aPath.path[0]))
                // var aStartRoom = Game.rooms[aPath.path[0].roomName];
                // var aLook = aStartRoom.lookForAt(LOOK_FLAGS,aPath.path[0].x,aPath.path[0].y);
                // if (aLook.length == 0)
                // {
                //     //logDERP('aLook = '+JSON.stringify(aLook));
                //     aStartRoom.createFlag(aPath.path[0].x,aPath.path[0].y,undefined,COLOR_YELLOW,COLOR_YELLOW);
                // }
                // var aLook = aRoom.lookForAt(LOOK_FLAGS,aPath.path[aLen-1].x,aPath.path[aLen-1].y);
                // if (aLook.length == 0)
                // {
                //     //logDERP('aLook = '+JSON.stringify(aLook));
                //     aRoom.createFlag(aPath.path[aLen-1].x,aPath.path[aLen-1].y,undefined,COLOR_YELLOW,COLOR_YELLOW);
                // }
                // aPath.path = [];
                // logDERP('PATH('+aLen+'): '+JSON.stringify(aPath));
            }

            var aTicks = _.isUndefined(aController.reservation) ? 0 : aController.reservation.ticksToEnd;

            // controller memory
            Memory.operations.remote.mining[pRoomName].controller =
            {
                id: aController.id,
                x: aController.pos.x,
                y: aController.pos.y,
                reservationTime: Game.time + aTicks,
                travelDistance: aLen,
            }

            // invader memory
            var myInvaders = aRoom.find(FIND_HOSTILE_CREEPS);

            var aInvaderHistory = Memory.operations.remote.mining[pRoomName].invaders.invaderHistory;
            if (!_.isEmpty(myInvaders))
            {
                _.forEach(myInvaders, (aCreep) =>
                {
                    var aInvader = aInvaderHistory[aCreep.id];
                    if (_.isUndefined(aInvader))
                    {
                        aInvaderHistory[aCreep.id] = aCreep;
                    }
                });
            };

            Memory.operations.remote.mining[pRoomName].invaders =
            {
                lastInvaders: (_.isEmpty(myInvaders) ? [] : myInvaders),
                lastInvaderTimeout: (_.isEmpty(myInvaders) ? 0 :  _.max(myInvaders, (aCreep) => { return (aCreep.ticksToLive + Game.time);})),
                invaderHistory: aInvaderHistory,
            };

            if (!_.isEmpty(myInvaders))
            {
                Memory.operations.remote.mining[pRoomName].source.amountSinceInvader = 0;
            }
            else
            {
                logDERP('REMOTE: '+pRoomName+' miningAmount = '+Memory.operations.remote.mining[pRoomName].source.amountSinceInvader);
            }

            Memory.operations.remote.mining[pRoomName].lastVisit = Game.time;
            Memory.operations.remote.mining[pRoomName].isSecure =  _.isEmpty(myInvaders);
        }
    }
}
module.exports = RemoteMiningOperation;
