class StatisticsManager
{
    constructor()
    {
    }
    repairReport(rooms)
    {
        if (_.isUndefined(rooms)) return;

        for (var aID in rooms)
        {
            var room = rooms[aID];
            if (_.isUndefined(room.memory.myRepairStats)) return;

            var len = room.memory.myRepairStats.length;
            var myStats = room.memory.myRepairStats;
            // time: Game.time,
            // tower: this.id,
            // x: maxRepairObject.pos.x,
            // y: maxRepairObject.pos.y,
            // sturctureType: maxRepairObject.structureType,
            // repair: amount,

            //var derp = _.map(room.memory.myRepairStats,);
            var aSum = _.sum(myStats,'repair');

            var aTime = _.map(myStats,'time');
            var aTimeDiff = myStats[len-1].time-myStats[0].time;
            var aEnergySpend = len * 2;
            var aTower = _.countBy(myStats, 'tower');
            var aType = _.countBy(myStats, 'sturctureType');

            var derp =
            {
                deltaTime: aTimeDiff,
                allAmount:
                {
                    byTower: aSum,
                    byBot: (aEnergySpend * 100),
                    delta: ((aEnergySpend * 100) - aSum)
                },
                energySpend: aEnergySpend,
                towers: aTower,
                type: aType
            }

            logWARN('REPORT: ['+(aEnergySpend/aTimeDiff)+']'+JSON.stringify(derp,undefined,' '));
        }
    }


    registerControllerUpgradeStats(room)
    {
        if (_.isUndefined(room)) return;

        var myController = room.controller;
        var myMiningSources = room.myMiningSources;
        var myLevel = myController.level;

        if (_.isUndefined(Memory.statistics))
        {
            Memory.statistics = {};
        }

        var myTime = Game.time;

        if (_.isUndefined(Memory.statistics[room.name]))
        {
            var maxLevels = _.keys(CONTROLLER_LEVELS).length + 1;
            Memory.statistics[room.name] = {};

            Memory.statistics[room.name].controller = [];
            for (var i=0; i<maxLevels; i++)
            {
                Memory.statistics[room.name].controller.push(
                {
                    lastProgress: 0,
                    lastTick: 0,
                    sumTicks: 0,
                    sumProgress: 0,
                });
            }
            Memory.statistics[room.name].controller[myLevel] =
            {
                lastProgress: myController.progress,
                lastTick: myTime,
                sumTicks: 1,
                sumProgress: 0,
            };

            Memory.statistics[room.name].miningSource = {};
            var sourceLoop = (a) =>
            {
                Memory.statistics[room.name].miningSource[a.id] =
                {
                    lastEnergy: a.energy,
                    lastTick: myTime,
                    sumTicks: 1,
                    sumEnergy: 0,
                };
            };
            _.forEach(myMiningSources,sourceLoop);

        }
        var myRecord = Memory.statistics[room.name].controller[myLevel];

        var deltaProgress = myController.progress - myRecord.lastProgress;
        var deltaTime = myTime - myRecord.lastTick;
        myRecord.lastProgress = myController.progress;
        myRecord.lastTick = myTime;
        myRecord.sumTicks = myRecord.sumTicks + deltaTime;
        myRecord.sumProgress = myRecord.sumProgress + deltaProgress;

        var roomEnergyProgress = 0;
        var sourceLoop = (a) =>
        {
            var mySourceRecord = Memory.statistics[room.name].miningSource[a.id];
            // there is a slight issue with the energy when the source respawns - we loose one full mining haul for
            // this tick - not sure waht the best approach would be here
            var myEnergy = a.energy;
            var deltaEnergy = _.max([0,mySourceRecord.lastEnergy - myEnergy]);
            var deltaTime = myTime - mySourceRecord.lastTick;

            // adjustment for when the resource is empty but the respawn timer is not 0 otherwise it
            // calculates the energy ratio for time where I could not mine anything
            //if (deltaEnergy == 0) deltaTime = 0;

            mySourceRecord.lastEnergy = myEnergy;
            mySourceRecord.lastTick = myTime;
            mySourceRecord.sumTicks =  mySourceRecord.sumTicks + deltaTime;
            mySourceRecord.sumEnergy = mySourceRecord.sumEnergy + deltaEnergy;
            var sourceEnergyProgress = mySourceRecord.sumEnergy / mySourceRecord.sumTicks;
            //logERROR('SOURCE ['+a.pos.x+' '+a.pos.y+'] '+sourceEnergyProgress+' TIME: '+a.ticksToRegeneration+' ENERGY: '+a.energy);
            roomEnergyProgress += sourceEnergyProgress;
        };
        _.forEach(myMiningSources,sourceLoop);

        var roomControllerProgress = myRecord.sumProgress / myRecord.sumTicks;
        var myRatio = roomControllerProgress * 100 / roomEnergyProgress;
        logERROR('ROOM '+room.name+' PROGRESS:  C/T: '+roomControllerProgress+' C/E: '+roomEnergyProgress+' RATIO: '+myRatio);
    }

