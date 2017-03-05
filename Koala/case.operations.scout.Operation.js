

var CLASSIFY =
{
    unknown: 'unknown',
    dangerous: 'dangerous',
    visited: 'visited',
};


/**
 *  SCOUT OPERATION: the scout is meant to be a automatic room detector and should roam around and survey the
 *                      surraoundings
 *
 *  - lets start with a simple detect the adjacent rooms and move to each one once to see where it leads us
 *
 * TODO:
 *  -   classify the scouted room (neutral,rich,hostile_pc,hostile_npc, ....)
 *  -   maybe give the scout some tools to check if the room is hostile - maybe one attack/work to check the defense
 *      - this should not be the main scout rather a new one dedicated to this task
 *  -   the scout should cartograph pathing to every exit/source/controller - war targets in general
 *
 */
class ScoutOperation
{
    constructor()
    {
        this.mScouts = [];
    }

    processOperation()
    {
        this.spawnScout();
        this.doScouting();
    }

    doScouting()
    {
        this.mScouts = _.filter(this.mScouts, (aCreep) => !aCreep.spawning);
        if (this.mScouts.length == 0) return;

        var aScout = this.mScouts[0]; // for starters we use only one scout to see how it goes

        var myRoomsToScout = Mem.getEnsured(aScout.memory,'roomsToScout',[]);

        if (_.isEmpty(myRoomsToScout))
        {
            // if the scout has no targets (memory wiped or new start) we push the current room as start pPoints
            // this is allways a owned room because we had to spawn here
            // TODO: if the memory gets wiped and rooms allrady scouted - maybe loop over the rooms to find the next one
            myRoomsToScout.push(aScout.pos.roomName);
        }

        if (aScout.pos.roomName != myRoomsToScout[0])
        {
            var myExits = Mem.getEnsured(Memory,['rooms',aScout.pos.roomName,'exits',myRoomsToScout[0]]);
            Log(undefined,'DERP: '+JS(myExits))
            Visualizer.visualizePoints(aScout.pos.roomName,myExits,{fill: COLOR.blue})


            // var res = aScout.travelTo({pos: new RoomPosition(25,25,myRoomsToScout[0])})
            var res = aScout.moveTo(new RoomPosition(25,25,myRoomsToScout[0]),
            {
                costCallback:  function(roomName)
                {
                    Log(undefined,'MOVE DERP ........ '+roomName);
                    return new PathFinder.CostMatrix(255);
                }
            });
            aScout.say(myRoomsToScout[0]);
            Log(undefined,'OPERATION: scout moves to '+myRoomsToScout[0]+' '+ErrorString(res));
        }
        else
        {
            Log(undefined,'OPERATION: scout - derp');
            // hmmm we need to move off of the exit here otherwise the scout stops and gets teleported back to the
            // previeous room
            var aCreepRoom = aScout.room;

            var hasInvaders = aCreepRoom.find(FIND_HOSTILE_CREEPS).length > 0;

            if (!hasInvaders)
            {
                // TODO: the findLocalExits will be processed every time change this
                var myRoomExits = Mem.getEnsured(Memory,['rooms',aCreepRoom.name,'exits'],aCreepRoom.findLocalExits());

                _.each(_.keys(myRoomExits), (aName) =>
                {
                    var isNotClassified = Mem.getEnsured(Memory,['rooms',aName,'classified'],CLASSIFY.unknown) == CLASSIFY.unknown;
                    Log(undefined,'MEGADERP: '+Mem.getEnsured(Memory,['rooms',aName,'classified'],CLASSIFY.unknown)+' '+isNotClassified);
                    if (isNotClassified)
                    {
                        myRoomsToScout.push(aName);
                    }
                });
                // TODO: here should be the whole classification stuff
                _.set(Memory,['rooms',aCreepRoom.name,'classified'],CLASSIFY.visited);
            }
            else
            {
                _.set(Memory,['rooms',aCreepRoom.name,'classified'],CLASSIFY.dangerous);
            }
            myRoomsToScout.shift(); // remove the target
        }
    }

    spawnScout()
    {
        this.mScouts = getCreepsForRole(CREEP_ROLE.scout);
        if (this.mScouts.length > 0) return;

        var aSpawn = _.find(Game.spawns);  // this should be adjusted to find the closest spawn to unscouted rooms

        if (aSpawn.room.energyAvailable >= 50)
        {
            // reuse the last dead scout
            var aName = _.findKey(Memory.creeps, (aCreepMem,aCreepName) =>
            {
                if (aCreepMem.role != CREEP_ROLE.scout) return false;
                if (!_.isUndefined(Game.creeps[aCreepName])) return false;

                // TODO: later it could be rewarding to filter all dead scouts to there nearest scout position
                // this is true when I decide to let the scouted destinations on the scout itself - we will see
                return true;
            });
            var res = aSpawn.createCreep([MOVE],aName,{ role: CREEP_ROLE.scout});
            Log(undefined,'OPERATION: scout - spawn '+ErrorString(res));
        }
    }
}
module.exports = ScoutOperation;
