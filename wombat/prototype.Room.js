
Room.prototype.test = function()
{
    console.log('ROOM PROTOTYPE TEST');
}

var extend = function()
{
    Object.defineProperties(Room.prototype,
    {
        'mineral':
        {
            configurable: true,
            get: function()
            {
                if (!this._mineral)
                {
                    var aArr = this.find(FIND_MINERALS);
                    this._mineral = aArr[0];
                }
                else
                {
                    console.log('MINERAL CACHE......');
                }
                return this._mineral;

            }
        }
    });
}
module.exports = extend;
