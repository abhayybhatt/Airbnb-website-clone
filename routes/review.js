const express = require('express');
const router = express.Router({mergeParams : true});
const wrapAsync = require('../utils/wrapAsync.js');
const Review = require('../models/review.js');
const Listing = require('../models/listing.js');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware.js');

const reviewController = require('../controllers/reviews.js');

//Post Review Route: Reviews ko hamesha listings ke saath hi access kiya jayega, isliye Reviews ke liye Index, Show route etc. banane ki need nhi hai, sirf relevant routes hi create krna hai. POST /listings/:id/reviews -> One to many relationship hai, har specific listing ki id ke through hi uske liye reviews rhenge, yeh route isliye design kiya gya hai is way mein. /reviews krke alag se bhi route design kr sakte hai pr usmein un lisitngs ki fir id extract krni padti.

// router.post('/listings/:id/reviews', validateReview, wrapAsync(async(req,res) => {//common part route ka nikaalna hota hai hamein router mein se, yha pr common part hai /listings/:id/reviews, to isko hata dena hai dono routes se. Aur is common part ko app.use path mein specify krte hai app.js ke.
router.post('/', isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//Delete Review Route:
router.delete('/:reviewId',isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;