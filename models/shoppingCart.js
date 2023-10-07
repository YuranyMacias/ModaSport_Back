const { Schema, model } = require("mongoose");

const ShoppingCartSchema = Schema({
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    coupon: {
        type: Schema.Types.ObjectId,
        ref: 'Coupon'
    },
    couponDiscount: {
        type: Number,
        default: 0
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

ShoppingCartSchema.methods.toJSON = function () {
    const { __v, status, total, totalCouponDiscount, totalWithoutCoupon, ...data } = this.toObject();
    const totalShoppingCart = (total && total > 0) ? parseFloat(total) : (totalWithoutCoupon) ? parseFloat(totalWithoutCoupon) : 0;
    return {
        total: totalShoppingCart,
        totalCouponDiscount: (totalCouponDiscount) ? parseFloat(totalCouponDiscount) : 0,
        totalWithoutCoupon: (totalWithoutCoupon) ? parseFloat(totalWithoutCoupon) : 0,
        ...data
    };
}

module.exports = model('ShoppingCart', ShoppingCartSchema);