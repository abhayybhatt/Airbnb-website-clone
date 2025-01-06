const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
main()
.then(()=>{
    console.log('Connected to DB.');
}).catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async() => {
    await Listing.deleteMany({}); //cleaning any random data that is already present in out DB.
    initData.data = initData.data.map((obj)=> ({...obj, owner: '677522ff2fab39e625593f7b'})); //lets understand yha kya kiya: initData object ki jo data array hai, jiski help se apan ne apni listings ko initialize kiya hai, usi mein apan map() method apply kara hai. map method har ek data array ek individual object(listing) mein ek nayi property ko add kr dega. Usko add krne ke liye we are converting our each object 'obj' within the data array to a new object, jiske andar apne old object ki saari properties to aayengi hi(...obj), pr uske saath mein apan ek 'owner' property bhi define kr denge jiski _id value apan ne mongoDb database se uthakar users mein se yha add kri hai. Aur jo map() function hai ye existing array mein changes nhi krta ek naya array return krta hai, to usko apan same variable(initData.data) mein hi store kara rhe hai. Aisa krne se har ek single listing object ke andar owner property add ho jayegi.
    await Listing.insertMany(initData.data); //initData ek object hai aur uski key 'data' ko ham access kr rhe hai.
    console.log('data was initailized.');
}

initDB();