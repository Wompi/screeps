/**
 * Replaces the prototype of the constructor with a class extending it.
 * This is currently the only way of defining a custom memory property and the only way of using RawMemory properly.
 *
 * To allow a more generic solution, this removes the check whether the object has an id and you're the owner
 * of the object. Therefor you can now even use memory for Creeps and Spawns you don't own.
 * Besides this the behaviour is the exact same as the default implementation.
 *
 * @see {@link https://github.com/screeps/engine/pull/7|Pull Request} fixing the issue
 *
 * @param cnstr - constructor to replace the prototype of
 * @param basePath - name of the memory section to use
 * @param identifier - property of the object to use as the memory key
 */
function fixMemoryProperty(cnstr, basePath, identifier = 'name') {
  const cls = class extends cnstr {
    get memory() {
      if (_.isUndefined(Memory[basePath]) || Memory[basePath] === 'undefined') {
        Memory[basePath] = {};
      }
      if (!_.isObject(Memory[basePath])) {
        return;
      }
      return Memory[basePath][this[identifier]] = Memory[basePath][this[identifier]] || {};
    }
    set memory(value) {
      if (_.isUndefined(Memory[basePath]) || Memory[basePath] === 'undefined') {
        Memory[basePath] = {};
      }
      if (!_.isObject(Memory[basePath])) {
        throw new Error(`Could not set ${basePath} memory`);
      }
      Memory[basePath][this[identifier]] = value;
    }
  };

  cnstr.prototype = cls.prototype;
}

fixMemoryProperty(Creep, 'creeps');
fixMemoryProperty(Room, 'rooms');
fixMemoryProperty(Flag, 'flags');
fixMemoryProperty(StructureSpawn, 'spawns');
