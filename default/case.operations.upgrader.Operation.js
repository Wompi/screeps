var OperationsArea = require('case.operations.upgrader.Area');


class UpgraderOperation
{
    constructor(pRoom)
    {
        this.mController = pRoom.controller;
        this.mArea = undefined;
    }

    init()
    {
        this.mArea = new OperationsArea(this);
    }
    // - init the controller (upgrade area)
    // - upgrader creeps (one or more)
    //      - estimate workParts
    //      -
    // - hauler / link / box
    // - connection to other rooms (upgradeoperations)
    // - statistics (controlpoints per 1000 ticks and more)
    processOperation()
    {
        this.mArea.processArea();
    }

}
module.exports = UpgraderOperation;
