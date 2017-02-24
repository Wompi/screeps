RoomVisual.prototype.drawCross = function(x, y, style)
{
    this.line(x-0.2, y-0.2, x+0.2, y+0.2, style);
    this.line(x+0.2, y-0.2, x-0.2, y+0.2, style);
};




extend = function()
{
    Object.defineProperties(RoomVisual.prototype,
    {
        'entityType':
        {
            configurable: true,
            get: function()
            {
                return ENTITY_TYPES.roomVisual;
            },
        },
        'id':
        {
            configurable: true,
            get: function()
            {
                // TODO: maybe generate a ID for this one
                return this.toString();
            },
        }
    });
};
extend();
