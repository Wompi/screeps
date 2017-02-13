var mod =
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


}
module.exports = mod;