    tickReport()
    {
        // var a = Game.cpu.getUsed();
        //
        // if (_.isUndefined(Memory.game))
        // {
        //     Memory.game = {};
        // }
        //
        // if (_.isUndefined(Memory.game.ticks))
        // {
        //     Memory.game.ticks =
        //     {
        //         lastTime: (new Date().getTime()),
        //         deltaTime: [],
        //     }
        // }
        // else
        // {
        //     if (Memory.game.ticks.deltaTime.length > 1500)
        //     {
        //         console.log('DROP frist time element .. ');
        //         Memory.game.ticks.deltaTime = _.drop(Memory.game.ticks.deltaTime);
        //     }
        //
        //     var newTime = new Date().getTime();
        //     Memory.game.ticks.deltaTime.push(newTime-Memory.game.ticks.lastTime);
        //     Memory.game.ticks.lastTime = newTime;
        //     console.log(JSON.stringify(Memory.game.ticks));
        //     var aSum = _.sum(Memory.game.ticks.deltaTime);
        //     var aAvg = (aSum/Memory.game.ticks.deltaTime.length);
        //     var aMin = _.min(Memory.game.ticks.deltaTime);
        //     var aMax = _.max(Memory.game.ticks.deltaTime);
        //     var avgToSec = aAvg / 1000;
        //     var minToSec = aMin / 1000;
        //     var maxToSec = aMax / 1000;
        //
        //     var msec = aSum;
        //     var hh = Math.floor(msec / 1000 / 60 / 60);
        //     msec -= hh * 1000 * 60 * 60;
        //     var mm = Math.floor(msec / 1000 / 60);
        //     msec -= mm * 1000 * 60;
        //     var ss = Math.floor(msec / 1000);
        //     msec -= ss * 1000;
        //     console.log('TICKS SUM: '+hh+':'+mm+':'+ss+' TICKS: '+Memory.game.ticks.deltaTime.length+' MIN: '+minToSec+' sec AVERAGE: '+avgToSec+' sec MAX: '+maxToSec);
        //
        // }
    }

    gclReport()
    {
        // if (_.isUndefined(Memory.game.gcl))
        // {
        //     Memory.game = { gcl: Game.gcl};
        //     Memory.game.gcl['deltaProgress'] = [];
        // }
        // else
        // {
        //     if (Memory.game.gcl.deltaProgress.length > 1500)
        //     {
        //         //logERROR('DROP frist element .. ');
        //         Memory.game.gcl.deltaProgress = _.drop(Memory.game.gcl.deltaProgress);
        //     }
        //     Memory.game.gcl.deltaProgress.push(Game.gcl.progress-Memory.game.gcl.progress);
        //     Memory.game.gcl.progress = Game.gcl.progress;
        //     Memory.game.gcl.progressTotal = Game.gcl.progressTotal;
        //     Memory.game.gcl.level = Game.gcl.level;
        //     // logERROR(JSON.stringify(Memory.game.gcl));
        //     var aSum = _.sum(Memory.game.gcl.deltaProgress);
        //     var aAvg =  aSum / Memory.game.gcl.deltaProgress.length;
        //     logDEBUG('GCL SUM: '+aSum+' TICKS: '+Memory.game.gcl.deltaProgress.length+' AVG: '+aAvg);
        //     // Memory.game.gcl = gcl;
        //     //Memory.game.gcl.deltaProgress = oldGcl.deltaProgress.push(gcl.progress-oldGcl.progress);
        // }
        // var b = Game.cpu.getUsed();
        // console.log(
        //         'PROFILE PROGRESS START: '+a
        //         +' DELTA: '+(b-a)
        // );
    }
};
module.exports = StatisticsManager;
