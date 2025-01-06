// Getting Started
// • Database Set Up
// • REST Apis for CRUD

if(process.env.NODE_ENV != 'production'){ //Currently we're in our development phase, jab apan apne projects bana rhe hote hai. Jo apni 'dotenv' file hai, use apan sirf development phase mein hi use krte hai, production phase mein kabhi use nhi krte. Yaani agr aage kabhi agr apan kahi bhi apne project ko deploy krte hai ya github pr upload krte hai to galti se bhi .env file upload nhi honi chahiye. To jab baad mein deploy krenge hosting krke, tab ham ek naya environment variable create krte hai with the name 'NODE_ENV' aur uski value apan set kr dete hai to 'production'. Jab NODE_ENV ki value production mein set nhi hai, tabtak hi we'll use dotenv.
    require('dotenv').config();
}
// console.log(process.env); //require krne ke baad fir kahi bhi print krwa sakte hai apne process.environment variable ko.
// console.log(process.env.SECRET); //agr sirf SECRET key ki value print karani hai to.

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
// const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
// const {listingSchema, reviewSchema} = require('./schema.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

const listingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');


// const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust'; //ye local database ke liye.
const dbUrl = process.env.ATLASDB_URL; //ye cloud mein deployed DB ke liye(via Mongo Atlas).
// const Listing = require('./models/listing.js');
// const Review = require('./models/review.js');


main()
.then(()=>{
    console.log('Connected to DB.');
}).catch((err)=>{
    console.log(err);
});
async function main(){
    // await mongoose.connect(MONGO_URL);
    await mongoose.connect(dbUrl);
}

app.set ('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.engine('ejs',ejsMate); //ejs Mate ki help se apan kaafi commonly used templates jaise navbar, jo website ke har page mein same jagah rehta hai, bana sakte hai. npm i ejs-mate      refer npmjs.com.
app.use(express.static(path.join(__dirname, '/public'))); // after using ejsMate we'll create a floder named public for serving static files. Static yaani agr koi website ko hamein image serve krni hai, ya koi styling serve krni hai, ya hamein koi Js ka logic serve krna hai apne templates ke andar, to in sabko apan static files ke form mein serve krenge in a public folder.

// const validateListing = (req,res,next) => {
//     let {error} = listingSchema.validate(req.body);//kya req.body un saari conditions ko define kr rhi hai jo hamne apne listingSchema mein define kr rhe the(schema.js mein).
//     if(error){
//         let errMsg = error.details.map((element) => element.message).join(',');//error ki saari details ko map kr rhe hai, by returning each individual element's message, aur saari error details comma se separate hokr join ho jayengi.
//         throw new ExpressError(400, errMsg);
//     } else {
//         next();
//     }
// };

// const validateReview = (req,res,next) => {
//     let {error} = reviewSchema.validate(req.body);//kya req.body un saari conditions ko define kr rhi hai jo hamne apne reviewSchema mein define kr rhe the(schema.js mein).
//     if(error){
//         let errMsg = error.details.map((element) => element.message).join(',');//error ki saari details ko map kr rhe hai, by returning each individual element's message, aur saari error details comma se separate hokr join ho jayengi.
//         // console.log(req.body);
//         throw new ExpressError(400, errMsg);
//     } else {
//         next();
//     }
// };

const store = MongoStore.create({
    mongoUrl: dbUrl, //agr locally set hi krna hai to MONGO_URL pass kr sakte hai.
    crypto: { //crypto ke form mein apne secret ko store kr rhe hai! 
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600, //24 hours. touchAfter option: interval(in seconds) between session updates. Iska use ye hai ki agr session ke andar koi change ya koi update nhi hua, to ham apni session information ko iski field mein specified time ke baad hi update kre. Generally, we'll keep it as 24 hours(yaani 86400 seconds).
});

store.on('error', () => {
    console.log('Error in MONGO Session Store : ', err);
});

const sessionOptions = {
    store, //MongoStore - related information jo apne sessionOptions ke pass jaa rhi hai. Ab hamari session ki information Atlas Database mein store hone wali hai.
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, //ye kya kr rakha hai? -> Date.now() method aaj ki date return krke deta hai exact, agr ham chahte hai ki cookie 1 week ke baad expire ho, to usko milliseconds ke form mein yha likhna padta hai, isliye + 7(days) * 24(hours) * 60(minutes) * 60(seconds) * 1000 (milliseconds) kara hai. Aisa krne se ye ab ek hafte baad ka date and time ban jayega.
        // ab ek baar agr login kr liya apni website pr, to login information 7 din tak persist rhegi in cookie uske baad delete ho jayegi. Use kya hai -> Agr apan let's say instagram pr login krte hai, to kuch  specific timeframe tak na usko chalane pr ya login krne pr bhi ham browser ke through usmein logged-in rehte hai, yeh cheez persistent cookies ki help se hi ho paata hai, jinmein yeh expiry and maxAge dete hai, jaise hi wo time nikal jaata hai to hamein firse login krna padta hai kyuki uske baad hi browser us cookie ko delete krta hai.
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        httpOnly: true, //for security purposes. Isko true set krte hai for preventing our website from Cross-Site Scripting (XSS) attacks.
    },
};

// app.get('/', (req,res)=>{
//     res.send('Hi, I am root.');
// });

// Note: routing ke routes ko require krne ke pehle hi hamein yeh dono session aur flash ke middlewares ko use krna hai. Kyuki is flash ko apan routes ki help se hi use krne wale hai. Isliye pehle flash aayega aur fir routes aayenge code ke andar. Also, session aur flash dono ke app.use ko ek saath hi likhna chahiye.
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());//taaki har request ko pata ho ki wo kaunse session ka part hai, jisse ki agr user ne agr ek baar login kr diya, session create ho gya, fir uske baad use baar-baar login na krna pade usi same session mein.
passport.use(new LocalStrategy(User.authenticate()));//jitni users aaye aur requests aaye, wo sabhi users LocalStrategy ke through authenticate hone chahiye, aur un Users ko authenticate krne ke liye authenticate() method use hota hai, autheticate yaani login ya signUp krwana. It is a static method set by passport-local-mongoose by default.
passport.serializeUser(User.serializeUser()); //user se related information ko session mein store karana. Ek baar login krne ke baad serialize krna padega.
passport.deserializeUser(User.deserializeUser()); //user se related information ko remove krna session se. User session end hone ke baad deserialize krte hai. Both serializeUser and deserializeUser are static functions.

