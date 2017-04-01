class StorageClassifier
{
    constructor()
    {
        this.mStorages = undefined;

    }

    classifyStorages()
    {
        this.mStorages = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.container), (a) => _.isUndefined(a.storeType));
        //Log(LOG_LEVEL.debug,'StoreType: '+this.mStorages.length);

        if (this.mStorages.length == 0) return;
        this.checkForMiningType();
        this.checkForMineralType();
        this.checkForReactionType();
        this.checkForExtensionBay();
    }

    getStorageType(pBox)
    {
        if (_.isUndefined(pBox.store)) return;
    }

    checkForMiningType()
    {
        let mySources = PCache.getFriendlyEntityCache(ENTITY_TYPES.source);

        _.each(this.mStorages, (aStorage,aIndex) =>
        {
            let aSource = _.find(mySources, (a) => a.pos.isNearTo(aStorage));
            if (!_.isUndefined(aSource))
            {
                aStorage.storeType = STORE_TYPE.storeTypeMining;
                this.mStorages[aIndex] = undefined;
                // Log(LOG_LEVEL.debug,'StoreType: '+STORE_TYPE.storeTypeMining+' Box: '+aStorage.pos.toString());
            }
        });
        _.remove(this.mStorages, (a) => _.isUndefined(a));
    }

    checkForMineralType()
    {
        let myExtractors = PCache.getFriendlyEntityCache(ENTITY_TYPES.extractor);

        _.each(this.mStorages, (aStorage,aIndex) =>
        {
            let aExtractor = _.find(myExtractors, (a) => a.pos.isNearTo(aStorage));
            if (!_.isUndefined(aExtractor))
            {
                aStorage.storeType = STORE_TYPE.storeTypeMineral;
                this.mStorages[aIndex] = undefined;
                // Log(LOG_LEVEL.debug,'StoreType: '+STORE_TYPE.storeTypeMineral+' Box: '+aStorage.pos.toString());
            }
        });
        _.remove(this.mStorages, (a) => _.isUndefined(a));
    }

    checkForReactionType()
    {
        let myLabs = PCache.getFriendlyEntityCache(ENTITY_TYPES.lab);

        _.each(this.mStorages, (aStorage,aIndex) =>
        {
            let aLab = _.find(myLabs, (a) => a.pos.isNearTo(aStorage));
            if (!_.isUndefined(aLab))
            {
                aStorage.storeType = STORE_TYPE.storeTypeReaction;
                this.mStorages[aIndex] = undefined;
                // Log(LOG_LEVEL.debug,'StoreType: '+STORE_TYPE.storeTypeReaction+' Box: '+aStorage.pos.toString());
            }
        });
        _.remove(this.mStorages, (a) => _.isUndefined(a));
    }

    checkForExtensionBay()
    {
        let myBays = _.filter(PCache.getFriendlyEntityCache(ENTITY_TYPES.flag),FLAG_TYPE.extensionBay);
        _.each(this.mStorages, (aStorage,aIndex) =>
        {
            let aBay = _.find(myBays, (a) => a.pos.isNearTo(aStorage));
            if (!_.isUndefined(aBay))
            {
                aStorage.storeType = STORE_TYPE.storeTypeExtensionBay;
                this.mStorages[aIndex] = undefined;
                // Log(LOG_LEVEL.debug,'StoreType: '+STORE_TYPE.storeTypeExtensionBay+' Box: '+aStorage.pos.toString());
            }
        });
        _.remove(this.mStorages, (a) => _.isUndefined(a));
    }

    visualizeStoreType(pBox)
    {
        let aVisual = new RoomVisual(pBox.pos.roomName);

        let aType = pBox.storeType;

        let myColors =
        {
            [STORE_TYPE.storeTypeMining]: COLOR.yellow,
            [STORE_TYPE.storeTypeMineral]: COLOR.blue,
            [STORE_TYPE.storeTypeReaction]: COLOR.red,
            [STORE_TYPE.storeTypeExtensionBay]: COLOR.green,
            undefined: COLOR.white,
        };
    //    Log(LOG_LEVEL.debug,'StoreType: '+aType+' Box: '+pBox.pos.toString());
        aVisual.rect(pBox.pos.x - 0.6, pBox.pos.y - 0.6,1.2,1.2, {fill: 'transparent', stroke: myColors[aType]});
    }
}
module.exports = StorageClassifier;
