const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment : String,
    rating : {
        type : Number,
        min : 1,
        max : 5,
    },
    createdAt : {
        type : Date,
        default : Date.now(), //yaani jab wo document create hua hai tabhi ki date uski set ho jayegi.
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User', //koi aisa user hoga jo logged-in hoga aur wahi hamara author banega, for writing a review. Here, only a registered user can provide review for a particular listing.
    },
});

module.exports = mongoose.model('Review', reviewSchema);

// yaha pr one to many relationship lag rhi hai, kyuki har listing ke saath bahut saare reviews associated ho sakte hai. millions of reviews to hone nhi wale, isliye har listing ke saath ek array associate kr denge (thousands of reviews ke liye).