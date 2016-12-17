var mod =
{
    SAY_PUBLIC: true,
    // CREEP_ROLE:
    // {
    //     miner: new require('role.Miner'),
    //     supply: new require('role.Supply'),
    // },
    MAX_ROOM_RANGE: 25, // for some range checks use this as max room range
    STORAGE_MAINTENANCE_RESERVE_LIMIT: 20000, // how many energy I want to be in the storage before it can be used for other stuff
    HAULER_PICKUP_RANGE: 7, // this is the range at whitch the hauler can pickup scattered resources


    LOG_LEVEL: [ 'debug', 'info' , 'warn' , 'error'],
    DEBUG: false,
    ERROR: true,
    WARN: true,
    INFO: true,
    //Test: new TestCenter(),

    FUNCTION_CALLS_ROOM: false,
    FUNCTION_CALLS_STRUCTURE_EXTENSION: false,
    FUNCTION_CALLS_STRUCTURE_RESOURCE: false,
    FUNCTION_CALLS_CONSTRUCTION_SITE: false,
    FUNCTION_CALLS_CREEP: false,
    FUNCTION_CALLS_SOURCE: true,
    FUNCTION_CALLS_STRUCTURE_SPAWN: false,
    FUNCTION_CALLS_STRUCTURE_TOWER: false,
    FUNCTION_CALLS_STRUCTURE_CONTAINER: false,
    FUNCTION_CALLS_FLAG: false,
    FUNCTION_CALLS_STRUCTURE_LINK: false,
    FUNCTION_CALLS_STRUCTURE: false,
    FUNCTION_CALLS_STRUCTURE_ROAD: false,
    FUNCTION_CALLS_MINERAL: false,
    FUNCTION_CALLS_STRUCTURE_CONTROLLER: false,
    FUNCTION_CALLS_STRUCTURE_STORAGE: false,
    FUNCTION_CALLS_STRUCTURE_EXTRACTOR: false,
    FUNCTION_CALLS_STRUCTURE_TERMINAL: false,
    FUNCTION_CALLS_ROOM_POSITION: false,
    FUNCTION_CALLS_STRUCTURE_LAB: false,
}
module.exports = mod;
