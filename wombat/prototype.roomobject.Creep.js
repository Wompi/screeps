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
