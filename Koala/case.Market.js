class Market
{
    constructor()
    {

    }

    send(pStartRoomName,pEndRoomName,pType,pAmount,pDescription = 'default transfer')
    {
        var aStartRoom = Game.rooms[pStartRoomName];
        var aStartTerminal = aStartRoom.terminal;

        var aTransactionCost = Game.market.calcTransactionCost(aStartTerminal.store[pType],pStartRoomName,pEndRoomName);

        if (aTransactionCost > aStartTerminal.store[RESOURCE_ENERGY])
        {
            Log(LOG_LEVEL.debug,'Terminal has not enough ENERGY -> ['+aTransactionCost+'/'+aStartTerminal.store[RESOURCE_ENERGY]);
            return;
        }


        var result = aStartTerminal.send(pType, pAmount, pEndRoomName, pDescription);
        Log(LOG_LEVEL.debug,'Transfer '+pStartRoomName+' -> '+pEndRoomName+' type: '+pType+' amount: '+pAmount+' cost: '+aTransactionCost+' result: '+ErrorSting(result));
    }


    deal(pRoomName,pID,pAmount)
    {
        var result = Game.market.deal(pID,pAmount,pRoomName);
        Log(LOG_LEVEL.debug,'Deal closed ... '+ErrorSting(result));
    }

    printMarketReport()
    {
        var ROOM_NAME = 'W67S74';

        var aReport = [];
        var aHeader = ['ID','TYPE','ROOM','RANGE','PRICE','AMOUNT','COST','CREDITS','DERP'];
        for (var aID in Memory.market)
        {
            var aRoom = Memory.market[aID].roomName;
            var aAmount = Memory.market[aID].amount;
            var aPrice = Memory.market[aID].price;
            var aType = Memory.market[aID].resourceType;
            var aCost = Game.market.calcTransactionCost(aAmount,ROOM_NAME,aRoom);
            var aRange = Game.map.getRoomLinearDistance(ROOM_NAME,aRoom,true);
            var aMargin = (aAmount * aPrice);

            var derp = aMargin / (aAmount + aCost);

            aReport[aReport.length] = [aID,aType,aRoom,aRange,aPrice,aAmount,aCost,aMargin.toFixed(2),derp.toFixed(3)];



            //logERROR('ID: '+aID+'\tTYPE: '+aType+'\tROOM: '+aRoom+'\tRANGE: '+aRange+'\tPRICE: '+aPrice+'\tAMOUNT: '+aAmount+'\tCOST: '+aCost+'\tCREDITS: '+aMargin.toFixed(2)+'\tDERP: '+derp.toFixed(2));
        }

        //Log(LOG_LEVEL.debug,JS(aReport));

        aReport = _.sortBy(aReport, (aSet) => aSet[8]);

        var aTable = this.table(aHeader,aReport);
        Log(LOG_LEVEL.debug,aTable);
    }


    printSellMarketReport()
    {
        var ROOM_NAME = 'W47N84';

        var aReport = [];
        var aHeader = ['ID','TYPE','ROOM','RANGE','PRICE','AMOUNT','COST','CREDITS TO PAY','DERP'];
        for (var aID in Memory.sellMarket)
        {
            var aRoom = Memory.sellMarket[aID].roomName;
            var aAmount = Memory.sellMarket[aID].amount;
            var aPrice = Memory.sellMarket[aID].price;
            var aType = Memory.sellMarket[aID].resourceType;
            var aCost = Game.market.calcTransactionCost(aAmount,ROOM_NAME,aRoom);
            var aRange = Game.map.getRoomLinearDistance(ROOM_NAME,aRoom,true);
            var aMargin = (aAmount * aPrice);

            var derp = aMargin / (aAmount + aCost);

            aReport[aReport.length] = [aID,aType,aRoom,aRange,aPrice,aAmount,aCost,aMargin.toFixed(2),derp.toFixed(3)];



            //logERROR('ID: '+aID+'\tTYPE: '+aType+'\tROOM: '+aRoom+'\tRANGE: '+aRange+'\tPRICE: '+aPrice+'\tAMOUNT: '+aAmount+'\tCOST: '+aCost+'\tCREDITS: '+aMargin.toFixed(2)+'\tDERP: '+derp.toFixed(2));
        }

        //Log(LOG_LEVEL.debug,JS(aReport));

        aReport = _.sortBy(aReport, (aSet) => aSet[8]);

        var aTable = this.table(aHeader,aReport);
        Log(LOG_LEVEL.debug,aTable);
    }





    fetchSell(pResourceType)
    {
        var myOrders = Game.market.getAllOrders(
        {
            type: ORDER_SELL,
            resourceType: pResourceType,
        });
        delete Memory.sellMarket;

        if (myOrders.length == 0)
        {
            Log(LOG_LEVEL.error,'No market orders in range!');
            return;
        }
        else
        {
            Log(LOG_LEVEL.debug,'ORDERS: length - '+myOrders.length);
        }

        if (_.isUndefined(Memory.sellMarket))
        {
            Memory.sellMarket = {};
        }

        for (var aOrder of myOrders)
        {
            Memory.sellMarket[aOrder.id] = aOrder;
        }

        Log(LOG_LEVEL.debug,'Ready .. check Memory.market');

        this.printSellMarketReport();
    }


    fetch(pIndex)
    {
        var myResourceTypes =
        [
            RESOURCE_ENERGY,
            RESOURCE_ZYNTHIUM,
            RESOURCE_UTRIUM,
            RESOURCE_OXYGEN,
            RESOURCE_HYDROGEN,
            RESOURCE_KEANIUM,
            'UH',
        ]

        if (_.isUndefined(pIndex) || pIndex > (myResourceTypes.length-1))
        {
            Log(LOG_LEVEL.debug,'RESOURCES: '+JSON.stringify(myResourceTypes));
            return;
        }

        var aResourceType = myResourceTypes[pIndex];
        delete Memory.market;


        var myOrders = Game.market.getAllOrders(
        {
            type: ORDER_BUY,
            resourceType: aResourceType,
        });


        if (myOrders.length == 0)
        {
            Log(LOG_LEVEL.error,'No market orders in range!');
            return;
        }
        else
        {
            Log(LOG_LEVEL.debug,'ORDERS: length - '+myOrders.length);
        }


        if (_.isUndefined(Memory.market))
        {
            Memory.market = {};
        }

        for (var aOrder of myOrders)
        {
            Memory.market[aOrder.id] = aOrder;
        }

        Log(LOG_LEVEL.debug,'Ready .. check Memory.market');

        this.printMarketReport();


        // var myOrders = Game.market.getAllOrders();
        //
        //
        //
        //
        //
        //
        // var myNames = [];
        // for (var aOrder of myOrders)
        // {
        //     //var aDist = Game.map.getRoomLinearDistance('E66N49',aOrder.roomName);
        //     if (aOrder.type == 'buy')
        //     {
        //         //logERROR('DIST: ' +aOrder.roomName+' '+aDist );
        //         logERROR(JSON.stringify(aOrder));
        //     }
        //
        //     // if (Game.map.getRoomLinearDistance('E66N49',aOrder.roomName) < range)
        //     // {
        //     //     logERROR(JSON.stringify(aOrder));
        //     // }
        //     // else
        //     // {
        //     //     myNames.push(aOrder.roomName);
        //     // }
        // }
        // logERROR('ORDERS: '+JSON.stringify(myNames));
    }


    table(headers, rows) {

        let msg = '<table>';
        _.each(headers, h => msg += '<th width="90px">' + h + '</th>');
        _.each(rows, row =>  msg += '<tr>' + _.map(row, el => (`<th>${el}</th>`)) + '</tr>');
        msg += '</table>'
        // console.log(msg);
        return msg;
    }
}
module.exports = Market;