app.use((req,res,next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    // console.log(res.locals.success); //ek empty array print hoga agr koisi nayi listing create nhi hui toh. 
    res.locals.currUser = req.user; //req.user ki info store krega local variable mein so that we can use its condition in navbar.ejs template for showing login/logout on navbar.
    next();//next to call krna nhi bhulna hai nhi to isi middleware pr stuck reh jayenge.
});
// by default, cookies ki koi expiry date nhi hoti, generally ham jaise hi tab band kr dete hai to web browser un cookies ko delete kr deta hai, lekin agr apan unki koi expiry date set krte hai to chances rehti hai ki us date tak wo persist krti hai apne web browser pr.

//Creating our Demo user for passport:
// app.get('/demouser', async (req,res)=>{
//     let fakeUser = new User({
//         email: 'student@gmail.com',
//         username: 'new-student',
//     });

//     let registeredUser = await User.register(fakeUser, 'hello'); //a static method register, user to store the fakeUser into database, with parameters: user instance and password of that instance, respectively. This method also automatically checks whether the username is unique or not.
//     res.send(registeredUser);
// });
// Passport local mongoose apne aap internally pbkdf2 hashing algorithm ko use karta hai. 

app.listen(8080, ()=>{
    console.log('server is listening on port 8080.');
});

app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewRouter); //Note: By default agr apan aisa koisa url use krte hai jismein /:id bhi andar include ho jaata hai to aise mein jo id hai, wo sirf app.js tak hi ruk jaati hai, dusre js files jaise ki review.js mein koisa function agr aise mein kahi bhi id ka use krega to us tak wo id pahuch hi nhi paati. Ab is issue ko fix krne ke liye hamare pass ek external option hota hai called mergeParams. Usko use krne ke liye ham jab apni Expres.router se apni router object banate hai start mein routing wali js files mein, to usmein yeh option mergeParams: true set kr sakte hai. Inko parent routes bhi bolte hai jo yha pr included rehte hai, aur jo baaki ke url bache hue rehte hai dusri js files mein, unko child routes kehte hai. Unke parameters ko merge krne ke liye ye use krte hai.
app.use('/', userRouter);

