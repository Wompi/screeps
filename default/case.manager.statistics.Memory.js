class StatisticsManagerMemory
{
    constructor(pManager)
    {
        this.mManager = pManager;
        this.init();
    }

    processMemory()
    {
    }

    init()
    {
        if (_.isUndefined(Memory.statistics))
        {
            Memory.statistics = {};
        }

        if (_.isUndefined(Memory.statistics['sources']))
        {
            Memory.statistics['sources'] = {
                'lastUpdate': 0,
                'sourceStats': {},
            };
        }

        if (_.isUndefined(Memory.statistics['controller']))
        {
            Memory.statistics['controller'] = {
                'lastUpdate': 0,
                'stats': {},
            };
        }

        if (_.isUndefined(Memory.statistics['gcl']))
        {
            Memory.statistics['gcl'] = {
                'lastUpdate': 0,
                'lastProgess': 0,
            };
        }
    }

    saveGCL()
    {
        var aLastUpdate = Memory.statistics['gcl']['lastUpdate'];
        if (aLastUpdate == 0)
        {
            Memory.statistics['gcl']['lastUpdate'] = Game.time;
        }

        var lastProgress = Memory.statistics['gcl']['lastProgess'];

        Memory.statistics['gcl']['lastProgess'] = Game.gcl.progress;
        var delta = Game.gcl.progress - lastProgress;
        logDERP('GCL: '+Game.gcl.level+' delta: '+delta);
    }


    updateSourceTime()
    {
        Memory.statistics['sources']['lastUpdate'] = Game.time;
    }

    saveSource(pSource)
    {
        var aLastUpdate = Memory.statistics['sources']['lastUpdate'];
        if (aLastUpdate == 0)
        {
            Memory.statistics['sources']['lastUpdate'] = Game.time;
        }
        var value = Memory.statistics['sources']['sourceStats'][pSource.id];
        if (_.isUndefined(value))
        {
            Memory.statistics['sources']['sourceStats'][pSource.id] =
            {
                'lastEnergy': pSource.energy,
                'noHarvest': 0,
            };
        }

        var lastEnergy = Memory.statistics['sources']['sourceStats'][pSource.id]['lastEnergy']
        var missedHarvest = Memory.statistics['sources']['sourceStats'][pSource.id]['noHarvest'];
        var lastUpdate = Memory.statistics['sources']['lastUpdate'];
        var deltaTime = Game.time - lastUpdate;
        var deltaEnergy = lastEnergy - pSource.energy;
        //if (_.isUndefined(pSource.ticksToRegeneration))

        var aCondition = false;
        if (pSource.energy > 0 && deltaEnergy == 0)
        {
            aCondition = true;
            Memory.statistics['sources']['sourceStats'][pSource.id]['noHarvest'] += 1;
        }

        //Memory.statistics['sources']['sourceStats'][pSource.id]['']




        Memory.statistics['sources']['sourceStats'][pSource.id]['lastEnergy'] = pSource.energy


        var msg = 'ID: '+pSource.room.name
                +' value: '+value
                +' regeneration: '+pSource.ticksToRegeneration
                +'\tenergy: '+pSource.energy
                +'\tdE:'+deltaEnergy
                +'\tdT:'+deltaTime
                +'\tcondition: '+aCondition
                +'\t'+(aCondition ? '\t' : '')+'missed: '+missedHarvest

        if (aCondition)
        {
            logWARN(msg);
        }
        else
        {
            logDERP(msg);
        }
    }

    updateControllerTime()
    {
        Memory.statistics['controller']['lastUpdate'] = Game.time;
    }


    saveController(pObject)
    {
        var KEY_01 = 'controller';
        var KEY_02 = 'stats';

        var aLastUpdate = Memory.statistics[KEY_01]['lastUpdate'];
        if (aLastUpdate == 0)
        {
            Memory.statistics[KEY_01]['lastUpdate'] = Game.time;
        }
        var value = Memory.statistics[KEY_01][KEY_02][pObject.id];
        if (_.isUndefined(value))
        {
            Memory.statistics[KEY_01][KEY_02][pObject.id] =
            {
                'lastProgress': pObject.progress,
                'noAction': 0,
            };
        }

        var lastProgress = Memory.statistics[KEY_01][KEY_02][pObject.id]['lastProgress']
        var missedAction = Memory.statistics[KEY_01][KEY_02][pObject.id]['noAction'];
        var lastUpdate = Memory.statistics[KEY_01]['lastUpdate'];
        var deltaTime = Game.time - lastUpdate;
        var deltaProgress = pObject.progress - lastProgress;

        //logDERP('TICKS: '+CONTROLLER_DOWNGRADE[pObject.level]+' '+pObject.ticksToDowngrade )

        var aCondition = false;
        if (pObject.ticksToDowngrade != CONTROLLER_DOWNGRADE[pObject.level])
        {
            aCondition = true;
            Memory.statistics[KEY_01][KEY_02][pObject.id]['noAction'] += 1;
        }

        Memory.statistics[KEY_01][KEY_02][pObject.id]['lastProgress'] = pObject.progress

        var msg = 'ID: '+pObject.room.name
                +' value: '+value
                +'\tprogress: '+pObject.progress
                +'\t'+(pObject.progress < 10 ? '\t' : '')+'dE:'+deltaProgress
                +'\tdT:'+deltaTime
                +'\tcondition: '+aCondition
                +'\t'+(aCondition ? '\t' : '')+'missed: '+missedAction
                +'\tdown: '+pObject.ticksToDowngrade

        if (aCondition)
        {
            logWARN(msg);
        }
        else
        {
            logDERP(msg);
        }
    }
}
module.exports = StatisticsManagerMemory;
