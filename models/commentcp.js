const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentcpSchema = new Schema(

    {
        bodycp: String,
        authorCp: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Commentcp", commentcpSchema);