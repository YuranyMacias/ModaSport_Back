const { Schema, model } = require("mongoose");

const CouponSchema = Schema({
    code: {
        type: String,
        require: [true, 'El código es obligatorio.'],
        unique: true 
    },
    discount: {
        type: Number,
        require: [true, 'El descuento es obligatorio.']
    },
    expirationDate: {
        type: Date,
        require: [true, 'La fecha de expiración del cupón es obligatoria.'],
        default: Date.now
    },
    uses: {
        type: Number,
        default: 0
    },
    maxUses: {
        type: Number,
        require: [true, 'El número máximo de usos es obligatorio.'],
        default: 1
    },
    redeemedBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

CouponSchema.methods.toJSON = function () {
    const { __v, ...data } = this.toObject();
    return data;
}

module.exports = model('Coupon', CouponSchema);