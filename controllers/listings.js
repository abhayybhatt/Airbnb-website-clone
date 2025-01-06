const Listing = require('../models/listing');
// const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');//geocoding wali service ko require kiya.
// const mapToken = process.env.MAP_TOKEN;
// const geocodingClient = mbxGeocoding({ accessToken: mapToken }); //always refer to their respective documentations for naming conventions. Geocoding service ko start kr diya by passing our access token, jisse apan ko ek geocodingClient naam ka object mil gya jo Geocoding-related functionalities ko perform krega. Ye pura mbxGeocoding abhi commented hai kyuki mapbox se api nhi mil rhi hai, credit card details maang rha hai!

module.exports.index = async (req,res)=>{ //saari listings ko render karana.
    const allListings = await Listing.find({});
    res.render('./listings/index.ejs',{allListings});
};

module.exports.renderNewForm =  (req,res)=>{
    // ye pura authenticated wala logic ab middleware.js file mein hai, kyuki yeh action har jagah hi lagna hai, chahe wo new lisitng ho, edit listing ho, ya fir delete listing ho, sabhi mein user ka logged in rehna compulsory hai to perform such actions.
    // console.log(req.user); //yha user-related information store hoti hai session ki, jaise hi koi user login krta hai jab.
    // if(!req.isAuthenticated()){ //passport ki help se user ke current session ki information ko store krta hai, to login krne ke baad hi apan fir new listing create kr payenge, since login krne ke baad Authenticated ho jayega user.
    //     req.flash('error','You must be logged in to create a new listing!');
    //     return res.redirect('/login');
    // }
    res.render('listings/new.ejs');
};

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: 'reviews', 
        populate: {
            path: 'author',
        },
    }).populate('owner');//jo har listing ke saath reviews hai, unko populate krna hai with their details. Similarly, populate chaining kr di hai jaha har ek owner ki bhi information ko apan populate kr rhe hai. Isse har listing ke reviews ki information ke saath hi us listing ke associated owner ko bhi information aayegi. aur yha nesting of populate ho rhi hai to populate the review owner name for each review. Object {path: 'reviews'} ka meaning hai ki ham apne reviews ko populate krna chah rhe hai apne listings ke saath(yaani listing mein saare reviews aa jaye). Aur uske baad wale populate ko nest kiya hai - har ek individual review ke liye ham chah rhe hai ki path mein author aa jaye. Har listing ke saath saare reviews to aa hi jaye, aur har review ke saath ham nested populate use kr rhe hai, yaani har ek review ke liye hamare pass uska author bhi aa jaye.
    if(!listing){
        req.flash('error', 'Listing not found.');
        res.redirect('/listings');//agr listing exist hi nhi kr rhi to show page mein jaane ka matlab hi nhi, isliye wapis main home page pr redirect kr rhe hai.
    }
    console.log(listing);
    res.render('listings/show.ejs', {listing});
};

module.exports.createListing = async (req,res,next)=>{
    // let response = await geocodingClient.forwardGeocode({
    //     query: req.body.listing.location, //apne listing object mein location field mein jo bhi fill krenge woh.
    //     limit: 1,
    // }).send();
    // console.log(response.body.features[0].geometry); //ab ye exact path pata kaise chal rha hai? -> pehle console.log(response) kiya, fir console.log(response.body.feautures), jisne features array return kri, fir apan ab geometry ko access kr rhe hai
    // res.send('done!');
    console.log('Request Body:', req.body);
    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url, '..', filename);
    const newListing = new Listing(req.body.listing);//instance bana diya Listing object ka.
    newListing.owner = req.user._id;//current user ki id ko newListing ke owner parameter mein store kara rhe hai.
    newListing.image = {url, filename};
    await newListing.save();
    // newListing.geometry = response.body.features[0].geometry; //ye value mapbox se aa rhi hai jisko apan store krwa rhe hai apne database mein.
    // let savedListing = await newListing.save();
    // console.log(savedListing);
    // console.log(listing);
    req.flash('success', 'New Listing Created!');
    res.redirect('/listings');
};

module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash('error', 'Listing not found.');
        res.redirect('/listings');//agr listing exist hi nhi kr rhi to show page mein jaane ka matlab hi nhi, isliye wapis main home page pr redirect kr rhe hai.
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace('/upload', '/upload/w_250'); //image preview ke liye jo ki edit form mein dikhega. Preview image ki quality reduce kr rhe hai width ko 250px set krke, by replacing '/upload url using .replace() method.
    res.render('listings/edit.ejs', {listing, originalImageUrl});
};

module.exports.updateListing = async (req,res)=>{ //to isOwner middleware ki conditions check hongi after isLoggedIn middleware. Agr owner hoga, tabhi current User changes kr payega listing mein.
    let {id} = req.params;
    // Isko bhi middleware.js mein daal diya:
    // //Authorization implement krne ke liye, in order to protect our edit and delete buttons from unauthorized access from hoppscotch etc. sites that can externally send api requests to manipualte the data, pehle we'll check ki wo jo id hai kya wo database mein exist krti hai ya nhi.
    // let listing = await Listing.findById(id);
    // if(!listing.owner._id.equals(res.locals.currUser._id)){//yaani agr listing ke owner ki id currUser ki id ke equal NAHI hai, to we'll flash an error.
    //     req.flash('error', 'You can only edit your own listings.');
    //     return res.redirect(`/listings/${id}`);
    // }
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});//deconstructing req.body.listing object to extrace its individual parameters, which we can pass in our new and updated value.
    if(typeof req.file !== 'undefined'){ //agr req object mein file aayegi(matlab agr koi upload krege edit form mein new image, tabhi ye conditions chalengi, nhi to url aur filename empty pass ho sakte hai(undefined) is condition ke bina).
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename}; //jo listing variable mein updated content stored hai, usmein fir jaisa createListing mein tarika follow kiya tha waise hi url, filename nikaalkr updated listing varibale mein daal diya image ke liye.
        await listing.save(); //ye krne ke baad firse apni listing ko db mein save kr lenge.
    }
    req.flash('success', 'Listing Updated!');
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req,res)=>{ //delete ho ya destroy ho, baat ek hi hai.
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash('success', 'Listing Deleted!');
    res.redirect('/listings');
};
