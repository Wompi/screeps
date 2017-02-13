/**
 * Cache.js
 */
'use strict';

let Cache = {};

/**
 *
 */
Object.defineProperty(Creep.prototype, "cache", {
	get: function() {
		if(this == undefined)
			return;
		if(!Cache.creeps)
			Cache.creeps = {};
		if(!Cache.creeps[this.name])
			Cache.creeps[this.name] = {};
		return Cache.creeps[this.name];

	},
	set: function(value) {
		if(!Cache.creeps[this.name])
			Cache.creeps[this.name] = {};
		Cache.creeps[this.name] = value;
	},
	configurable: true,
	enumerable: false
});

/**
 *
 */
Object.defineProperty(Structure.prototype, "cache", {
	get: function() {
		if(this == undefined)
			return;
		if(!Cache.structures)
			Cache.structures = {};
		if(!Cache.structures[this.id])
			Cache.structures[this.id] = {};
		return Cache.structures[this.id];

	},
	set: function(value) {
		if(!Cache.structures)
			Cache.structures = {};
		Cache.structures[this.id] = value;
	},
	configurable: true,
	enumerable: false
});

/**
 *
 */
Object.defineProperty(Room.prototype, "cache", {
	get: function() {
		if(this == undefined)
			return;
		if(!Cache.rooms)
			Cache.rooms = {};
		if(!Cache.rooms[this.name])
			Cache.rooms[this.name] = {};
		return Cache.rooms[this.name];

	},
	set: function(value) {
		if(!Cache.rooms)
			Cache.rooms = {};
		Cache.rooms[this.name] = value;
	},
	configurable: true,
	enumerable: false
});

Object.defineProperty(Flag.prototype, "cache", {
	get: function() {
		if(this == undefined)
			return;
		if(!Cache.flags)
			Cache.flags = {};
		if(!Cache.flags[this.name])
			Cache.flags[this.name] = {};
		return Cache.flags[this.name];

	},
	set: function(value) {
		if(!Cache.flags)
			Cache.flags = {};
		Cache.flags[this.name] = value;
	},
	configurable: true,
	enumerable: false
});


module.exports = Cache;
