const Listing = require('./models/listing');
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError.js');
const {listingSchema, reviewSchema} = require('./schema.js');

module.exports.isLoggedIn = (req,res,next) =>{ //kyuki yeh ek middleware hai.
    // console.log(req.user);//agr user loggedin hai, to iski kuch na kuch value rhegi as an object, tab sirf navbar mein logout ka option dikhayenge, lekin agr value undefined hai, to iska matlab user ya to registered hi nhi hai, ya login nhi kra usne, aur undefined value print hogi console mein, to aise mein Sign Up aur Log In dono options show krenge navbar mein.
    if(!req.isAuthenticated()){ //passport ki help se user ke current session ki information ko store krta hai, to login krne ke baad hi apan fir new listing create kr payenge, since login krne ke baad Authenticated ho jayega user.
        //saving redirectUrl(yaani originalUrl, when the user is not logged in and tries to access that page.)
        console.log(req.path, '..', req.originalUrl);//req.path(relative path) mein wo path hota hai jisko ham access krne ki koshish kr rhe hote hai (jaise add new listing pr click krne se req.path ki value hogi '/new'). whereas req.originalUrl (absolute path) mein complete url jo hai uski value stored rehti hai, jaise ki '/listings/new'
        // What do we want? -> Ham chah rhe hai ki agr koi login krne se pehle koise path mein jaa rha tha, to login page mein se login krne ke baad wo wapis usi path pr jaye jo ki originalUrl mein hai, once login is successful.
        req.session.redirectUrl = req.originalUrl;
        req.flash('error','You must be logged in to create a new listing!');
        return res.redirect('/login');
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;//agr koi req.session object mein redirectUrl save hua hai to usko redirectUrl naam ke local variable mein save kara lenge.
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let {id} = req.params;
    //Authorization implement krne ke liye, in order to protect our edit and delete buttons from unauthorized access from hoppscotch etc. sites that can externally send api requests to manipualte the data, pehle we'll check ki wo jo id hai kya wo database mein exist krti hai ya nhi.
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){//yaani agr listing ke owner ki id currUser ki id ke equal NAHI hai, to we'll flash an error.
        req.flash('error', 'You can only edit your own listings.');
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);//kya req.body un saari conditions ko define kr rhi hai jo hamne apne listingSchema mein define kr rhe the(schema.js mein).
    if(error){
        let errMsg = error.details.map((element) => element.message).join(',');//error ki saari details ko map kr rhe hai, by returning each individual element's message, aur saari error details comma se separate hokr join ho jayengi.
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);//kya req.body un saari conditions ko define kr rhi hai jo hamne apne reviewSchema mein define kr rhe the(schema.js mein).
    if(error){
        let errMsg = error.details.map((element) => element.message).join(',');//error ki saari details ko map kr rhe hai, by returning each individual element's message, aur saari error details comma se separate hokr join ho jayengi.
        // console.log(req.body);
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let {id, reviewId} = req.params;
    //Authorization implement krne ke liye, in order to protect our edit and delete buttons from unauthorized access from hoppscotch etc. sites that can externally send api requests to manipualte the data, pehle we'll check ki wo jo id hai kya wo database mein exist krti hai ya nhi.
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){//yaani agr listing ke owner ki id currUser ki id ke equal NAHI hai, to we'll flash an error.
        req.flash('error', 'You can only edit your own reviews.');
        return res.redirect(`/listings/${id}`);
    }
    next();
}