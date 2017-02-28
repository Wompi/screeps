
_.assign(global,
{
    ENTITY_TYPES:
    {
        source: 'source',
        flag: 'flag',
        creep: 'creep',
        constructionSite: 'constructionSite',
        mineral: 'mineral',
        nuke: 'nuke',
        resource: 'resource',
        room: 'room',
        roomPosition: 'roomPosition',
        roomVisial: 'roomVisual',


        controller: 'controller',
        road: 'road',
        spawn: 'spawn',
        extension: 'extension',
        container: 'container',
        tower: 'tower',
    },
});

_.assign(global,
{
    SAY_PUBLIC: true,
    // CREEP_ROLE:
    // {
    //     miner: new require('role.Miner'),
    //     supply: new require('role.Supply'),
    // },
    MAX_ROOM_RANGE: 100000, // for some range checks use this as max room range
    STORAGE_MAINTENANCE_RESERVE_LIMIT: 20000, // how many energy I want to be in the storage before it can be used for other stuff
    HAULER_PICKUP_RANGE: 7, // this is the range at whitch the hauler can pickup scattered resources

    ROOM_TYPE:
    {
        highway: 'Highway',
        center: 'Center',
        sourceKeeper: 'SourceKeeper',
        playerRoom: 'PlayerRoom',
    },


    // hese are my screep roles
    CREEP_ROLE:
    {
        scout: 'scout',
        miner: 'miner',
    },

    SOURCE_TYPE:
    {
        drop: 'drop',
        box: 'box',
        link: 'link',
    },

    ROOM_OBJECTS:
    {
        [ENTITY_TYPES.source]: Source,
        [ENTITY_TYPES.flag]: Flag,
        [ENTITY_TYPES.creep]: Creep,
        [ENTITY_TYPES.constructionSite]: ConstructionSite,
        [ENTITY_TYPES.mineral]: Mineral,
        [ENTITY_TYPES.nuke]: Nuke,
        [ENTITY_TYPES.resource]: Resource,
        //structure: Structure,
    },

    LOG_LEVEL: [ 'debug', 'info' , 'warn' , 'error'],
    DEBUG: false,
    ERROR: true,
    WARN: true,
    INFO: true,

    WALL: 'wall',
    PLAIN: 'plain',
    SWAMP: 'swamp',

    COLOR: {
        red: '#FF0000',
        green: '#00FF00',
        blue: '#0000FF',
        yellow: '#FFFF00',
    },

    BOOST_TASK_HARVEST: 'harvest',
    BOOST_TASK_BUILD: 'build',
    BOOST_TASK_REPAIR: 'repair',
    BOOST_TASK_DISMANTLE: 'dismantle',
    BOOST_TASK_UPGRADE_CONTROLLER: 'upgradeController',
    BOOST_TASK_ATTACK: 'attack',
    BOOST_TASK_RANGED_ATTACK: 'rangedAttack',
    BOOST_TASK_RANGED_MASSATTACK: 'rangedMassAttack',
    BOOST_TASK_HEAL: 'heal',
    BOOST_TASK_RANGED_HEAL: 'rangedHeal',
    BOOST_TASK_CAPACITY: 'capacity',
    BOOST_TASK_FATIGUE: 'fatigue',
    BOOST_TASK_DAMAGE: 'damage',

    TASKS:
    {
        [WORK]:
        {

        }
    },


    CONTROLLER_UPGRADE_RANGE: 3,
    TYPE_TERRAIN: 'terrain',

    DIRECTIONS: [TOP,TOP_RIGHT,RIGHT,BOTTOM_RIGHT,BOTTOM,BOTTOM_LEFT,LEFT,TOP_LEFT],
    LOCATION_TO_DIRECTION: {
                                [TOP]:          [  0,  -1 ],
                                [TOP_RIGHT]:    [  1,  -1 ],
                                [RIGHT]:        [  1,   0 ],
                                [BOTTOM_RIGHT]: [  1,   1 ],
                                [BOTTOM]:       [  0,   1 ],
                                [BOTTOM_LEFT]:  [ -1,   1 ],
                                [LEFT]:         [ -1,   0 ],
                                [TOP_LEFT]:     [ -1,  -1 ],
    },
    REVERSE_DIR: (aDirection) => (aDirection + 4) % 9,

    BLUEPRINTS:
    {   //     0 1 2 3 4
        //     ---------
        // 0 | . o o o o
        // 1 | o . L   o
        // 2 | o L c L o
        // 3 | o   S   o
        // 4 | o o o o o
        name: 'extension bay',
        layout:
        {
            extension: [ [1,0],[2,0],[3,0],[4,0],[0,1],[4,1],[0,2],[4,2],[0,3],[4,3],[0,4],[1,4],[2,4],[3,4],[4,4] ], //[ [x1,y1], [x2,y2], [], ]
            lab: [ [2,1],[1,2],[3,2] ],
            container: [ [2,2] ],
            spawn: [ [2,3] ],
            road: [ [0,0],[1,1] ],
        }
    },

    RCL_ENERGY: (rcl) =>
    {
        return CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][rcl] * EXTENSION_ENERGY_CAPACITY[rcl] + CONTROLLER_STRUCTURES[STRUCTURE_SPAWN][rcl] * SPAWN_ENERGY_CAPACITY
    }
});
