class LinkOperation
{
    constructor(pRoom,pLinks)
    {
        this.mRoom = pRoom;
        this.mLinks = pLinks;

        this.mProvider = [];
        this.mReceiver = [];

        // TODO: hell this is bad put this on the init function of link and do this only once in a while
        _.each(this.mLinks, (aLink) =>
        {
            let aSource = _.find(PCache.getEntityCache(ENTITY_TYPES.source), (aSource) => aSource.pos.inRangeTo(aLink,2));

            if (!_.isUndefined(aSource))
            {
                this.mProvider.push(aLink);
            }
            else
            {
                this.mReceiver.push(aLink);
            }
        })
    }

    processOperation()
    {
        this.log(LOG_LEVEL.error,'processOperation() links: '+this.mLinks.length+' provider: '+this.mProvider.length+' receiver: '+this.mReceiver.length);

        _.each(this.mProvider, (aProvider) =>
        {
            _.each(this.mReceiver, (aReceiver) =>
            {
                 if (aProvider.cooldown == 0 && aProvider.getStatus().status == FILL_STATUS.isFull && aReceiver.getStatus().status == FILL_STATUS.isEmpty)
                 {
                     var res = aProvider.transferEnergy(aReceiver.entity);
                     this.log(LOG_LEVEL.debug,'provider link '+aProvider.pos.toString()+' transfers energy to '+aReceiver.pos.toString()+' ... res: '+ErrorString(res));
                 }
            })
        });
    }

    log(pLevel,pMsg)
    {
        Log(pLevel,'LinkOperation: '+this.mRoom.name+': '+pMsg);
    }
}
module.exports = LinkOperation;
