const mongoose = require('mongoose');
const ProductLot = require('./productLot');
const { Schema } = mongoose;

const productSchema = new Schema({
    productName: {
        type: String,
        uppercase: true,
        required: true
    },
    innName: {
        type: String,
        lowercase: true,
        required: true
    },
    apiSource: {
        type: String,
        required: true
    },
    atcCode: {
        type: String,
        required: true
    },
    strength: {
        type: String
    },
    strengthUnit: {
        type: String,
        enum: ['MG', 'G', '%', 'g/ml', 'mg/g', 'mg/ml', 'IE', 'IE/g']
    },
    dosageForm: {
        type: String,
        uppercase: true
    },
    packSize: {
        type: Number
    },
    packUnit: {
        type: String
    },
    shelfLife: {
        type: Number
    },
    manufacturer: {
        type: Schema.Types.ObjectId,
        ref: 'Manufacturer'
    },
    image: {
        type: String
    },
    status: {
        type: String, default: 'REVIEW',
        uppercase: true,
        enum: ['REVIEW', 'APPROVED', 'REJECTED (SUBSTANDARD)', 'SUSPENDED']
    },
    authorProduct: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    registrationHolder: {
        type: String
    },
    maNumber: {
        type: String
    },
    productLots: [
        {
            type: Schema.Types.ObjectId,
            ref: 'ProductLot'
        }
    ],
},
    { timestamps: true }
);



// DELETE ALL ASSOCIATED PRODUCTLOTS AFTER A PRODUCT IS DELETED
productSchema.post('findOneAndDelete', async function (product) {
    if (product.productLots.length) {
        await ProductLot.deleteMany({ _id: { $in: product.productLots } })
    }
})

const Product = mongoose.model('Product', productSchema);



module.exports = Product; 