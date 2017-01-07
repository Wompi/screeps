class UpgraderOperationArea
{
    constructor(pOperations)
    {
        this.mController = pOperations.mController;
        this.mRoom = this.mController.room;
    }

    processArea()
    {
        var aPos =
        {
            top: this.mController.pos.y - 3,
            left: this.mController.pos.x - 3,
            bottom: this.mController.pos.y + 3,
            right: this.mController.pos.x + 3,
        }
        // var aArea = this.mRoom.lookAtArea(aPos.top, aPos.left, aPos.bottom, aPos.right, true);
        //
        // logDERP('OP: (upgrader) = '+JSON.stringify(aArea));
        //
        // _.forEach(aArea, (a) =>
        // {
        //     var aX = a.x;
        //     var aY = a.y;
        //     var aType = a.type;
        //     var aEntity = a[aType];
        //     logDERP('OP: (upgrader) = ['+aX+' '+aY+']['+aType+'] '+JSON.stringify(aEntity));
        //
        //     if (aEntity == 'plain' || aEntity == 'swamp')
        //     {
        //         var aLook = this.mRoom.lookForAt(LOOK_FLAGS,aX,aY);
        //         if (aLook.length == 0)
        //         {
        //             //logDERP('aLook = '+JSON.stringify(aLook));
        //             //this.mRoom.createFlag(aX,aY);
        //         }
        //         else
        //         {
        //             aLook[0].remove();
        //         }
        //     }
        // });

        // _.forEach(Game.spawns, (aSpawn) =>
        // {
        //     var aStartPos = aSpawn.getSpawnPos();
        //     var aEndPos = this.mController.pos;
        //     var aPath = Util.getPath(aEndPos,aStartPos);
        //
        //     logDERP('Spawn: '+aSpawn.name+' length: '+aPath.path.length+' incomplete: '+aPath.incomplete+' ops: '+aPath.ops)
        //
        //     // _.forEach(aPath.path, (a) =>
        //     // {
        //     //     var aRoom = Game.rooms[a.roomName];
        //     //     var aLook = aRoom.lookForAt(LOOK_FLAGS,a.x,a.y);
        //     //     if (aLook.length == 0)
        //     //     {
        //     //         //logDERP('aLook = '+JSON.stringify(aLook));
        //     //         //aRoom.createFlag(a.x,a.y,undefined,COLOR_GREY,COLOR_GREY);
        //     //     }
        //     //     else
        //     //     {
        //     //         aLook[0].remove();
        //     //     }
        //     //
        //     // })
        // })

    }
}
module.exports = UpgraderOperationArea;
