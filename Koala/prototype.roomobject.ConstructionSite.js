

ConstructionSite.prototype.getEntityEvents = function()
{
    return {
        currentEntity: () => Game.getObjectById(this.id),
        /**
         *  NOTE: a site can be invalid for multiple reasons - check if the site is my! We dont want to build enemy sites
         *      - most likely it is finished -> the resulting structure should be registered
         *      - I simply removed the site with the gui -> just delete it then
         *      - I lost visibility of the room where the site was in -> hmm do nothing I suppose
         *      - a hostile creep run over the site and deleted it -> this one is tricky because it would be hard to
         *         detect I guess
         *          o if the site had already progress maybe check for resources on the ground?
         *          o check the position of the hostile and if it fits to this site - well rebuild it (this one)
         *             is hard for the caache because it can be that the update comes way later than the event happend
         *             so it can not check the hostile position for the check. Though on of the nodes has the position for it
         *             if no tick is missed is this
         *      - the site was hostile an I run over it - delete the site when you run over it (also tricky for later nodes)
         */
        onInvalid: (pLastUpdate,pProxy) =>
        {
            Log(LOG_LEVEL.debug,'ConstructionSite onInvalid()');
            if (!pProxy.isMy) return INVALID_ACTION.delete;
            let aType = pProxy.structureType;

            let aRoom = Game.rooms[pProxy.pos.roomName];
            if (_.isUndefined(aRoom))
            {
                // hmm what to do :( .. I lost visibility of the room so the site is probaly ok and should stay in the cache
                return INVALID_ACTION.none;
            }

            let myLook = aRoom.lookForAt(LOOK_STRUCTURES, pProxy.pos.x, pProxy.pos.y);

            Log(LOG_LEVEL.debug,'ConstructionSite: getEntityEvents().onInvalid() - '+JS(myLook));

            let aStructure = _.find(myLook,(aLook) => aLook.structureType == aType);
            if (!_.isUndefined(aStructure))
            {
                Log(LOG_LEVEL.debug,'ConstructionSite onInvalid() - new structure '+JS(aStructure));
                PCache.addEntity(Game.getObjectById(aStructure.id));
                return INVALID_ACTION.delete;
            }


            // default is delete - not sure about this
            return INVALID_ACTION.delete; // none for test purposes
        },
    };
}

ConstructionSite.prototype.init = function(pProxy)
{
    Log(LOG_LEVEL.debug,'ConstructionSite: default init - '+this.entityType);
    pProxy.isMy = this.my;
}
