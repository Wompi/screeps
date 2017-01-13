
var RemoteMiningClaimer = require('case.operations.remote.mining.Claimer');
var RemoteMiningFixer = require('case.operations.remote.mining.Fixer');

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
    }

    processOperation()
    {
        this.aClaimer.process(this.mRoomName);
        this.aFixer.process(this.mRoomName);
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
                    lastInvaders: undefined,
                    lastInvaderTimeout: 0,
                    invaderHistory: [],
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
            logDERP('DERP not exists: '+JSON.stringify(aRoom));
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



            // controller memory
            Memory.operations.remote.mining[pRoomName].controller =
            {
                id: aController.id,
                x: aController.pos.x,
                y: aController.pos.y,
                reservationTime: Game.time + aController.reservation.ticksToEnd,
                travelDistance: aLen,
            }


            // invader memory

            var aInvaderHistory = Memory.operations.remote.mining[pRoomName].invaders.invaderHistory;
            if (!_.isEmpty(myInvaders))
            {
                _.forEach(myInvaders, (aCreep) =>
                {
                    var lastCreep = aInvaderHistory[aCreep.id];
                    if (_.isUndefined(lastCreep))
                    {
                        aInvaderHistory[aCreep.id] = aCreep;
                    }
                });
            }

            Memory.operations.remote.mining[pRoomName].invaders =
            {
                lastInvaders: (_.isEmpty(myInvaders) ? undefined : myInvaders),
                lastInvaderTimeout: _.isEmpty(myInvaders) ? 0 :  _.max(myInvaders, (aCreep) => { return (aCreep.ticksToLive + Game.time0;});,
                invaderHistory: aInvaderHistory,
            }

            // general memory
            Memory.operations.remote.mining[pRoomName].lastVisit = Game.time;
            Memory.operations.remote.mining[pRoomName.isSecure =  _.isEmpty(myInvaders);
        }
    }


    // if hostiles spotted retreat to the save room until the thread is finished
    processRetreat()
    {

    }

    // splitted in sources to see what we need - this is for source 1
    processMiner_1()
    {

    }

    // splitted in sources to see what we need - this is for source 2
    processMiner_2()
    {

    }

    // splitted in sources to see what we need - this is for miner 1
    processHauler_1()
    {

    }

    // splitted in sources to see what we need - this is for miner 2
    processHauler_2()
    {

    }

    // if the room has invaders spawn a defender and send him to kill the thread
    // should have some hauling cappability to collect the remainings
    processDefender()
    {

    }
}
module.exports = RemoteMiningOperation;
