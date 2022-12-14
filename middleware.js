const { eoiProductSchema, manufacturerSchema, productSchema, productLotSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Manufacturer = require("./models/manufacturer");
const Product = require("./models/product");
const ProductLot = require("./models/productLot");

const Gmp = require("./models/gmp");
const CommentQc = require("./models/commentqc");
const CommentCp = require("./models/commentcp");
const CommentPv = require("./models/commentpv");
const eoiProduct = require("./models/eoiProduct");


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateeoiProduct = (req, res, next) => {
    const { error } = eoiProductSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


module.exports.validateManufacturer = (req, res, next) => {
    const { error } = manufacturerSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.validateProduct = (req, res, next) => {
    const { error } = productSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.validateproductLot = (req, res, next) => {
    const { error } = productLotSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//SITE MIDDLEWARE

// module.exports.isauthorSite = async (req, res, next) => {
//     const { id } = req.params;
//     const manufacturer = await Manufacturer.findById(id);
//     if (manufacturer.authorSite.equals(req.user._id) || currentUser && currentUser.isAdmin)) {
//         req.flash('error', 'You do not have permission to do that!');
//         return res.redirect(`/manufacturers/${id}`);
//     }
//     next();
// }

module.exports.isauthorSite = async (req, res, next) => {
    const { id } = req.params;
    const manufacturer = await Gmp.findById(id);
    if (manufacturer.authorSite.equals(req.user._id) || req.user.isAdmin) {
        next();
    } else
        req.flash('error', 'You do not have permission to edit!');
    return res.redirect(`/manufacturers/${id}`)
}

module.exports.isauthorProduct = async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product.authorProduct.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/products/${id}`);
    }
    next();
}

module.exports.isauthorLot = async (req, res, next) => {
    const { id } = req.params;
    const productLot = await ProductLot.findById(id);
    if (!productLot.authorLot.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/productLots/${id}`);
    }
    next();
}




//LOT COMMENTS MIDDLEWARE

module.exports.isauthorGmp = async (req, res, next) => {
    const { id } = req.params;
    const gmp = await Gmp.findById(id);
    if (!gmp.authorGmp.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to close this GMP!');
        return res.redirect(`/manufacturers/${id}`);
    }
    next();
}

// module.exports.isauthorGmp = async (req, res, next) => {
//     const { id } = req.params;
//     const gmp = await Gmp.findById(id);
//     if (gmp.authorGmp.equals(req.user._id) || req.user.isAdmin) {
//         next();
//     } else
//         req.flash('error', 'You do not have permission to close this GMP!');
//     return res.redirect(`/manufacturers/${id}`)
// }

module.exports.isauthorQc = async (req, res, next) => {
    const { id } = req.params;
    const commentQc = await CommentQc.findById(id);
    if (!commentQc.authorQc.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to close this QC!');
        return res.redirect(`/commentqcs/${id}`);
    }
    next();
}

module.exports.isauthorCp = async (req, res, next) => {
    const { id } = req.params;
    const commentCp = await CommentCp.findById(id);
    if (!commentCp.authorCp.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to close this CP!');
        return res.redirect(`/commentcps/${id}`);
    }
    next();
}

module.exports.isauthorPv = async (req, res, next) => {
    const { id } = req.params;
    const commentPv = await commentPv.findById(id);
    if (!commentPv.authorPv.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to close this PV!');
        return res.redirect(`/commentpvs/${id}`);
    }
    next();
}