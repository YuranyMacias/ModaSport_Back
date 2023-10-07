const { Schema, model } = require('mongoose');

const UserSchema = Schema({
    name: {
        type: String,
        require: [true, 'El nombre es obligatorio. '],
    },
    lastname: {
        type: String,
        require: [true, 'El apellido es obligatorio. ']
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'El password es obligatorio']
    },
    phone:{
        type: String,
        default: ''
    },
    image: {
        type: String,
        default:  ''
    },
    role: {
        type: String,
        required: true,
        enum: ['ADMIN_ROLE', 'USER_ROLE', 'SALES_ROLE']
    },
    walletBalance: {
        type: Schema.Types.Decimal128,
        default: 0
    },
    status: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

UserSchema.methods.toJSON = function () {
    const { __v, status, password, walletBalance, _id, ...data } = this.toObject();
    data.uid = _id;
    return {
        walletBalance: (walletBalance) ? parseFloat(walletBalance) : 0,
        ...data,
    };
}

module.exports = model('User', UserSchema);