
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');

const path = require('path');

const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');

const { manufacturerSchema } = require('./schemas.js');
const { productSchema } = require('./schemas.js');
const { productLotSchema } = require('./schemas.js');
const { userSchema } = require('./schemas.js');
const { eoiProductSchema } = require('./schemas.js');
const session = require('express-session');
const flash = require('connect-flash');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/users');

const EoiProduct = require('./models/eoiProduct');
const Manufacturer = require('./models/manufacturer');
const Product = require('./models/product');
const ProductLot = require('./models/productLot');
const Commentqc = require('./models/commentqc');
const Commentpv = require('./models/commentpv');
const Commentcp = require('./models/commentcp');
const Gmp = require('./models/gmp');


const { isLoggedIn, validateeoiProduct, validateManufacturer, validateProduct, validateproductLot, isauthorSite, isauthorProduct, isauthorLot, isauthorGmp, isauthorCp, isauthorPv, isauthorQc } = require('./middleware.js');
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const MongoStore = require('connect-mongo');

// const dosageForms = ['TABLET', 'INJECTION', 'CREAM'];


//Atlas pw U1x649KdNxIzSh54

// mongoose.connect('mongodb+srv://Mongo:U1x649KdNxIzSh54@cluster0.zd2rwx8.mongodb.net/?retryWrites=true&w=majority', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false
// });


const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/irims_demo';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

mongoose.set('useCreateIndex', true)

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})


const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);





// HOME PAGE

app.get('/', (req, res) => {
    res.render('home')
})
app.get('/rs', (req, res) => {
    res.render('rs')
})
app.get('/ma', (req, res) => {
    res.render('ma')
})
app.get('/vl', (req, res) => {
    res.render('vl')
})
app.get('/mc', (req, res) => {
    res.render('mc')
})
app.get('/li', (req, res) => {
    res.render('li')
})
app.get('/ri', (req, res) => {
    res.render('ri')
})
app.get('/lt', (req, res) => {
    res.render('lt')
})
app.get('/ct', (req, res) => {
    res.render('ct')
})
app.get('/lr', (req, res) => {
    res.render('lr')
})



// EOI routes

//INDEX - Show All 
app.get('/eoiProducts', async (req, res) => {
    const { route } = req.query;
    if (route) {
        const eoiProducts = await EoiProduct.find({ route })
        res.render('eoiProducts/index', { eoiProducts, route })
    } else {
        const eoiProducts = await EoiProduct.find({})
        res.render('eoiProducts/index', { eoiProducts, route: 'All' })
    }
})
app.get('/eoiProducts/new', (req, res) => {
    res.render('eoiProducts/new')
})

app.post('/eoiProducts', isLoggedIn, async (req, res) => {
    const eoiProduct = new EoiProduct(req.body);
    await eoiProduct.save();
    req.flash('success', 'Successfully added a new EOI!');
    res.redirect('/eoiProducts')
})





//Manufacturer ROUTES

app.get('/manufacturers', async (req, res) => {
    const { status } = req.query;
    if (status) {
        const manufacturers = await Manufacturer.find({ status })
        res.render('manufacturers/index', { manufacturers, status })
    } else {
        const manufacturers = await Manufacturer.find({})
        res.render('manufacturers/index', { manufacturers, status: 'All' })
    }
})

app.get('/manufacturers/new', isLoggedIn, (req, res) => {
    res.render('manufacturers/new')
})

app.post('/manufacturers', isLoggedIn, async (req, res) => {
    const manufacturer = new Manufacturer(req.body);
    manufacturer.authorSite = req.user._id;
    await manufacturer.save();
    req.flash('success', 'Successfully added a new production site!');
    res.redirect('/manufacturers')
})

app.get('/manufacturers/:id/edit', isLoggedIn, async (req, res) => {
    const manufacturer = await Manufacturer.findById(req.params.id)
    res.render('manufacturers/edit', { manufacturer });
})

app.get('/manufacturers/:id/status', isLoggedIn, async (req, res) => {
    const manufacturer = await Manufacturer.findById(req.params.id)
    res.render('manufacturers/status', { manufacturer });
})

// !!!! still to add validateProduct, one date editOn is sorted out !!!
app.put('/manufacturers/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const manufacturer = await Manufacturer.findByIdAndUpdate(id, { ...req.body.manufacturer });
    req.flash('success', 'Successfully updated details on this site!');
    res.redirect(`/manufacturers/${manufacturer._id}`)
});



