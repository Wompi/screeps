class RemoteMiningMiner
{
    constructor(pOperation)
    {
        this.mOperation = pOperation;
        this.mSource = Game.getObjectById('57ef9ea886f108ae6e60fae0');
        this.mLab = Game.getObjectById('586c4b1463d011e1364344ae');

    }

    process(pRoomName)
    {
        //this.testStuff();

        var ROLE_NAME = 'remote miner 1 '+pRoomName;
        var myCreep = _.find(Game.creeps,(aCreep) => { return aCreep.memory.role == ROLE_NAME})

        if (!this.mOperation.isSecure)
        {
            this.retreat(myCreep);
            return;
        }

        var aSpawn = Game.spawns['Nexus Outpost'];
        if (_.isUndefined(myCreep))
        {
            // 2200 = A * 75
            var aWork = 2
            var aMove = 1;

            var aW = new Array(aWork).fill(WORK);
            var aM = new Array(aMove).fill(MOVE);
            var aBody = aW.concat(aM);

            var aCost = aWork * 100 + aMove * 50;

            var aMem =
            {
                role: ROLE_NAME,
            };
            var result = aSpawn.createCreep(aBody,'RM1 '+pRoomName,aMem);
            logDERP('C('+ROLE_NAME+'):('+aSpawn.name+') '+aCost+' aWork = '+aWork+' aMove = '+aMove+' result = '+ErrorSting(result));
            return;
        }
        else
        {
            logDERP(ROLE_NAME+' active ......');
        }
        if (myCreep.spawning) return;

        if (!_.any(myCreep.body, i => !!i.boost))
        {
            if (!myCreep.pos.isNearTo(this.mLab))
            {
                //myCreep.moveTo(this.mLab, {ignoreCreeps: true});
                myCreep.travelTo(this.mLab);
            }
            else
            {
                this.mLab.boostCreep(myCreep, 1);
            }
            return;
        }

        var aPos = new RoomPosition(33, 17, pRoomName);
        if (!myCreep.pos.isEqualTo(aPos))
        {
            // myCreep.moveTo(aPos, {ignoreCreeps: true});
            myCreep.travelTo({pos:aPos});
        }
        else
        {
            var result = myCreep.harvest(this.mSource);
            if (result == OK)
            {
                var aAmount = myCreep.getActiveBodyparts(WORK) * HARVEST_POWER * 4;
                Memory.operations.remote.mining[pRoomName].source.amountSinceInvader += aAmount;
            }
        }
    }

    retreat(pCreep)
    {
        if (_.isUndefined(pCreep)) return;

        var aPos = new RoomPosition(25,44,'E65N49');
        pCreep.moveTo(aPos);
        //pCreep.travelTo({pos:aPos});
    }

    testStuff()
    {
        var aStartPos = Game.spawns['Nexuspool'].getSpawnPos();
        var aEndPos = this.mSource.pos;

        var aPath = Util.getPath(aStartPos,aEndPos);

        var aLen = aPath.path.length;


        var LOC_TO_DIRECTION = {
            [TOP]:          [  0,  -1 ],
            [TOP_RIGHT]:    [  1,  -1 ],
            [RIGHT]:        [  1,   0 ],
            [BOTTOM_RIGHT]: [  1,   1 ],
            [BOTTOM]:       [  0,   1 ],
            [BOTTOM_LEFT]:  [ -1,   1 ],
            [LEFT]:         [ -1,   0 ],
            [TOP_LEFT]:     [ -1,  -1 ],
        };

        var aString = ''.concat(aStartPos.getDirectionTo(aPath.path[0]));
        _.forEach(aPath.path, (value,index,all) =>
        {
            if (index < (aPath.path.length-1))
            {
                aString = aString.concat(value.getDirectionTo(aPath.path[index+1]));
            }

            // logDERP('value = '+JSON.stringify(value));
            // logDERP('index = '+JSON.stringify(index));
            // logDERP('all = '+JSON.stringify(all));
            // logDERP('aString = '+JSON.stringify(aString));

            //return index < 3;
        });
        logDERP('DIRECTION PATH: '+aString)


        aPath.path = [];
        logDERP('SOURCE TEST: ('+aLen+')'+JSON.stringify(aPath));

    }

}
module.exports = RemoteMiningMiner;
