const { Schema, model } = require("mongoose");

const ProductSchema = Schema({
    name: {
        type: String,
        require: [true, 'El nombre es obligatorio. '],
        unique: true
    },
    description: {
        type: String,
        require: [true, 'La descripcion es obligatoria. '],
    },
    price: {
        type: Schema.Types.Decimal128,
        default: 0
    },
    stock: {
        type: Number,
        default: 0
    },
    reference: {
        type: String,
        require: [true, 'La referencia  es obligatoria. ']
    },
    available: {
        type: Boolean,
        default: true
    },
    images: {
        type: [String],
        default: []
    },
    sizes: {
        type: [String],
        require: [true, 'La talla  es obligatoria. ']
    },
    colors: {
        type: [String],
        require: [true, 'El color es obligatorio. ']
    },
    discount: {
        type: Number,
        default: 0
    },
    brand: {
        type: String,
        require: [true, 'La marca es obligatoria. ']
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    gender: {
        type: Schema.Types.ObjectId,
        ref: 'Gender',
        required: true
    },
    season: {
        type: Schema.Types.ObjectId,
        ref: 'Season',
        required: true
    },
    status: {
        type: Boolean,
        default: true,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { timestamps: true });

ProductSchema.methods.toJSON = function () {
    const { __v, status, price, ...data } = this.toObject();
    return {
        price: (price) ? parseFloat(price) : 0,
        ...data,
    };
}


module.exports = model('Product', ProductSchema);