// Model : Listing(List of things(places like apartment, flat, house, villa, hotel, etc.))
// • title : String
// • description : String
// • image(URL) : String
// • price : number
// • location : String
// • country : String

// app.get('/testListing',async (req,res)=>{
//     let sampleListing = new Listing({
//         title: 'My New Villa',
//         description: 'By the beach',
//         price: 1200,
//         location: 'Calangute, Goa',
//         country: 'India',
//     });

//     await sampleListing.save();
//     console.log('sample was saved.');
//     res.send('successful testing.');
// });

// Ab saare routes comment kr diye hai kyuki inke sabhi kaam listing.js kr rhi hai via Express routing. 
// // Index Route: GET     /listings 
// app.get('/listings', wrapAsync(async (req,res)=>{
//     const allListings = await Listing.find({});
//     res.render('./listings/index.ejs',{allListings});
// }));

// // New Route: isko show route ke pehle hi likhna hai nhi to /new ko jo next line mein hai usko js ek id samajh lega jo ki show route mein apan ne diya hai, to wo DB mein usko search krega jo ki nhi milegi, isliye isko pehle likha.
// app.get('/listings/new',(req,res)=>{
//     res.render('listings/new.ejs');
// });

// // Create Route: 
// app.post('/listings', validateListing, wrapAsync(async (req,res,next)=>{
//     // let {title, description, image, price, country, location} = req.body;
//     // better approach: har ek variable ko apne 'listing' object ki key bana do. isliye new.ejs mein  input name mein listing[title], listing[description] and so on diya hai. Ab required information ko simply aise extract kr sakte hai:
//     // if(!req.body.listing){
//     //     throw new ExpressError(400, 'Send valid data for listing.');//400 status Code matlab bad  request, yaani client ki galti ki wajah se server is request ko handle nhi kr sakta.
//     // }
//     const newListing = new Listing(req.body.listing);//instance bana diya Listing object ka.
//     await newListing.save();
//     // console.log(listing);
//     res.redirect('/listings');
// }));
// // Read : Show Route GET /listings/:id  -> returning all data for that particular id.
// app.get('/listings/:id', wrapAsync(async (req,res)=>{
//     let {id} = req.params;
//     const listing = await Listing.findById(id).populate('reviews');//jo har listing ke saath reviews hai, unko populate krna hai with their details.
//     res.render('listings/show.ejs', {listing});
// }));
// // Create : New & Create Route
// // New Route: GET  /listings/new  -> Form will be opened to create our new listing. After submission, this request will go to Create Route.
// // Create Route: POST  /listings  -> A POST route through which our New listing will be created.

// // Update : Edit & Update Route 
// // Edit Route: GET /listings/:id/edit -> A form will be rendered for editing. Usko submit krne ke baad request jayegi Update Route pr.
// // Update Route: PUT   /listings/:id  

// // Edit Route:
// app.get('/listings/:id/edit', wrapAsync(async (req,res)=>{
//     let {id} = req.params;
//     const listing = await Listing.findById(id);
//     res.render('listings/edit.ejs', {listing});
// }));

// // Update Route: 
// app.put('/listings/:id', validateListing, wrapAsync(async (req,res)=>{
//     let {id} = req.params;
//     // if(!req.body.listing){
//     //     throw new ExpressError(400, 'Send valid data for listing.');//400 status Code matlab bad  request, yaani client ki galti ki wajah se server is request ko handle nhi kr sakta.
//     // }
//     await Listing.findByIdAndUpdate(id,{...req.body.listing});//deconstructing req.body.listing object to extrace its individual parameters, which we can pass in our new and updated value.
//     res.redirect(`/listings/${id}`);
// }));

// // Delete : Delete Route -> DELETE  /listings/:id
// // Delete Route:
// app.delete('/listings/:id', wrapAsync(async (req,res)=>{
//     let {id} = req.params;
//     let deletedListing = await Listing.findByIdAndDelete(id);
//     console.log(deletedListing);
//     res.redirect('/listings');
// }));

