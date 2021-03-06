var OperationsFixer = require('case.operations.Fixer');
var CreepManager = require('case.manager.CreepManager');
var StatisticsManager = require('case.manager.statistics.Manager');

class GameManager
{
    constructor()
    {
        this.mFixerOperation = new OperationsFixer();
        this.mCreepManager = new CreepManager();
        this.mStatisticsManager = new StatisticsManager();
    }

    init()
    {
        for (var aID in Game.rooms)
        {
            var aRoom = Game.rooms[aID];
            aRoom.init();
            this.initRoomStructures(aRoom);
        }
        this.initConstructionSites();
        this.initCreeps();
        this.initFlags();
    }

    initConstructionSites()
    {
        for (var aID in Game.constructionSites)
        {
            var aSite = Game.constructionSites[aID];
            aSite.init();
            //logERROR('DERP: '+JSON.stringify(aSite));
            var aRoom = aSite.room;
            if (_.isUndefined(aRoom)) continue;
            aRoom.registerRoomObject(aSite,ROOM_OBJECT_TYPE.constructionSite);
        }
    }

    initFlags()
    {
        for (var aID in Game.flags)
        {
            var aFlag = Game.flags[aID];
            //logERROR('DERP: '+JSON.stringify(aFlag));
            var aName = aFlag.pos.roomName;
            var aRoom = Game.rooms[aName];
            if (!_.isUndefined(aRoom))
            {
                aRoom.registerRoomObject(aFlag,ROOM_OBJECT_TYPE.flag);
            }
        }
    }

    initCreeps()
    {
        for (var aID in Game.creeps)
        {
            var aCreep = Game.creeps[aID];
            aCreep.init();


            //if (aCreep.myRole == 'fixer')
            {
                this.mCreepManager.registerCreep(aCreep);
            }

            //logERROR('DERP: '+JSON.stringify(aSite));
            var aName = aCreep.room.name;
            var aRoleType = aCreep.memory.role;
            if (_.isUndefined(CREEP_ROLE[aRoleType]))
            {
                logERROR('GAME MANGER CREEP ROLE: '+aRoleType+' is undefined');
                continue;
            }
            else
            {
                //logERROR('CREEP ROLE: '+aRoleType+' NEW');
                var aRole = new CREEP_ROLE[aRoleType].role(aRoleType);
                //aRole.print();
                aCreep.registerRole(aRole);
            }


            if (
                        aCreep.myRole == 'remote builder'
                    ||  aCreep.myRole == 'remote claimer'
                    ||  aCreep.myRole == 'room trader'
                    ||  aCreep.myRole == 'dismantle'
                    ||  aCreep.myRole == 'remote miner hauler'
                    ||  aCreep.myRole == 'remote miner'
                    ||  aCreep.myRole == 'remote reserve'
                )
            {
                continue;
            }



            //else
            {
                Game.rooms[aName].registerRoomObject(aCreep,ROOM_OBJECT_TYPE.creep);
            }
        }
    }

    initRoomStructures(pRoom)
    {
        pRoom.find(FIND_STRUCTURES,
        {
            filter: (a) =>
            {
                //a.init();
                if (a.structureType == STRUCTURE_CONTAINER)
                {
                    a.init();
                    pRoom.registerRoomObject(a,ROOM_OBJECT_TYPE.container);
                    this.mFixerOperation.registerEntity(a,ROOM_OBJECT_TYPE.container);
                }
                else if (a.structureType == STRUCTURE_PORTAL)
                {
                    pRoom.registerRoomObject(a,ROOM_OBJECT_TYPE.portal);
                }
                else if (a.structureType == STRUCTURE_ROAD)
                {
                    a.init();
                    pRoom.registerRoomObject(a,ROOM_OBJECT_TYPE.road);
                    this.mFixerOperation.registerEntity(a,ROOM_OBJECT_TYPE.road);
                }
                else if (a.structureType == STRUCTURE_WALL)
                {
                    pRoom.registerRoomObject(a,ROOM_OBJECT_TYPE.wall);
                }
                else if (a.structureType == STRUCTURE_CONTROLLER)
                {
                    a.init();
                    if (pRoom.my)
                    {
                        this.mStatisticsManager.registerStatisticsObject(a,ROOM_OBJECT_TYPE.controller);
                    }
                    pRoom.registerRoomObject(a,a.structureType);
                }
                else
                {
                    a.init();
                    pRoom.registerRoomObject(a,a.structureType);
                }
            }
        });

        if (pRoom.my)
        {
            pRoom.find(FIND_SOURCES,
            {
                filter: (a) =>
                {
                    this.mStatisticsManager.registerStatisticsObject(a,ROOM_OBJECT_TYPE.source);
                    pRoom.registerRoomObject(a,ROOM_OBJECT_TYPE.source);
                }
            });
        }
        pRoom.find(FIND_DROPPED_RESOURCES,
        {
            filter: (a) =>
            {
                //a.init();
                pRoom.registerRoomObject(a,ROOM_OBJECT_TYPE.resource);
            }
        });
        pRoom.find(FIND_MINERALS,
        {
            filter: (a) =>
            {
                //a.init();
                pRoom.registerRoomObject(a,ROOM_OBJECT_TYPE.mineral);
            }
        });
        pRoom.find(FIND_NUKES,
        {
            filter: (a) =>
            {
                //a.init();
                pRoom.registerRoomObject(a,ROOM_OBJECT_TYPE.nuke);
            }
        });
    }



    printStats(pRoomName)
    {
        var aRoom  = Game.rooms[pRoomName];
        logERROR('GAME: room - '+aRoom.name+' ------------------------------------------------');
        _.forEach(_.keys(aRoom.myRoomObjects),(a) =>
        {
            logERROR('GAME KEY: '+a+' COUNT: '+aRoom.myRoomObjects[a].length);
        });
    }
};
module.exports = GameManager;
