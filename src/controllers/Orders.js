
var mongoose = require('mongoose');
const uuid = require('uuid/v4');
const { runCustomPaymentScript } = require('../../custom/index.js');

const should_balance = 0;
const CUSTOM_SCRIPT = process.env.CUSTOM_SCRIPT

const iotaCore = require('@iota/core')

// Local node to connect to;
const provider = process.env.IOTA_NODE;

const iota = iotaCore.composeAPI({
    provider: provider
})

// Define schema
var Schema = mongoose.Schema;

var OrderSchema = new Schema({
    uuid: String,
    data: String,
    status: Number,
    created: { type: Date, default: Date.now() },
    _someId: Schema.Types.ObjectId,
    address: String
});

// Compile model from schema
var Order = mongoose.model('Order', OrderSchema);

const createOrder = (order) => {

    console.log("create order")
    order.uuid = uuid();
    order.status = 0;
    // Create an instance of model SomeModel
    var new_order = new Order(order);

    // Save the new model instance, passing a callback
    new_order.save(function (err) {
        if (err) return handleError(err);
        // saved!
    });
}

const getOrderByUUID = (uuid) => {
    return new Promise(function (resolve, reject) {
        // find all athletes who play tennis, selecting the 'name' and 'age' fields
        Order.findOne({ 'uuid': uuid }, function (err, order) {
            if (err) return handleError(err);
            // 'athletes' contains the list of athletes that match the criteria.
            console.log("order", order)
            resolve(order);

        })
    });
}

const getOrders = () => {
    return new Promise(function (resolve, reject) {
        Order.find({}, function (err, orders) {
            if (err) return handleError(err);
            // 'athletes' contains the list of athletes that match the criteria.
            console.log("orders", orders)
            resolve(orders);

        })
    });

}

const getOpenOrders = () => {
    return new Promise(function (resolve, reject) {
        Order.find({ status: 0 }, function (err, orders) {
            if (err) return handleError(err);
            resolve(orders);
        })
    });

}

const checkStatus = (order) => {
    console.log("check status for", order.uuid)
        // check balance
    iota.getBalances([order.address], 100)
            .then(({ balances }) => {
                console.log("blanace", balances)
                console.log("blanace", balances)
                if (balances[0] && balances[0] >= should_balance) {
                    // set status to payed = 2
                    console.log("payed!")
                    setPayed(order, balances[0])
                } else {
                    // watch for new incoming transactions
                    console.log("not payed!")

                }
            })
            .catch(err => {
                // handle error
                console.log("error getBalances: ", err);

            })

}

const setPayed = (order, amount) => {

    console.log("order id", order.id)
    Order.findByIdAndUpdate(
        // the id of the item to find
        order.id,

        // the change to be made. Mongoose will smartly combine your existing 
        // document with this change, which allows for partial updates too
        {status: 1},

        // an option that asks mongoose to return the updated version 
        // of the document instead of the pre-updated one.
        { new: false },

        // the callback function
        (err, updated_order) => {
            // Handle any possible database errors
            if (err) console.log("error", err);
            console.log("success", updated_order)

            // run customPaymentScript()
            if(CUSTOM_SCRIPT) {
                runCustomPaymentScript(updated_order, amount);
            }
        }
    )
}



module.exports = {
    createOrder,
    getOrderByUUID,
    getOrders,
    getOpenOrders,
    checkStatus
}