// //Reviews
// //Post Review Route: Reviews ko hamesha listings ke saath hi access kiya jayega, isliye Reviews ke liye Index, Show route etc. banane ki need nhi hai, sirf relevant routes hi create krna hai. POST /listings/:id/reviews -> One to many relationship hai, har specific listing ki id ke through hi uske liye reviews rhenge, yeh route isliye design kiya gya hai is way mein. /reviews krke alag se bhi route design kr sakte hai pr usmein un lisitngs ki fir id extract krni padti.
// app.post('/listings/:id/reviews', validateReview, wrapAsync(async(req,res) => {
//     let listing = await Listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);

//     listing.reviews.push(newReview);//ab listing ke schema mein apan ne reviews naam ki array bhi specify kri hai, to is reviews array ke andar apan push kr denge newReview ko.
//     await newReview.save();
//     await listing.save();//kyuki kisi exisiting document mein change krna hota hai to apan ko save() function use krna hota hai, jo ki khud ek asynchronous function hai and thus await keyword is used for that purpose.

//     // console.log('New Review Saved.');
//     // res.send('New Review Saved.');
//     res.redirect(`/listings/${listing._id}`);
// }));

// //Delete Review Route:
// app.delete('/listings/:id/reviews/:reviewId', wrapAsync(async(req,res) => {
//     let {id, reviewId} = req.params;
//     await Listing.findByIdAndUpdate(id, {$pull : {reviews: reviewId}});//Listing ki array se un reviews ko delete krne ke liye.
//     // Mongo Spull operator:
//     // $pull: The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
//     // to yha ho kya rha hai? -> id yaani Listing id, aur Listing ke andar reviews array ke andar jo bhi reviewId match kr jaye, ham use pull yaani delete kr rhe hai. 
//     await Review.findByIdAndDelete(reviewId);//review ko delete krne ke liye based on its id.
//     res.redirect(`/listings/${id}`);
// }));

app.all('*', (req,res,next) =>{ //ek standard response bhejne ke liye, agr upar ki kisi bhi request se match nhi hua, to yha pr jo likha hai wo chalega.
    next(new ExpressError(404, 'Page Not Found.'));
});

//Our Custom Error Handler:
app.use((err,req,res,next)=>{
    let {statusCode = 500, message = 'Something went wrong.'} = err; //Us  ExpressError se statusCode aur message nikaal(deconstruct kr) liya, aur  unhe response ke andar send kr rhe hai ab:
    // res.status(statusCode).send(message);
    res.status(statusCode).render('error.ejs', { err });
});

// Form Validations:
// Client-side Validation: 
// When we enter data in the form, the browser and/or the web server will check to see that the data is in the correct format(ex: agr price hai to wo numeric type hi honi chahiye) and within the constraints set by the application(ex: price aisi cheez hai jisko negative nhi rakh sakte, kisi title ke liye pre-specified max length jo exceed nhi honi chahiye). 
// required keyword new.ejs mein add krne se compulsory to ho sakta hai value add krna, lekin uske baad jo message display krega browser(like please fill out this field), wo browser-to-browser depend krta hai. Ham chahte hai ek standarized format ho - hamesha wahi message display ho jo ham chahte hai(layout, error messages), regardless of the browser that we are using. Isliye yha bootstrap ke validation ka use krte hai. 

// Success and Failure Text: If contraints are followed with correct format, then it is a Success Text. Agr validation fail ho  jaati hai to Failure text. valid-feedback and invalid-feedback are two bootstrap classes used for implementing the same.

// joi.dev api: used for Schema Validation.
// joi is a validation library for JavaScript objects. npm package bhi hai usko pehle install kr lena: npm i joi
// joi ki help se apan ek Schema define kr dete hai,  aur ye Schema mongoose ka schema nhi hota, ye server-side validation ka schema hota hai.


// Authentication: the process of verifying who someone is.
// Authorization: the process of verifying what specific applications, files, and data a user has access to.
// Storing Passwords:
// We NEVER store the passwords as it is. We store their hashed form.

