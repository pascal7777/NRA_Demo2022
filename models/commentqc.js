const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentqcSchema = new Schema(

    {
        bodyqc: String,
        authorQc: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Commentqc", commentqcSchema);