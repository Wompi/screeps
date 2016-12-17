var mod =
{
    init: function(params)
    {
        // TODO: GCL Formula - GCL n-1 to GCL n, you need (n2.4 - (n-1)2.4) * 1


        var TestCenter = require('case.TestCenter');
        var StatisticsManager = require('case.StatisticsManager');
        var CaseConsole = require('case.CaseConsole');
        var Utillities = require('case.Utillities');
        var Formulas = require('case.Formulas');
        var Market = require('case.Market');
        _.assign(global,params);
        _.assign(global,
        {
            Test: new TestCenter(),
            Stats: new StatisticsManager(),
            Console: new CaseConsole(),
            Util: new Utillities(),
            Market: new Market(),
            Formula: new Formulas(),
            ErrorSting: function(code)
            {
                var codes =
                {
                     0: 'OK',
                     1: 'ERR_NOT_OWNER',
                     2: 'ERR_NO_PATH',
                     3: 'ERR_NAME_EXISTS',
                     4: 'ERR_BUSY',
                     5: 'ERR_NOT_FOUND',
                     6: 'ERR_NOT_ENOUGH_RESOURCES',
                     7: 'ERR_INVALID_TARGET',
                     8: 'ERR_FULL',
                     9: 'ERR_NOT_IN_RANGE',
                    10: 'ERR_INVALID_ARGS',
                    11: 'ERR_TIRED',
                    12: 'ERR_NO_BODYPART',
                    14: 'ERR_RCL_NOT_ENOUGH',
                    15: 'ERR_GCL_NOT_ENOUGH'
                };
                return codes[code*-1];
            },
            maxCarryResourceType: function(aCarry)
            {
                if (_.isUndefined(aCarry)) return undefined;
                var aMax = _.max(aCarry);
                var aKey = _.findKey(aCarry,(a) => { return a == aMax});
                return aKey;
            },
            dye: function(style, text)
            {
                if( isObj(style) )
                {
                    var css = "";
                    var format = key => css += key + ":" + style[key] + ";";
                    _.forEach(Object.keys(style), format);
                    return('<font style="' + css + '">' + text + '</font>');
                }
                if( style )
                    return('<font style="color:' + style + '">' + text + '</font>');
                else return text;
            },
            CREEP_ROLE:
            {
                'fixer':                { role: require('role.creep.FixerRole'),            spawn: require('spawn.creep.FixerSpawn') },
                'miner':                { role: require('role.creep.MinerRole'),            spawn: require('spawn.creep.MinerSpawn')  },
                'mineral miner':        { role: require('role.creep.MineralMinerRole'),     spawn: require('spawn.creep.MineralMinerSpawn')  },
                'mineral hauler':       { role: require('role.creep.MineralHaulerRole'),    spawn: require('spawn.creep.MineralHaulerSpawn')  },
                'supplier':             { role: require('role.creep.SupplierRole'),         spawn: require('spawn.creep.SupplierSpawn') },
                'extension reloader':   { role: require('role.creep.ExtensionReloaderRole'),spawn: require('spawn.creep.ExtensionReloaderSpawn') },
                'upgrader':             { role: require('role.creep.UpgraderRole'),         spawn: require('spawn.creep.UpgraderSpawn') },
                'builder':              { role: require('role.creep.ConstructorRole'),      spawn: require('spawn.creep.ConstructorSpawn') },
                'room trader':          { role: require('role.creep.RoomTraderRole'),       spawn: require('spawn.creep.RoomTraderSpawn') },
                'remote builder':       { role: require('role.creep.RemoteBuilderRole'),    spawn: require('spawn.creep.RemoteBuilderSpawn') },
                'remote claimer':       { role: require('role.creep.RemoteClaimerRole'),    spawn: require('spawn.creep.RemoteClaimerSpawn') },
                'dismantle':            { role: require('role.creep.DismantleRole'),        spawn: require('spawn.creep.DismantleSpawn') },
                'broker':               { role: require('role.creep.BrokerRole'),           spawn: require('spawn.creep.BrokerSpawn') },
                'remote miner':         { role: require('role.creep.RemoteMinerRole'),      spawn: require('spawn.creep.RemoteMinerSpawn') },
                'remote miner hauler':  { role: require('role.creep.RemoteMinerHaulerRole'),spawn: require('spawn.creep.RemoteMinerHaulerSpawn') },
                'remote reserve':       { role: require('role.creep.RemoteReserveRole'),    spawn: require('spawn.creep.RemoteReserveSpawn') },
            },
            ROOM_OBJECT_TYPE:
            {
                // OWNED room structures
                spawn: STRUCTURE_SPAWN,
                extension: STRUCTURE_EXTENSION,
                constructedWall: STRUCTURE_WALL,
                rampart: STRUCTURE_RAMPART,
                keeperLair: STRUCTURE_KEEPER_LAIR,
                controller: STRUCTURE_CONTROLLER,
                link: STRUCTURE_LINK,
                storage: STRUCTURE_STORAGE,
                tower: STRUCTURE_TOWER,
                observer: STRUCTURE_OBSERVER,
                powerBank: STRUCTURE_POWER_BANK,
                powerSpawn: STRUCTURE_POWER_SPAWN,
                extractor: STRUCTURE_EXTRACTOR,
                lab: STRUCTURE_LAB,
                terminal: STRUCTURE_TERMINAL,
                nuker: STRUCTURE_NUKER,

                // NO OWNED room structures
                container: STRUCTURE_CONTAINER,
                portal: STRUCTURE_PORTAL,
                road: STRUCTURE_ROAD,
                constructedWall: STRUCTURE_WALL,

                // NO room structures - this are RoomObjects
                constructionSite: LOOK_CONSTRUCTION_SITES,
                creep: LOOK_CREEPS,
                flag: LOOK_FLAGS,
                mineral: LOOK_MINERALS,
                nuke: LOOK_NUKES,
                resource: LOOK_RESOURCES,
                source: LOOK_SOURCES,

                //   LOOK_ENERGY: "energy",
                //   LOOK_STRUCTURES: "structure",
                //   LOOK_TERRAIN: "terrain",


            },
            CRAYON:
            {
                death: { color: 'black', 'font-weight': 'bold' },
                birth: '#e6de99',
                derp: '#4C71D6',
                error: 'FireBrick',
                system: { color: '#999', 'font-size': '10px' },
                debug: { color: '#999', 'font-size': '10px' }
            },
            isObj: function(val)
            {
                if (val === null) { return false;}
                return ( (typeof val === 'function') || (typeof val === 'object') );
            },
            addById: function(array, id)
            {
                if(array == null) array = [];
                var obj = Game.getObjectById(id);
                if( obj ) array.push(obj);
                return array;
            },
            findAdjacentWalkablePositions: function(sourcePos)
            {
                //console.log('Prototype: ['+sourcePos.x+' '+sourcePos.y+']');
                var dX = [ 0, 1, 1, 1, 0,-1,-1,-1];
                var dY = [-1,-1, 0, 1, 1, 1, 0,-1];

                var result = [];
                for (var i=0; i<dX.length; i++)
                {
                    var nX = sourcePos.x+dX[i];
                    var nY = sourcePos.y+dY[i];
                    var derp = Game.map.getTerrainAt(nX,nY,sourcePos.roomName);

                    if (derp != 'wall')
                    {
                        //console.log(sourcePos.roomName+' ['+nX+' '+nY+'] '+' - '+derp);
                        result.push(new RoomPosition(nX,nY,sourcePos.roomName));
                    }
                };
                return result;
            },
            logDERP: function(message)
            {
                console.log(dye(CRAYON.derp,'DERP: '+message));
            },
            logDEBUG: function(message)
            {
                if (DEBUG)
                {
                    console.log(dye(CRAYON.debug,'DEBUG: '+message));
                }
            },
            logWARN: function(message)
            {
                if (WARN)
                {
                    console.log(dye(CRAYON.birth,'WARN: '+message));
                }
            },
            logERROR: function(message)
            {
                if (ERROR)
                {
                    console.log(dye(CRAYON.error,'ERROR: '+message));
                }
            },
       });
    }
};
module.exports = mod;
