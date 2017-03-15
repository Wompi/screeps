class Operation
{
    constructor(pName)
    {
        this.mName = pName;
    }

    getName()
    {
        return this.mName;
    }

    log(pLevel,pMsg)
    {
        Log(pLevel,this.mName+': '+pMsg);
    }
}
module.exports = Operation;
