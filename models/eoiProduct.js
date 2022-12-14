const mongoose = require('mongoose');
const { Schema } = mongoose;

const eoiProductSchema = new Schema({
    indication: {
        type: String
    },
    atcCode: {
        type: String
    },
    name: {
        type: String
    },
    strength: {
        type: String
    },
    strengthUnit: {
        type: String
    },
    dosageForm: {
        type: String
    },
    packSize: {
        type: Number
    },
    packUnit: {
        type: String
    },
    route: {
        type: String,
        uppercase: true, default: 'FULL_CTD',
        enum: ['FULL_CTD', 'ABBREVIATED', 'CRP_WHOPQ', 'JOINT_MRA']
    },
    demandAnnual: {
        type: Number
    },
    date: {
        type: Date
    }
});



const EoiProduct = mongoose.model('EoiProduct', eoiProductSchema);



module.exports = EoiProduct;



