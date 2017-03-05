class ServerNode
{
    constructor(pModule)
    {
        Log(undefined,'NODE: NEW NODE');
        this.mReset = false;
        if (pModule.timestamp != Memory.timestamp)
        {
            Memory.timestamp = pModule.timestamp,
            Memory.nodeCount = 0;
            this.mReset = true;
        }
        this.mNode = (Memory.nodeCount + 1);

        this.mFirstTick = Game.time;
        this.mLastTick = Game.time;

        this.mNodeAge = 0;
        this.mNodeUpdateDelta = 0;

        Memory.nodeCount = this.mNode;
    }

    updateNode()
    {
        this.mNodeAge = Game.time - this.mFirstTick;
        this.mNodeUpdateDelta = Game.time - this.mLastTick;
        this.mLastTick = Game.time;
    }

    printStats()
    {
        Log(LOG_LEVEL.info,'NODE['+this.mNode+'] age: '+this.mNodeAge+' last: '+this.mNodeUpdateDelta);
    }
}
module.exports = ServerNode;
