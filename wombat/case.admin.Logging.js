class Logging
{
    constructor(pLevel,pMsg)
    {
        this.log(pLevel,pMsg);
    }

    log(pLevel,pLogMsg)
    {
        var msg = '';
        if (pLevel == WARN)
        {
            msg = '<font style="color:#E6DE99">' + pLogMsg + '</font>'
        }
        else
        {
            var msg = '<font style="color:#4C71D6">' + pLogMsg + '</font>';
        }
        console.log(msg);
    }
}
module.exports = Logging;
