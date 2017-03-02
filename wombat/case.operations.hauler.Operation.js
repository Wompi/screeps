class HaulerOperation
{
    constructor(pRoom)
    {
        this.mRoom = pRoom;
    }

    processOperation()
    {
        this.log(LOG_LEVEL.error,'processOperation() '+this.mRoom.name);
    }

    log(pLevel,pMsg)
    {
        Log(pLevel,'HaulerOperation '+this.mRoom.name+' : '+pMsg);
    }
}
module.exports = HaulerOperation;
