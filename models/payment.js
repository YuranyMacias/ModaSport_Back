const { Schema, model } = require("mongoose");

const PaymentSchema = Schema({
    type: {
        type: String,
        enum: ['cash', 'card', 'paypal'],
        required: true 
    },
    isPaid: { 
        type: Boolean, 
        default: false 
    },
    status: {
        type: Boolean,
        default: true,
        required: true
    }
}, { timestamps: true });

PaymentSchema.methods.toJSON = function () {
    const { __v, ...data } = this.toObject();
    return data;
}

module.exports = model('Payment', PaymentSchema);