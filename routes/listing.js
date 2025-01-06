// Express Router: Express Routers are a way to organize your Express application such that our primary app.js file
// does not become bloated. A router object is an isolated instance of middleware and routes. You can think of it as a "mini-application," capable only of performing middleware and routing functions. Every Express application has a built-in app router.
// const router = express.Router(); creates new router object.

const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require('../models/listing.js');
const {isLoggedIn, isOwner, validateListing} = require('../middleware.js');
const listingController = require('../controllers/listings.js');
// multer import kr rhe hai kyuki isi page se apna add new listing ka form post request se jaayega DB mein. 
const multer = require('multer');//form ke multipart data(image) ko parse krne ke liye we're using multer npm package.
const { storage } = require('../cloudConfig.js');
// const upload = multer({dest: 'uploads/'}); //tha multer form ke data se files ko nikalega aur unhe automatically 'uploads/' naam ke folder mein add kr dega(uploads naam ka folder create karke). Ye temporary cheez hai, aage un files ko cloud mein save karayenge. uploads ki jagah koisa bhi name specify kr sakte hai directory ka.
const upload = multer({storage}); //ab multer by default files ko hamari cloudinary ki storage mein save krega.

router.route('/')//get aur post request ek saath aa gyi having common route '/', isliye ab hamein baar baar route ko specify krne ki need nhi hai har request ke andar. Easily readable, more compact.
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));
    // .post(upload.single('listing[image]'), (req,res)=>{ //jaise hi '/' pr request aaye, waise hi multer listing[image] wali field se jo bhi image aa rhi hai usko uploads/ folder mein save kr de. Automatically apne Major Project ke folder mein ek uploads krke folder create ho jayega aur usmein wo image aa jayegi jo bhi apan ne upload kri thi.
    //     // res.send(req.body);
    //     res.send(req.file);//multer use krne ke baad req.file ek naya parameter aa jaata hai jismein file-related data store hota hai. 
    // });

// New Route: isko show route ke pehle hi likhna hai nhi to /new ko jo next line mein hai usko js ek id samajh lega jo ki show route mein apan ne diya hai, to wo DB mein usko search krega jo ki nhi milegi, isliye isko pehle likha.
router.get('/new', isLoggedIn, listingController.renderNewForm); //ab isLoggedIn middleware pass kr diya yha for authentication.

router.route('/:id')
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Index Route: GET /listings 
// router.get('/', wrapAsync(listingController.index));//baaki ka async callback content controllers ke listings.js mein daal diya hai, jisse yha bas listingController ka module export wala index function yha likha hai. Kyu kiya? -> kyuki routes hote hai bas routing ke liye, aur backend ki jo core functionality hai wo controllers mein chali gyi, as per our MVC design pattern. This is the implementation of MVC framework. 

// Create Route: 
// router.post('/', isLoggedIn, validateListing, wrapAsync(listingController.createListing));

// Read(Show Route) : Show Route GET /listings/:id  -> returning all data for that particular id.
// router.get('/:id', wrapAsync(listingController.showListing)); 

// Edit Route:
router.get('/:id/edit', isLoggedIn, isOwner,  wrapAsync(listingController.renderEditForm));

// Update Route: 
// router.put('/:id', isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

// Delete Route:
// router.delete('/:id', isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;