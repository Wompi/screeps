/**
 * Generalized target locking function for creeps
 *
 * The selector function picks all available candidates, but only runs during
 * the target selection phase. This is where your CPU heavy work should go.
 *
 * The validator function is ran for each candidate, and once per call to
 * ensure the target is still valid for use, so you want this function to be as
 * cheap as possible. The parameter is technically optional, with all values
 * being considered valid. But then why are you using this?
 *
 * The chooser function is ran once at the end of target selection, to pick
 * which of the valid candidates you want to use. This parameter is optional,
 * defaulting to the first item in the array if omitted. It expects a single
 * result so opt for a _.min or _.max over a sort.
 *
 * The prop parameter is the key used to store the target's id in memory. This
 * optionally allows us to have multiple target locks with different names.
 *
 * @param function selector - Gets a list of target candidates
 * @param function validator - Check if a target is still valid
 * @param function chooser - Pick the best target from the list
 * @param string prop - Property name in memory to store the target id
 */
Creep.prototype.getTarget = function(selector, validator=_.identity, chooser=_.first, prop='tid') {
	let tid = this.memory[prop];
	let target = Game.getObjectById(tid);
	if(target == null || !validator(target))
    {
		let candidates = _.filter(selector.call(this,this), validator);
		if(candidates && candidates.length)
        {
			target = chooser(candidates);
        }
		if(target)
        {
			this.memory[prop] = target.id;
        }
		else
        {
			delete this.memory[prop];
        }
	}
	return target;
}

/**
 *	This one looks for used carry parts (used means has energy in it)
 *		- a: filter for carry parts with boost
 *		- b: pluck the values of boost
 *		- c: find the boost string (undefined or one of the carry boost strings KH KH2O XKH2O)
 *		- d: get the value for this boost string from BOOSTS
 *
 *		- e: calulate the used carry parts ceil(A/(50 * b))
 *
 *	Can be used to calculate the fatigue costs for this creep or some other little thingies like path matrix
 *
 *	TODO: not sure how it works with partial boosting if this is a thing someday
 */
// Creep.prototype.getUsedCarryParts = function()
// {
// 	return _.ceil(_.sum(this.carry)/(CARRY_CAPACITY * _.get(BOOSTS,[CARRY,_.find(_.pluck(_.filter(this.body,(i) => i.type == CARRY && !!i.boost),'boost')),'capacity'],1)));
// }

Creep.prototype.getUsedCarryParts = function() {
	var i, cap, part, body = this.body;
	var amount = _.sum(this.carry);
	var count=0;
	for(i = body.length-1; i>=0; i--) {
		var {hits,boost,type} = body[i];
		if(hits <= 0 || amount <= 0)
			break;
		if(type !== CARRY)
			continue;
		if(!boost)
			cap = CARRY_CAPACITY;
		else
			cap = CARRY_CAPACITY * BOOSTS[CARRY][boost];
		amount -= cap;
		count++;
	}
	return count;
}




Creep.prototype.getFatigueCost = function()
{
	Log(LOG_LEVEL.debug,'name: '+this.name+' aLoad: '+this.getUsedCarryParts());
}


/**
 * Similar to getTarget, but ensures no other creep is assigned to this target.
 *
 * @param function selector - Gets a list of target candidates
 * @param function restrictor - The function used to ensure no other creep has this target selected
 * @param function validator - Check if a target is still valid
 * @param function chooser - Pick the best target from the list
 * @param string prop - Property name in memory to store the target id
 */
Creep.prototype.getUniqueTarget = function(selector, restrictor, validator=_.identity, chooser=_.first, prop='tid')
{
	let tid = this.memory[prop];
	let target = Game.getObjectById(tid);
	if(target == null || !validator(target))
    {
		delete this.memory[prop];
		let candidates = _.filter(selector.call(this,this), x => validator(x) && restrictor(x));
		if(!_.isEmpty(candidates))
        {
			target = chooser(candidates);
        }
		if(target)
        {
			this.memory[prop] = target.id;
        }
		// console.log(`New target on tick ${Game.time}: ${target}`);
	}
	return target;
}

Creep.prototype.clearTarget = function(prop='tid')
{
	delete this.memory[prop];
}

Creep.prototype.getRepairTarget = function()
{
	return this.getTarget(
		({room,pos}) => room.find(FIND_STRUCTURES),
		(structure) => structure.hits < structure.hitsMax,
		(candidates) => _.min(candidates, 'hits')
	);
}

Creep.prototype.init = function(pProxy)
{
    //Log(LOG_LEVEL.debug,'RoomObject: default init - '+this.entityType);
    pProxy.isMy = this.my;
	pProxy.bodySize = _.size(this.body);
	pProxy.spawnTime = this.bodySize * CREEP_SPAWN_TIME;
}



Creep.prototype.hasRole = function(pRole)
{
	return this.memory.role == pRole;
}


Creep.prototype.getLoadedContainerTarget = function()
{
	return this.getTarget(
		({room,pos}) => room.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_CONTAINER}),
		(container) => _.sum(container.store) > 0,
		(containers) => _.max(containers, c => _.sum(container.store))
	)
}

Creep.prototype.canBuild = function()
{
	return this.getActiveBodyparts(WORK) > 0 && this.carryCapacity > 0;
}


extend = function()
{
    Object.defineProperties(Creep.prototype,
    {
		'bodySize':
		{
			configurable: true,
			get: function()
			{
				return _.size(this.body);
			},
		},
		'spawnTime':
		{
			configurable: true,
			get: function()
			{
				return this.bodySize * CREEP_SPAWN_TIME;
			},
		},
		'cost':
		{
			configurable: true,
			get: function()
			{
				return _.reduce(this.body, (result,aType) => { return result += BODYPART_COST[aType.type]; },0);
			},
		}
    });
};
extend();
