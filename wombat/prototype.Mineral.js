Mineral.prototype.miningPositions = function()
{
    var aRange = 1;
    var aArea = this.pos.adjacentPositions(aRange);
    return aArea;
}
