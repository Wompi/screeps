var MiningMemory = require('case.operations.mining.Memory');
var MiningMiner = require('case.operations.mining.Miner');

class MiningOperation
{
    constructor()
    {

        this.mMemory = new MiningMemory(this);
    }

    processOperation()
    {

    }
}
module.exports = MiningOperation
