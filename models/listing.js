const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review.js');

const listingSchema = new Schema({
    title:{
        type: String,
        required: true,
    },
    description: String,
    image:{
        // type: String,
        // set: (v)=> v === '' ? 'https://images.unsplash.com/photo-1509233725247-49e657c54213?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8NHx8fGVufDB8fHx8fA%3D%3D' : v, //tha ternary operator use hua hai, if ki condition ? True : False, where True and False are the actions to be performed if the specified condition becomes True or False, respectively. Yha ye bata rhe hai ki apan image ki ek default value 'default link' set kr denge agr hamne explicitly url iske argument mein provide nhi kiya ho to. Condition yhi hai ki '' yaani empty string di(no input for image), to aise mein 'default link' image ki set krdo, nhi to jo provide kri hai image ki link usko set kr do. Ye us condition ko handle krne ke liye use kra hai jab image to aa rhi hai, lekin image khaali hai. Agr image aa hi nhi rhi to? => we'll use default for that. Ye condition hamnein client yaani user ke liye frontend pr set kri hai.
        // default: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8NHx8fGVufDB8fHx8fA%3D%3D',//agr image undefined ho, ya null ho, ya exist hi na krti ho. 
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : 'Review',
        },
    ],
    owner : {
        type : Schema.Types.ObjectId,
        ref : 'User', //kyuki jab user exist krega, tabhi uska ek unique owner yha pr us listing mein aayega. It is a part of authorization process. 
    },
    // geometry: {
    //     type: {
    //         type: String,
    //         enum: ['Point'], //location.type must be Point
    //         required: true,
    //     },
    //     coordinates: {
    //         type: [Number],
    //         required: true,
    //     },
    // },
    // category: {
    //     type: String,
    //     enum: ['mountains', 'arctic', 'farms', 'deserts' ]
    // }
});

//Post mongoose middleware for our listing schema:
listingSchema.post('findOneAndDelete', async(listing) => {
    if(listing){
        await Review.deleteMany({_id : {$in: listing.reviews}});//yaani listing.reviews array ke andar jitne bhi reviews hai unki ek list bana lenge aur agr wo _id in list ki ids ka part hogi, to woh delete ho jayegi, yaani us _id wala pura ka pura review hamara delete ho jayega.
    }
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;