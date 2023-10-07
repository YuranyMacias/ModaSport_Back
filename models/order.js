const { Schema, model } = require("mongoose");

const OrderSchema = Schema({
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    payment: {
        type: Schema.Types.ObjectId,
        ref: 'Payment'
    },
    coupon: {
        type: Schema.Types.ObjectId,
        ref: 'Coupon'
    },
    couponDiscount: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    totalWithoutCoupon: {
        type: Schema.Types.Decimal128,
        default: 0
    },
    totalCouponDiscount: {
        type: Schema.Types.Decimal128,
        default: 0
    },
    total: {
        type: Schema.Types.Decimal128,
        default: 0
    },
    status: {
        type: Boolean,
        default: true,
        required: true
    }
}, { timestamps: true });

OrderSchema.methods.toJSON = function () {
    const { __v, status, total, totalCouponDiscount, totalWithoutCoupon, ...data } = this.toObject();
    const totalOrder = (total && total > 0) ? parseFloat(total) : (totalWithoutCoupon) ? parseFloat(totalWithoutCoupon) : 0;
    return {
        total: totalOrder,
        totalCouponDiscount: (totalCouponDiscount) ? parseFloat(totalCouponDiscount) : 0,
        totalWithoutCoupon: (totalWithoutCoupon) ? parseFloat(totalWithoutCoupon) : 0,
        ...data
    };
}

module.exports = model('Order', OrderSchema);