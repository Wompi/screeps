var mySpawnCenter = require('case.SpawnCenter');

class FixerSpawn extends require('spawn.creep.AbstractSpawn')
{
    constructor(roleName)
    {
        super(roleName)
    }

    isSpawnActive()
    {
        return true;
    }

    processSpawn(pSpawn)
    {

        logDEBUG('MINER SPAWN PROCESSED.....');
        if (!this.isSpawnValid(pSpawn)) return;
        var aRoom = pSpawn.room;

        var myRoomSources = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.source);
        var myRoomCreeps = aRoom.getRoomObjects(ROOM_OBJECT_TYPE.creep);

        var myRole = new CREEP_ROLE[this.myName].role(this.myName);
        var myCreeps = _.filter(myRoomCreeps,(a) => { return a.myRole.myName == myRole.myName});

        if (myCreeps.length >= myRoomSources.length)
        {
            //logDERP('creeps = '+myCreeps.length+' sources = '+myRoomSources.length);
            return;
        }
        var hasEmergency = aRoom.hasEmergencyState();

        this.evaluateMiningSources(myRoomSources,pSpawn);

        logDEBUG('SPAWN MINER: sources:\t'+myRoomSources.length);
        logDEBUG('SPAWN MINER: energyAvailable:\t'+aRoom.energyAvailable);
        logDEBUG('SPAWN MINER: energyCapacity:\t'+aRoom.energyCapacityAvailable);
        logDEBUG('SPAWN MINER: creeps:\t'+myCreeps.length);
        logDEBUG('SPAWN MINER: hasEmergency:\t'+hasEmergency);

        if (hasEmergency)
        {
            this.spawnEmergencyCreep(pSpawn);
            return;
        }

        if (aRoom.controller.level < 5)
        {
            this.spawnCalculatedCreep(pSpawn,aRoom);
        }
        else
        {
            // TODO: implement a real miner spawn here
            this.spawnNormalCreep(pSpawn);
        }
    }

    spawnCalculatedCreep(pSpawn,pRoom)
    {
        var aBody = undefined;
        if (pSpawn.room.energyAvailable >= 700)
        {
            aBody = [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE];
        }

        if (!_.isUndefined(aBody))
        {
            var result = pSpawn.createCreep(aBody,undefined,{ role: 'miner'});
            if (typeof result === 'string')
            {
                logWARN('MINER '+result+' is spawning .. '+ErrorSting(result));
                Game.creeps[result].init();
            }
            else
            {
                logERROR('MINER something fishy with creep creation .. '+ErrorSting(result));
            }
        }
    }

    spawnNormalCreep(pSpawn)
    {
        var aBody = undefined;
        if (pSpawn.room.energyAvailable >= 800)
        {
            if (pSpawn.name == 'Casepool')
            {
                aBody = [WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE];
            }
            else
            {
                aBody = [WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE];
            }
        }

        if (!_.isUndefined(aBody))
        {
            var result = pSpawn.createCreep(aBody,undefined,{ role: 'miner'});
            if (typeof result === 'string')
            {
                logWARN('MINER '+result+' is spawning .. '+ErrorSting(result));
                Game.creeps[result].init();
            }
            else
            {
                logERROR('MINER something fishy with creep creation .. ');
            }
        }
    }

    spawnEmergencyCreep(pSpawn)
    {
        var aBody = undefined;
        if (pSpawn.room.energyAvailable >= 300)
        {
            aBody = [WORK,WORK,CARRY,MOVE];
        }

        if (!_.isUndefined(aBody))
        {
            var result = pSpawn.createCreep(aBody,undefined,{ role: 'miner'});
            if (typeof result === 'string')
            {
                logWARN('MINER '+result+' is spawning .. '+ErrorSting(result));
                Game.creeps[result].init();
            }
            else
            {
                logERROR('MINER something fishy with creep creation .. '+ErrorSting(result));
            }
        }
    }

    getBody(pEnergyAvailable,pEnergyCapacity,needsCarry,needsMove)
    {

    }

    evaluateMiningSources(pSources,pSpawn)
    {
        _.forEach(pSources, (a) =>
        {
            a.printStatus();
            var aDist = pSpawn.pos.findPathTo(a,{ignoreCreeps: true,range:1});
            logDEBUG('\tDIST SPAWN: '+aDist.length);
        });

        if (pSources.length > 0)
        {
            _.forEach(pSources, (a) =>
            {
                _.forEach(pSources, (b) =>
                {
                    if (!a.pos.isEqualTo(b.pos))
                    {
                        var aDist = a.pos.findPathTo(b,{ignoreCreeps: true,range:1});
                        logDEBUG('\t DIST ['+a.pos.x+' '+a.pos.y+'] -> ['+b.pos.x+' '+b.pos.y+'] = '+aDist.length);
                    }
                });
            });
        }
    }

}
module.exports = FixerSpawn;
