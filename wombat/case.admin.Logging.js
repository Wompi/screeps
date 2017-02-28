class Logging
{
    constructor(pLevel,pMsg)
    {
        this.log(pLevel,pMsg);
    }

    log(pLevel,pLogMsg)
    {
        var msg = '';
        if (pLevel == LOG_LEVEL.warn)
        {
            msg = '<font style="color:#E6DE99">WARN: ' + pLogMsg + '</font>'
        }
        else if (pLevel == LOG_LEVEL.profile)
        {
            msg = '<font style="color:#D98424">PROFILE: ' + pLogMsg + '</font>';
        }
        else if (pLevel == LOG_LEVEL.error)
        {
            msg = '<font style="color:#D98424">ERROR: ' + pLogMsg + '</font>';
        }
        else if (pLevel == LOG_LEVEL.info)
        {
            msg = '<font style="color:#559C22">INFO: ' + pLogMsg + '</font>';
        }
        else if (pLevel == LOG_LEVEL.debug)
        {
            msg = '<font style="color:#757776;font-size:10px">DEBUG: ' + pLogMsg + '</font>';
        }
        else
        {
            msg = '<font style="color:#4C71D6;font-size:10px">UNDEFINED: ' + pLogMsg + '</font>';
        }

        if (_.isUndefined(pLevel) || LOG_STATE[pLevel])
        {
            console.log(msg);
        }
    }
}
module.exports = Logging;
