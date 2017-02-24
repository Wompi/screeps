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
                        this.memory.bodyCost = _.reduce(this.body, (result,aType) => { return result += BODYPART_COST[aType.type]; },0);
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
            'isFull':
            {
                configurable: true,
                get: function ()
                {
                    if (_.isUndefined(this._isFull))
                    {
                        this._isFull = (this.carryCapacity - _.sum(this.carry)) == 0;
                    }
                    return this._isFull;
                }

            }
        });


        /**
         * Prints buttons to console that allow for manual movement control of the creep.
         * Still want to add more features, could easily be modified to do other actions
         * with more buttons. If you do anything with it please share!
         * Author: Helam
         */
        Creep.prototype.override = function() {
            let directions = [8,1,2,3,4,5,6,7];
            let labels = ['ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ','ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ','ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ','ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ','ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ','ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ','ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ','ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ'];
            let buttons = directions.map((dir, idx)=>{
                let id = this.id;
                let manualCommand = `Game.creeps.${this.name}.move(${dir});`;
                return makeButton(id, undefined, `${labels[idx]}`, manualCommand);
            });
            let holdId = this.id;
            let holdCommand = `Game.creeps.${this.name}.cancelOrder('move')`;
            let holdButton = makeButton(holdId, undefined, 'X', holdCommand);
            let [top_left, top, topRight, right, bottom_right, bottom, bottom_left, left] = buttons;
            let output = top_left + top + topRight + `\n` + left + holdButton + right + `\n` + bottom_left + bottom + bottom_right;
            console.log(output);
        };





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
            if (this.myRole.isRoleActive())
            {
                Profiler.start(this.myRole.myName);
                this.myRole.processRole(this);
                Profiler.end(this.myRole.myName);
            }
            else logWARN('CREEP: role - '+this.myRole+' is not active!');
        };


        Creep.prototype.init = function()
        {
            delete this._isFull;
            delete this._bodySize;
            delete this._spawnTime;
            delete this._bodyCost;
            delete this._liveRenewTime;
            delete this._liveRenewEnergy;
            delete this._liveTime;

            if (FUNCTION_CALLS_CREEP)
            {
                logDEBUG('CREEP: init - ['+this.pos.x+' '+this.pos.y+'] N: '+this.name);
            }
        };
    }
};
module.exports = mod;
