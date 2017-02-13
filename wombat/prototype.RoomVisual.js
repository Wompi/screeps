RoomVisual.prototype.drawCross = function(x, y, style)
{
    this.line(x-0.2, y-0.2, x+0.2, y+0.2, style);
    this.line(x+0.2, y-0.2, x-0.2, y+0.2, style);
};
