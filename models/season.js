const { Schema, model } = require("mongoose");


const SeasonSchema = Schema({
    name: {
        type: String,
        require: [true, 'El nombre es obligatorio'],
        unique: true
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
    }
}, { timestamps: true });

SeasonSchema.methods.toJSON = function() {
    const { __v, status, ...data} = this.toObject();
    return data;
}

module.exports = model('Season', SeasonSchema);