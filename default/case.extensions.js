var mod =
{
    extend: function()
    {
        require('prototype.Room').extend();
        require('prototype.StructureExtension').extend();
        require('prototype.Creep').extend();
        require('prototype.Source').extend();
        require('prototype.Resource').extend();
        require('prototype.ConstructionSite').extend();
        require('prototype.StructureSpawn').extend();
        require('prototype.StructureTower').extend();
        require('prototype.StructureContainer').extend();
        require('prototype.Flag').extend();
        require('prototype.StructureLink').extend();
        require('prototype.StructureLab').extend();
        require('prototype.Structure').extend();
        require('prototype.StructureRoad').extend();
        require('prototype.Mineral').extend();
        require('prototype.StructureController').extend();
        require('prototype.StructureStorage').extend();
        require('prototype.StructureExtractor').extend();
        require('prototype.StructureTerminal').extend();
        require('prototype.RoomPosition').extend();
    }
};
module.exports = mod;
