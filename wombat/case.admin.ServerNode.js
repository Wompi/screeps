class ServerNode
{
    constructor(pModule,pCallback = undefined)
    {
        Log(undefined,'NODE: NEW NODE');
        this.mCallback = pCallback;

        this.aMem = {
            root: Memory,
            path: ['game', 'server'],
            // value: [ 'nodeCounter' , 'changeTick', 'timeStamp', 'nodes' ],
            // defaults: [ 0, Game.time, pModule.timestamp, {}],
        }
        this.aNodeCountMem = {
            root: Memory,
            path: ['game', 'server', 'nodeCounter'],
        }
        this.aNodeMem = {
            root: Memory,
            path: ['game', 'server', 'nodes'],
        };

        this.mFirstTick = Game.time;
        this.mLastTick = Game.time;

        this.mNode = _.get(this.aNodeCountMem.root,this.aNodeCountMem.path,0) + 1;
        this.mTimeStamp = pModule.timestamp;
        this.saveNode();
    }

    saveNode()
    {
        var aSave = _.get(this.aMem.root,this.aMem.path,
        {
            nodeCounter: this.mNode,
            changeTick: this.mFirstTick,
            timeStamp: 0,
            nodes: {},
        });
        console.log(JS(aSave));

        if (aSave.timeStamp != this.mTimeStamp)
        {
            aSave.timeStamp = this.mTimeStamp;
            aSave.nodes = {};
            aSave.nodeCounter = 1;
            this.mNode = 1;
            _.set(this.aMem.root,this.aMem.path,aSave);



            if (!_.isUndefined(this.mCallback))
            {
                Log(undefined,'NODE: reset processs callback!');
                this.mCallback(true);
            }
        }
        else
        {
            if (!_.isUndefined(this.mCallback))
            {
                Log(undefined,'NODE: memory processs callback!');
                this.mCallback(false);
            }
        }

        //return;
        var aDate = new Date();

        aSave.nodes[this.mNode] = {
            firstTick: this.mFirstTick,
            lastTick: this.mLastTick,
            date: aDate.getMinutes()+' '+aDate.getSeconds(),
        }
        _.set(this.aNodeCountMem.root,this.aNodeCountMem.path,this.mNode);
    }

    updateTick(pDebug = false)
    {
        this.aMem.root = Memory;
        this.aNodeCountMem.root = Memory;
        this.aNodeMem.root = Memory;

        var myNodes = _.get(this.aNodeMem.root,this.aNodeMem.path);
        this.mLastTick = myNodes[this.mNode].lastTick;

        if (pDebug)
        {
            this.printStats();
        }

        myNodes[this.mNode].lastTick = Game.time;
    }

    printStats()
    {
        var aMem = _.get(this.aMem.root,this.aMem.path);

        var derp =
        {
            cpu: Game.cpu.getUsed(),
            tick: Game.time - this.mFirstTick,
            timestamp: new Date(aMem.timeStamp).toString(),
            node: this.mNode,
            first: aMem.nodes[this.mNode].firstTick,
            deltaLast: Game.time - this.mLastTick,
            commit: aMem.changeTick,
        };
        console.log('SERVER NODE: '+JSON.stringify(derp,undefined,2));

        var myNodes = _.get(this.aNodeMem.root,this.aNodeMem.path);
        _.forEach(myNodes, (a,b) =>
        {
            var msg = b+' -> '+(Game.time-a.lastTick)+' fist: '+a.firstTick +' delta: '+(a.lastTick-a.firstTick);
            if (b == this.mNode)
            {
                msg = `<font color="#a52a2a">${msg}</font>`;
            }
            console.log(msg);
        });
    }
}
module.exports = ServerNode;
