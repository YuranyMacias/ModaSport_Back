const { Schema, model } = require("mongoose");

const BalancePaymentSchema = Schema({
    amount: {
        type: Schema.Types.Decimal128,
        require: [true, 'El monto del pago es obligatoria']
    },
    currency: {
        type: String,
        enum: ['COP', 'USD'],
        default: 'COP'
    },
    status: {
        type: Boolean,
        default: true,
        required: true
    }
});


BalancePaymentSchema.methods.toJSON = function () {
    const { __v, status, amount, ...data } = this.toObject();
    return {
        amount: (amount) ? parseFloat(amount) : 0,
        ...data,
    };
}


module.exports = model('BalancePayment', BalancePaymentSchema);