app.delete('/manufacturers/:id', isLoggedIn, async (req, res) => {
    const manufacturer = await Manufacturer.findByIdAndDelete(req.params.id);
    req.flash('success', 'Site has been deleted');
    res.redirect('/manufacturers');
})


app.post('/manufacturers/:id/gmps', isLoggedIn, async (req, res) => {
    const manufacturer = await Manufacturer.findById(req.params.id);
    const gmp = new Gmp(req.body.gmp);
    gmp.authorGmp = req.user._id;
    manufacturer.gmps.push(gmp);
    await gmp.save();
    await manufacturer.save();
    req.flash('success', 'Successfully added a GMP to this Site!');
    res.redirect(`/manufacturers/${manufacturer._id}`);
})

app.get('/manufacturers/:id', isLoggedIn, async (req, res) => {
    const manufacturer = await Manufacturer.findById(req.params.id).populate('products').populate({
        path: 'gmps',
        populate: {
            path: 'authorGmp'
        }
    }).populate('authorSite');
    console.log(manufacturer);
    res.render('manufacturers/show', { manufacturer })
})

app.delete('/manufacturers/:id/gmps/:gmpId', isLoggedIn, async (req, res) => {
    const { id, gmpId } = req.params;
    await Manufacturer.findByIdAndUpdate(id, { $pull: { gmps: gmpId } });
    await Gmp.findByIdAndDelete(gmpId);
    req.flash('success', 'GMP deleted from this site!');
    res.redirect(`/manufacturers/${id}`);
})





// PRODUCT ROUTES

app.get('/products', async (req, res) => {
    const { status } = req.query;
    if (status) {
        const products = await Product.find({ status })
        res.render('products/index', { products, status })
    } else {
        const products = await Product.find({})
        res.render('products/index', { products, status: 'All' })
    }
})

// app.get('/products', async (req, res) => {
//     const { dosageForm } = req.query;
//     if (dosageForm) {
//         const products = await Product.find({ dosageForm })
//         res.render('products/index', { products, dosageForm })
//     } else {
//         const products = await Product.find({})
//         res.render('products/index', { products, dosageForm: 'All' })
//     }
// })

// app.get('/products/new', isLoggedIn, (req, res) => {
//     res.render('products/new', { dosageForms })
// })

app.post('/products', isLoggedIn, async (req, res) => {
    const newProduct = new Product(req.body.product);
    product.authorProduct = req.user._id;
    await newProduct.save();
    req.flash('success', 'Successfully added a new product!');
    res.redirect(`/products/${newProduct._id}`)
})

app.get('/products/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id).populate('manufacturer').populate('productLots').populate('authorProduct');
    res.render('products/show', { product });
})

app.get('/products/:id/edit', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('products/edit', { product });
})

app.get('/products/:id/status', isLoggedIn, async (req, res) => {
    const product = await Product.findById(req.params.id)
    res.render('products/status', { product });
})

app.put('/products/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { ...req.body.product });
    req.flash('success', 'Successfully updated details on this product!');
    res.redirect(`/products/${product._id}`)
});

app.delete('/products/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    req.flash('success', 'Product has been deleted');
    res.redirect('/products');
})

// BATCH ROUTES

app.get('/productLots', async (req, res) => {
    const { status } = req.query;
    if (status) {
        const productLots = await ProductLot.find({ status })
        res.render('productLots/index', { productLots, status })
    } else {
        const productLots = await ProductLot.find({})
        res.render('productLots/index', { productLots, status: 'All' })
    }
})

app.get('/productLots/new', isLoggedIn, (req, res) => {
    res.render('productLots/new')
})
app.post('/productLots', isLoggedIn, async (req, res) => {
    const newProductLot = new ProductLot(req.body.productLot);
    productLot.authorLot = req.user._id;
    await newProductLot.save();
    res.redirect(`/productLots/${newProductLot._id}`)
})

app.get('/productLots/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const productLot = await ProductLot.findById(req.params.id).populate('product').populate({
        path: 'commentqcs',
        populate: {
            path: 'authorQc'
        }
    }).populate({
        path: 'commentpvs',
        populate: {
            path: 'authorPv'
        }
    }).populate({
        path: 'commentcps',
        populate: {
            path: 'authorCp'
        }
    }).populate('authorLot');
    res.render('productLots/show', { productLot })
})

app.get('/productLots/:id/status', isLoggedIn, async (req, res) => {
    const productLot = await ProductLot.findById(req.params.id)
    res.render('productLots/status', { productLot });
})

