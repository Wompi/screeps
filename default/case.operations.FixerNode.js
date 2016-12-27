class FixerNode
{
    constructor()
    {
        this.initNode()
    }

    getCurrentNode()
    {
        return this.mCurrentNode;
    }

    getNextNode()
    {
        this.setCurrentNode(this.getNodes()[Memory.operations.fixer['currentNode'].next]);
        return this.getCurrentNode();
    }

    setCurrentNode(aNode)
    {
        Memory.operations.fixer['currentNode'] = aNode;
        this.mCurrentNode = new RoomPosition(aNode.x,aNode.y,aNode.roomName);
    }

    initNode()
    {
        if (_.isUndefined(Memory.operations)) Memory.operations = {};
        if (_.isUndefined(Memory.operations.fixer)) Memory.operations.fixer = {};

        if (_.isUndefined(Memory.operations.fixer['currentNode']))
        {
            Memory.operations.fixer['currentNode'] = this.getNodes()[0];
        }
        this.setCurrentNode(Memory.operations.fixer['currentNode']);
    }

    getNodeRooms()
    {
        var myRoomNames  = _.pluck(_.uniq(this.getNodes(),'roomName'),'roomName');
        var result = [];
        _.forEach(myRoomNames, (aName) => { result.push(Game.rooms[aName])});
        return result;
    }

    // TODO: this should be generated later and probaly moved to another place
    getNodes()
    {
        return  [
                    {   x: 42,   y: 41, roomName:"E66N49", next:  1, },
                    {   x: 44,   y: 26, roomName:"E66N49", next:  2, },
                    {   x: 31,   y: 25, roomName:"E66N49", next:  3, },
                    {   x: 13,   y: 39, roomName:"E66N49", next:  4, },
                    {   x:  1,   y: 36, roomName:"E66N49", next:  5, },

                    {   x: 48,   y: 36, roomName:"E65N49", next:  6, },
                    {   x: 33,   y: 25, roomName:"E65N49", next:  7, },
                    {   x: 30,   y: 43, roomName:"E65N49", next:  8, },
                    {   x: 28,   y: 48, roomName:"E65N49", next:  9, },
                    {   x: 20,   y: 18, roomName:"E65N49", next: 10, },
                    {   x: 45,   y: 27, roomName:"E65N49", next: 11, },
                    {   x:  1,   y: 11, roomName:"E65N49", next: 12, },

                    {   x: 12,   y: 48, roomName:"E66N49", next: 13, },

                    {   x: 12,   y:  1, roomName:"E66N48", next: 14, },
                    {   x: 45,   y: 25, roomName:"E66N48", next: 15, },
                    {   x: 37,   y: 40, roomName:"E66N48", next: 16, },
                    {   x: 32,   y: 43, roomName:"E66N48", next: 17, },
                    {   x: 29,   y: 43, roomName:"E66N48", next:  0, },
                ];
    }
}
module.exports = FixerNode;
