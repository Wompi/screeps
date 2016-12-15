var mod =
{
    extend: function()
    {
        Object.defineProperties(Creep.prototype,
        {
            'bodySize':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this.memory.bodySize))
                    {
                        this.memory.bodySize = _.size(this.body);
                    }
                    return this.memory.bodySize;
                }
            },
            'spawnTime':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this.memory.spawnTime))
                    {
                        this.memory.spawnTime = this.bodySize * CREEP_SPAWN_TIME;
                    }
                    return this.memory.spawnTime;
                }
            },
            'bodyCost':
            {
                configurable: true,
                get: function()
                {
                    if (_.isUndefined(this.memory.bodyCost))
                    {
                        this.memory.bodyCost = 0;
                        for (var bodyPart of this.body)
                        {
                            this.memory.bodyCost = this.memory.bodyCost + BODYPART_COST[bodyPart.type];
                        }
                    }
                    return this.memory.bodyCost;
                }
            },
            'liveTime':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this.memory.liveTime))
                    {
                        this.memory.liveTime = 0;
                    }
                    //logERROR('Creep:'+this.name+' '+Game.time+' '+this.memory.liveTime);
                    // if (_.isUndefined(this._liveTime))
                    // {
                    //     logERROR('DERP!');
                    //     this._liveTime = this.memory.liveTime;
                    // }
                    return this.memory.liveTime;
                }

            },
            'liveRenewTime':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this.memory.liveRenewTime))
                    {
                        this.memory.liveRenewTime = _.floor(600/this.bodySize);
                    }
                    return this.memory.liveRenewTime;
                }
            },
            'liveRenewEnergy':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this.memory.liveRenewEnergy))
                    {
                        this.memory.liveRenewEnergy = _.ceil(this.bodyCost/2.5/this.bodySize);
                    }
                    return this.memory.liveRenewEnergy;
                }
            },
        });

        Creep.prototype.honk = function()
        {
            this.say('\u{26D4}\u{FE0E}', SAY_PUBLIC);
        };

        Creep.prototype.increaseLiveTime = function()
        {
            if (!this.spawning)
            {
                this.memory.liveTime = this.memory.liveTime + 1;
            }
        };

        Creep.prototype.getLiveRenewTicks = function()
        {
            var result = 0;
            if (!this.spawning)
            {
                result = _.floor((CREEP_LIFE_TIME - this.ticksToLive)/this.liveRenewTime);
            }
            return result;
        };

        //
        // Creep.prototype.getRole = function()
        // {
        //     logDEBUG('CREEP: getRole() - '+aRole);
        //     return this.myRole;
        // };


        // TEST stuff
        Creep.prototype.registerRole = function(aRole)
        {
            this.myRole = aRole;
        };

        Creep.prototype.processRole = function()
        {
            if (_.isUndefined(this.myRole))
            {
                logERROR('CREEP '+this.name+' has no registered role  - fix this for ['+this.memory.role+']!');
                return;
            }
            if (this.myRole.isRoleActive()) this.myRole.processRole(this);
            else logWARN('CREEP: role - '+this.myRole+' is not active!');
        };


        Creep.prototype.init = function()
        {
            if (FUNCTION_CALLS_CREEP)
            {
                logDEBUG('CREEP: init - ['+this.pos.x+' '+this.pos.y+'] N: '+this.name);
            }
            delete this._bodySize;
            delete this._spawnTime;
            delete this._bodyCost;
            delete this._liveRenewTime;
            delete this._liveRenewEnergy;
            delete this._liveTime;
        };
    }
};
module.exports = mod;
