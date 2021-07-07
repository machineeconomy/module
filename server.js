const dotenv = require('dotenv');
dotenv.config();
const path = require('path');

const { router } = require('./src/WebServer.js')
const { database } = require('./src/DatabaseHandler.js')
const { initUpdate } = require('./src/UpdateHandler.js')
initUpdate();
const { createOrder, getOrderByUUID, getOrders } = require('./src/controllers/Orders.js')
const { socketServer } = require('./src/WebSockets.js')
const { fetchAndBroadcastBalanceFrom, handleOrder, getCurrentAddress } = require('./src/WebTangle.js')
const { log } = require('./src/Logger.js')
const { TLog } = require('./src/TangleLogger.js')
const { runJavascript, runPython, runShell, runRust } = require('./src/ScriptHandler.js')
const { getCurrentBalance, getCurrentIndex } = require('./src/Database.js')

const NAME = process.env.NAME
const IS_PROVIDER = process.env.IS_PROVIDER
const PROVIDER_URL = process.env.PROVIDER_URL

const swaggerUi = require('swagger-ui-express');
const openApiDocumentation = require('./openApiDocumentation');

const iotaCore = require('@iota/core')

// Local node to connect to;
const provider = process.env.IOTA_NODE;

const iota = iotaCore.composeAPI({
    provider: provider
})

require('./custom/index.js');

router.use('/api', swaggerUi.serve, swaggerUi.setup(openApiDocumentation));


router.post('/orders', function (request, response) {
    log("New incoming order... generate new address.")
    var body = request.body
    console.log("body: ", body)
    
    let address = handleOrder()

    let order = {
        address: address,
        data: JSON.stringify(request.body)  
    }

    createOrder(order)


    // Log it into MAM Channel
    TLog("new order")

    // send reponse with address.
    response.send(address)
});

router.get('/orders/:uuid', function (request, response) {
    log("Get order")
    console.log('Request Id:', request.params.uuid);
    getOrderByUUID(request.params.uuid).then(order => {
        console.log("show::order: ", order)
        response.send(order)
    })
});

router.get('/orders/', function (request, response) {
    log("List all order")
    getOrders().then(orders => {
        console.log("index::orders: ", orders)
        response.send(orders)
    })
});

router.get('/get_account_data/', function (request, response) {
    iota.getAccountData(process.env.SEED, {
        start: 0,
        security: 2
    })
        .then(accountData => {
            const { addresses, inputs, transactions, balance } = accountData
            // ...
            response.send(accountData)
        })
        .catch(err => {
            // ...
        })
});

router.post('/hello_shell', function (request, response) {
    runShell().then((result) => {
        response.send(result)
    }, (error) => {
        console.log("err", error)
        response.send(error)
    });
});

router.post('/hello_python', function (request, response) {
    runPython().then((result) => {
        response.send(result)
    }, (error) => {
        response.send(error)
    });

});

router.post('/hello_javascript', function (request, response) {
    runJavascript().then((result) => {
        response.send(result)
    }, (error) => {
        response.send(error)
    });
});

router.post('/hello_rust', function (request, response) {
    runRust().then((result) => {
        response.send(result)
    }, (error) => {
        response.send(error)
    });
});

socketServer.on('connection', function (socket) {
    log(`User '${socket.id}' connected`);
    let object = {
        name: NAME,
        status: status
    }
    socketServer.emit('init', object);
    fetchAndBroadcastBalanceFrom(getCurrentAddress());
});





log(`Machine ${NAME} is booting.`)
log(`Machine is a ${IS_PROVIDER == "true" ? 'provider' : 'robot'}.`)
log(`Machine provider: ${PROVIDER_URL ? PROVIDER_URL : 'none'}`)