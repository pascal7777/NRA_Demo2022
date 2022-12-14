const mongoose = require('mongoose');
const Product = require('./product');
const Gmp = require('./gmp');
const { Schema } = mongoose;

const manufacturerSchema = new Schema({
    company: {
        type: String,
        uppercase: true
    },
    city: {
        type: String,
        lowercase: true
    },
    country: {
        type: String,
        lowercase: true
    },
    siteName: {
        type: String,
        uppercase: true
    },
    siteAdres: {
        type: String,
        lowercase: true
    },
    productionLine: {
        type: String,
        lowercase: true
    },
    annualCapacity: {
        type: String,
        lowercase: true
    },
    status: {
        type: String, default: 'SITE_INSPECTION',
        uppercase: true,
        enum: ['SITE_INSPECTION', 'SITE_APPROVED', 'SITE_REJECTED', 'SITE_SUSPENDED']
    },
    authorSite: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    gmps: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Gmp'
        }
    ],
},
    { timestamps: true }
);


// DELETE ALL ASSOCIATED PRODUCTS AFTER A MANUFACTURER IS DELETED
manufacturerSchema.post('findOneAndDelete', async function (manufacturer) {
    if (manufacturer.products.length) {
        await Product.deleteMany({ _id: { $in: manufacturer.products } })
    }
})

// DELETE ALL ASSOCIATED GMPs AFTER A MANUFACTURER IS DELETED
manufacturerSchema.post('findOneAndDelete', async function (manufacturer) {
    if (manufacturer.gmps.length) {
        await Gmp.deleteMany({ _id: { $in: manufacturer.gmps } })
    }
})


const Manufacturer = mongoose.model('Manufacturer', manufacturerSchema);



module.exports = Manufacturer;