app.put('/productLots/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const productLot = await ProductLot.findByIdAndUpdate(id, { ...req.body.productLot });
    res.redirect(`/productLots/${productLot._id}`)
});

app.delete('/productLots/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const deletedProductLot = await ProductLot.findByIdAndDelete(id);
    req.flash('success', 'Batch has been deleted');
    res.redirect('/productLots');
})

app.post('/productLots/:id/commentqcs', isLoggedIn, async (req, res) => {
    const productLot = await ProductLot.findById(req.params.id);
    const commentqc = new Commentqc(req.body.commentqc);
    productLot.commentqcs.push(commentqc);
    commentqc.authorQc = req.user._id;
    await commentqc.save();
    await productLot.save();
    req.flash('success', 'Successfully added a QC event to this batch!');
    res.redirect(`/productLots/${productLot._id}`);
})

app.delete('/productLots/:id/commentqcs/:commentqcId', isLoggedIn, async (req, res) => {
    const { id, commentqcId } = req.params;
    await ProductLot.findByIdAndUpdate(id, { $pull: { commentqcs: commentqcId } });
    await Commentqc.findByIdAndDelete(commentqcId);
    req.flash('success', 'QC event deleted from this batch!');
    res.redirect(`/productLots/${id}`);
})

app.post('/productLots/:id/commentcps', isLoggedIn, async (req, res) => {
    const productLot = await ProductLot.findById(req.params.id);
    const commentcp = new Commentcp(req.body.commentcp);
    productLot.commentcps.push(commentcp);
    commentcp.authorCp = req.user._id;
    await commentcp.save();
    await productLot.save();
    req.flash('success', 'Successfully added a CP event to this batch!');
    res.redirect(`/productLots/${productLot._id}`);
})

app.delete('/productLots/:id/commentcps/:commentcpId', isLoggedIn, async (req, res) => {
    const { id, commentcpId } = req.params;
    await ProductLot.findByIdAndUpdate(id, { $pull: { commentcps: commentcpId } });
    await Commentcp.findByIdAndDelete(commentcpId);
    req.flash('success', 'CP event deleted from this batch!');
    res.redirect(`/productLots/${id}`);
})

app.post('/productLots/:id/commentpvs', isLoggedIn, async (req, res) => {
    const productLot = await ProductLot.findById(req.params.id);
    const commentpv = new Commentpv(req.body.commentpv);
    productLot.commentpvs.push(commentpv);
    commentpv.authorPv = req.user._id;
    await commentpv.save();
    await productLot.save();
    req.flash('success', 'Successfully added a PV event to this batch!');
    res.redirect(`/productLots/${productLot._id}`);
})

app.delete('/productLots/:id/commentpvs/:commentpvId', isLoggedIn, async (req, res) => {
    const { id, commentpvId } = req.params;
    await ProductLot.findByIdAndUpdate(id, { $pull: { commentpvs: commentpvId } });
    await Commentpv.findByIdAndDelete(commentpvId);
    req.flash('success', 'PV event deleted from this batch!');
    res.redirect(`/productLots/${id}`);
})


app.get('/manufacturers/:id/products/new', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const manufacturer = await Manufacturer.findById(id);
    res.render('products/new', { manufacturer })
})

app.post('/manufacturers/:id/products', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const manufacturer = await Manufacturer.findById(id);
    const { productName, innName, dosageForm, strength, strengthUnit, packSize, packUnit, shelfLife, image } = req.body;
    const product = new Product({ productName, innName, dosageForm, strength, strengthUnit, packSize, packUnit, shelfLife, image });
    manufacturer.products.push(product);
    product.manufacturer = manufacturer;
    product.authorProduct = req.user._id;
    await manufacturer.save();
    await product.save();
    req.flash('success', 'Successfully added a new product!');
    res.redirect(`/manufacturers/${id}`)
    // res.send(manufacturer)
})

app.get('/products/:id/productLots/new', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('productLots/new', { product })
})

app.post('/products/:id/productLots', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    const { lotNumber, manufacture, expire, size } = req.body;
    const productLot = new ProductLot({ lotNumber, manufacture, expire, size });
    product.productLots.push(productLot);
    productLot.product = product;
    productLot.authorLot = req.user._id;
    req.flash('success', 'Successfully added a new batch!');
    await productLot.save();
    await product.save();
    // res.send(product)
    res.redirect(`/products/${id}`)
})






// app.listen(3000, () => {
//     console.log("APP IS LISTENING ON PORT 3000!")
// })

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})

