class Body extends Array
{
	/** override push to limit size */
	push(part) {
		if(this.length >= MAX_CREEP_SIZE)
			throw new Error('Creep body is limited to ' + MAX_CREEP_SIZE + ' parts');
		return super.push(part);
	}

	/** override fill to limit size */
	fill(value, start=0, end=this.length) {
		return super.fill(value, start, Math.min(MAX_CREEP_SIZE, end));
	}

	/** override unshift to limit size */
	unshift(...args) {
		if(args.length + this.length > MAX_CREEP_SIZE)
			throw new Error('Creep body is limited to ' + MAX_CREEP_SIZE + ' parts');
		return super.unshift.apply(this, args);
	}

	concat(...args) {
		return super.concat.apply(this, args);
	}

	cost() {
		return _.sum(this, p => BODYPART_COST[p]);
	}

	ticks() {
		return this.length * CREEP_SPAWN_TIME;
	}

	getCounts() {
		return _.countBy(this);
	}

	sort() {
		return _.sortBy(this, p => _.indexOf([TOUGH,MOVE,WORK,CARRY,ATTACK,RANGED_ATTACK,HEAL,CLAIM],p));
	}
}
