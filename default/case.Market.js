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
            logDERP('Terminal has not enough ENERGY -> ['+aTransactionCost+'/'+aStartTerminal.store[RESOURCE_ENERGY]);
            return;
        }


        var result = aStartTerminal.send(pType, pAmount, pEndRoomName, pDescription);
        logDERP('Transfer '+pStartRoomName+' -> '+pEndRoomName+' type: '+pType+' amount: '+pAmount+' cost: '+aTransactionCost+' result: '+ErrorSting(result));
    }


    deal(pRoomName,pID,pAmount)
    {
        var result = Game.market.deal(pID,pAmount,pRoomName);
        logDERP('Deal closed ... '+ErrorSting(result));
    }

    printMarketReport()
    {
        var aReport = [];
        var aHeader = ['ID','TYPE','ROOM','RANGE','PRICE','AMOUNT','COST','CREDITS','DERP'];
        for (var aID in Memory.market)
        {
            var aRoom = Memory.market[aID].roomName;
            var aAmount = Memory.market[aID].amount;
            var aPrice = Memory.market[aID].price;
            var aType = Memory.market[aID].resourceType;
            var aCost = Game.market.calcTransactionCost(aAmount,'E66N49',aRoom);
            var aRange = Game.map.getRoomLinearDistance('E66N49',aRoom,true);
            var aMargin = (aAmount * aPrice);

            var derp = aMargin / (aAmount + aCost);

            aReport[aReport.length] = [aID,aType,aRoom,aRange,aPrice,aAmount,aCost,aMargin.toFixed(2),derp.toFixed(3)];

            //logERROR('ID: '+aID+'\tTYPE: '+aType+'\tROOM: '+aRoom+'\tRANGE: '+aRange+'\tPRICE: '+aPrice+'\tAMOUNT: '+aAmount+'\tCOST: '+aCost+'\tCREDITS: '+aMargin.toFixed(2)+'\tDERP: '+derp.toFixed(2));
        }


        var aTable = Test.table(aHeader,aReport);
        logDERP(aTable);
    }

    fetch(pIndex)
    {
        var myResourceTypes =
        [
            RESOURCE_ENERGY,
            RESOURCE_ZYNTHIUM,
            RESOURCE_UTRIUM,
            RESOURCE_OXYGEN,
        ]

        if (_.isUndefined(pIndex) || pIndex > (myResourceTypes.length-1))
        {
            logDERP('RESOURCES: '+JSON.stringify(myResourceTypes));
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
            logERROR('No market orders in range!');
            return;
        }
        else
        {
            logERROR('ORDERS: length - '+myOrders.length);
        }


        if (_.isUndefined(Memory.market))
        {
            Memory.market = {};
        }

        for (var aOrder of myOrders)
        {
            Memory.market[aOrder.id] = aOrder;
        }

        logERROR('Ready .. check Memory.market');

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

}
module.exports = Market;
