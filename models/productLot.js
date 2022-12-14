const mongoose = require('mongoose');
const Product = require('./product');
const Commentqc = require('./commentqc');
const Commentpv = require('./commentpv');
const Commentcp = require('./commentcp');
const { Schema } = mongoose;


const productLotSchema = new Schema({
    lotNumber: {
        type: String,
        uppercase: true
    },
    manufacture: {
        type: Date
    },
    expire: {
        type: Date
    },
    size: {
        type: Number
    },
    status: {
        type: String, default: 'QC',
        uppercase: true,
        enum: ['RELEASED', 'QC', 'RECALLED (FALSIFIED)', 'RECALLED (SUBSTANDARD)', 'HOLD']
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    authorLot: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    importer: {
        type: String
    },
    qcLab: {
        type: String
    },
    nameQp: {
        type: String
    },
    commentqcs: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Commentqc'
        }
    ],
    commentpvs: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Commentpv'
        }
    ],
    commentcps: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Commentcp'
        }
    ],
},
    { timestamps: true }
);


// DELETE ALL ASSOCIATED QC COMMENTS AFTER A PRODUCTLOT IS DELETED
productLotSchema.post('findOneAndDelete', async function (productLot) {
    if (productLot.commentqcs.length) {
        await Commentqc.deleteMany({ _id: { $in: productLot.commentqcs } })
    }
})

// DELETE ALL ASSOCIATED PV COMMENTS AFTER A PRODUCTLOT IS DELETED
productLotSchema.post('findOneAndDelete', async function (productLot) {
    if (productLot.commentpvs.length) {
        await Commentpv.deleteMany({ _id: { $in: productLot.commentpvs } })
    }
})

// DELETE ALL ASSOCIATED CP COMMENTS AFTER A PRODUCTLOT IS DELETED
productLotSchema.post('findOneAndDelete', async function (productLot) {
    if (productLot.commentcps.length) {
        await Commentcp.deleteMany({ _id: { $in: productLot.commentcps } })
    }
})
const ProductLot = mongoose.model('ProductLot', productLotSchema);

module.exports = ProductLot; 