// how it is stored: 
// password: "helloworld" ----> Hashing ----> "936a185caaa266bb9cbe981e9e05cb78cd732bOb3280eb944412bb6f8f8f07af"

// Hashing:
//     • For every input, there is a fixed output.
//     • They are one-way functions, we can't get input from the output. Ex: modulus and remaider(%) functions.
//     • For a different input, there is a different output but of same length.
//     • Small changes in input should bring large changes in the output.

// Salting:
// Password salting is a technique to protect passwords stored in databases by adding a string of 32 or more characters and then hashing them.

// Passport: passportjs.com. Used to authenticate users. An Express-compatible authentication middleware for Node.js
// 1. npm i passport
// 2. npm i passport-local [agr koi app banai jismein express ke saath koi aur database jaise mysql use kara, uske liye yeh 2 libraries sufficient hai.]
// 3. npm i passport-local-mongoose[agr mongoDB ko as a database use kr rhe hai, to yeh library kuch aur mongoose-specific funtionalities use krne degi, it is basically a Mongoose plugin that simplifies building username and password login with Passport.]

// User Model:
// user : username, password, email(every user should have these fields.)
// You're free to define your User how you like. Passport-Local Mongoose will add a username, hash and salt field to store the username, the hashed password and the salt value. Additionally, Passport-Local Mongoose adds some methods to your Schema. 
// Apni local passport settings ko set-up krne ke liye some Configuring Strategies:
// passport.initialize() //A middleware that initializes passport.
// passport.session( ) //A web application needs the ability to identify users as they browse from page to page. This series of requests and responses, each associated with the same user, is known as a session.
// passport.use(new LocalStrategy(User.authenticate())).

// Connecting Login Route:
// How to check if User is Logged in? -> req.isAuthenticated() //Passport method.

// MVC : Model, view, Controller
// Implements Design Pattern for Listings. Jo bhi full-stack project hota hai, uske andar code ko kaise likha jaata hai, us code ko 3 components mein divide krte hai: models(database ke models ko store karana){Database}, views(jo cheez ham render karana chahte hai, yaani hamare frontend ko store karana){Frontend} and controllers(backend ki core functionalities ko store karane ke liye){Backend} component. Aur Design pattern yaani code likhne ka tarika.

// Router.route: A way to group together routes with different verbs but same paths. Agr hamare pass different routes hai jinke common paths hai, unke different verbs(get, put, post, delete, etc.) ko apan combine kr sakte hai. Jaise 3-4 routes hai '/users/:user_id' path pr apni put, post, get, delete etc. requests aa rhi hai, to un sabhi callbacks ko apan router.route() ke andar likh sakte hai. Same path ko baar baar define krne ki jagah bas ek baar specify krna hota hai.

// Cloud Setup: free cloud service - Cloudinary & .env file.
// hamare code ko hamare 'credentials' pata hone chahiye. Ye cloud ke credentials kabhi share nhi kiye jaate. Yahi Product Environment Credentials section mein rehta hai Cloudinary ke dashboard wale webpage pr. Isliye in credentials ko ek alag file mein likhte hai jisse ki koi 3rd person inko access na kr paye. In saare credentials ko save krne ke liye we create a special file named '.env' file. This file stores our environment variables. 
// KEY=Value is format mein store krte hai credentials apan .env file mein. Generally, it is preferred to keep the name of the key in Capital letter format aur key kam naam kuch bhi rakh sakte hai, no space or quotes allowed in between.
// Ek baar environment variables set ho jaate hai, fir unko apan apne project mein kahi pr bhi use kr sakte hai, pr unko directly access krne ke liye we'll have to use another npm library - dotenv
// dotenv hamari .env file ko backend ke saath integrate krwati hai. Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env. process.env yaani current process ke environment variables. npm i dotenv
// isko use krne ke liye we'll use : require('dotenv').config()

// Store Files: Multer Store Cloudinary. Since multer and cloudinary are frequently used together, jis wajah se inki bhi 2 npm libraries hai hamare pass: cloudinary and multer-storage-cloudinary
// npm i cloudinary multer-storage-cloudinary or npm i cloudinary and npm i multer-storage-cloudinary

// Save path Link in Mongo: Modify Image in listing Schema model. ab image section  mein listing ke path aur filename - ye 2 cheezein save karayenge.

