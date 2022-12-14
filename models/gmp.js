const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gmpSchema = new Schema(

    {
        bodygmp: String,
        authorGmp: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Gmp", gmpSchema);