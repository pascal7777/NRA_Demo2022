const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentpvSchema = new Schema(

    {
        bodypv: String,
        authorPv: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
    },
    { timestamps: true }
);


module.exports = mongoose.model("Commentpv", commentpvSchema);