// Getting started with Maps: We'll be using MapBox API here. MapBox is also well-known, popular and professionally used API, just like Google Maps API. Apan MapBox api isliye use kr rhe hai kyuki ye credit card information nhi maangta, unlike Google Maps API :) .Kyuki ye airbnb clone hai aur airbnb ki website pr har ek listing ke show page pr uski Geolocation in the form of maps show ho rhi hai.

// Geocoding: Geocoding is the process of converting addresses (like a street address) into geographic coordinates (like latitude and longitude), which you can use to place markers on a map, or position the map.

// Storing Coordinates: in GeoJSON format
// The most simple structure in GeoJSON is a point.The longitude comes first in a GeoJSON coordinate array, not latitude.

// GeoJSON is a format for storing geographic points and polygons. MongoDB has excellent support for geospatial queries on GeoJSON objects.

// Mongo Atlas: MongoDB Atlas is a fully-managed cloud database developed by the same people that build MongoDB. It is a Database as a Service (DBaaS) that runs on AWS, Google Cloud, and Azure. (Cloud Database Service). Deploy a multi-cloud database. Hamare entire database ko online ya fir cloud pr shift krne ke liye we use Mongo Atlas Service. Pura project deploy krne se pehle we will be deploying our database on Mongo Atlas, so that baad mein jab bhi apna project deploy ho to wo direct fir apne deployed online database ke saath connect kr paaye.
// mongodb.com/atlas/database 
// Cluster() yaani wo space jo apan ko mil rhi hai apne database ko store krne ki.

// Mongo Session Store: Pehle apan express-session npm package use kr rhe the for storing the session data, but now we'll be using connect-mongo npm package for storing the session data in MongoDB. expresss-session MemoryStore mein session store krta tha, jisse data leak hone ke chances rehte hai and it does not scale past a single process, and it is meant for debugging and developing. Ab, apan deployment phase pr hai isliye we'll be using connect-mongo session store jo ki ek npm package hai! Session-related information yaani jaise cookies, user-related tokens, expiry date of session after login, etc. ye sabhi.
// npm i connect-mongo
// NOTE: MongoStore(connect-mongo) ko require krne ke pehle hamesha express session require krna hai, warna error aayega.

// Deployment: Heroku(now paid), Vercel, Railway, Render, GitHub Pages, netlify
// cyclic etc.deployment platforms. Deployment platforms are the platforms where we deploy our project. We can deploy our project on any of these platforms.
// Apan apna code Render pr deploy krne wale hai. ->  https://render.com/ 
// agr node ka version specify nhi krte to deployment ke time apne pass kuch error aa sakte hai. isliye pakcage.json mein engines ke andar node version specify krna hai. 
// GitHub mein ab apan is repository ko push krnw wale hai! Yha pr render yeh krega ki render apne pass ek GitHub repository ko connect krwa dega, aur jab bhi koi changes aayenge us repository mein, to render automatically un changes ko detect krega aur apne pass deploy kr dega. Jab bhi apan koi changes krte hai, to unko push krne ke baad render automatically un changes ko detect krega aur apne pass deploy kr dega. Is flow ko setup krne liye we'll be connecting Render with our GitHub.

// To initialize our project as a gitHub repo, we'll use:
// git init
// agr kuch files hai jinko apan commit nhi krna chahte to unko .gitignore file mein add krna hai. Kya kya ignore karana hai? -> node_modules/, .env, and .DS_Store(for mac devices). for that -> touch .gitignore
// Note(for mac users): .gitignore file mein .DS_Store ko likhne ka tarika rhega: **/.DS_Store -> is syntax ka matlab hai ki agr .DS_Store kisi bhi folder ya subfolder mein bhi dikhe to usko ignore krna hai(kyuki ye ek hidden file hai jo har ek folder ke andar hoti hai). After doing that, you'll notice ki apne VS code ke Explorer section mein node_modules aur .env file hide ho gyi hai(grey colour mein appear ho rhi hai), yaani in dono ko ab git ignore kr rha hai aur track nhi krega. Check krne ke liye -> git status
// ab in changes ko we are going to add and commit. -> git add . and git commit -m "Add Project Files"
