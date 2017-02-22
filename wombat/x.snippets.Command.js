/**
 *
 */
'use strict';

class Command
{
	static getLimit() {
		// return Game.cpu.limit;
		return Game.cpu.tickLimit;
	}

	/** */
	static tick() {
		if(Game.cpu.getUsed() > this.getLimit()) //or tickLimit - threshold if you want to run more per turn.
			return;

		if(!Memory.command)
			return;

		while( (Game.cpu.getUsed() + 10 < this.getLimit()) && Memory.command.length ) {
			let cmd = Memory.command.shift();
			let r = eval(cmd);
			console.log('[COMMAND] Result: ' + r);
		}

		if(Memory.command.length === 0)
			delete Memory.command;
	}

	// _(Game.flags).filter({color: COLOR_BLUE}).map('name').each(name => Command.push("Game.flags['" + name + "'].remove()"))
	static push(cmd) {
		if(!Memory.command)
			Memory.command = [];
		Memory.command.push(cmd);
	}

	static clear() {
		delete Memory.command;
	}
}

module.exports = Command;
