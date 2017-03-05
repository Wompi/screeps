class MemoryManager
{
    constructor()
    {

    }

    getEnsured(pRoot, pMemPath,pMemDefault = undefined)
	{
		var aGet = _.get(pRoot,pMemPath);
		if (_.isUndefined(aGet) && !_.isUndefined(pMemDefault))
		{
			_.set(pRoot,pMemPath,pMemDefault);
            aGet = pMemDefault;
		}
		return aGet;
	}
}
module.exports = MemoryManager;
