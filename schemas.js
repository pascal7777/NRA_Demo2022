const Joi = require('joi');

module.exports.eoiProductSchema = Joi.object({
    eoiProduct: Joi.object({
        name: Joi.string().required(),
    }).required()
});


module.exports.manufacturerSchema = Joi.object({
    manufacturer: Joi.object({
        company: Joi.string().required(),
    }).required()
});

module.exports.productSchema = Joi.object({
    product: Joi.object({
        productName: Joi.string().required(),
    }).required()
});

module.exports.productLotSchema = Joi.object({
    productLot: Joi.object({
        lotNumber: Joi.string().required(),
    }).required()
});

module.exports.userSchema = Joi.object({
    user: Joi.object({
        name: Joi.string().required(),
    }).required()
})