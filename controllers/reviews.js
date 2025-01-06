const Listing = require('../models/listing');
const Review = require('../models/review');

module.exports.createReview = async(req,res) => {
    console.log(req.params.id);
    let listing = await Listing.findById(req.params.id); //kyuki Listing model ka use ho rha hai isliye usko bhi require kiya hai start mein.
    let newReview = new Review(req.body.review);
    // console.log(newReview);
    newReview.author = req.user._id;//jo logged-in user hai wahi hamare newReview ka author banega.

    listing.reviews.push(newReview);//ab listing ke schema mein apan ne reviews naam ki array bhi specify kri hai, to is reviews array ke andar apan push kr denge newReview ko.
    await newReview.save();
    await listing.save();//kyuki kisi exisiting document mein change krna hota hai to apan ko save() function use krna hota hai, jo ki khud ek asynchronous function hai and thus await keyword is used for that purpose.
    req.flash('success', 'New Review Created!');
    // console.log('New Review Saved.');
    // res.send('New Review Saved.');
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async(req,res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull : {reviews: reviewId}});//Listing ki array se un reviews ko delete krne ke liye.
    // Mongo Spull operator:
    // $pull: The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    // to yha ho kya rha hai? -> id yaani Listing id, aur Listing ke andar reviews array ke andar jo bhi reviewId match kr jaye, ham use pull yaani delete kr rhe hai. 
    await Review.findByIdAndDelete(reviewId);//review ko delete krne ke liye based on its id.
    req.flash('success', 'Review Deleted!');
    res.redirect(`/listings/${id}`);
};