const { Schema, model } = require("mongoose");

const PaymentSchema = Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    type: {
        type: String,
        enum: ['balance', 'card', 'paypal'],
        required: true 
    },
    paymentDetails: { 
        type: Schema.Types.ObjectId, 
        // required: true 
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