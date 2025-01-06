const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose'); //Passport-Local Mongoose is a Mongoose plugin that simplifies building username and password login with Passport.

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
});

// username aur password hamara passportLocalMongoose apne aap define kr dega: You're free to define your User how you like. Passport-Local Mongoosqwill add a username, hash and salt field to store the username, the hashed password and the salt value.

userSchema.plugin(passportLocalMongoose);//isliye use kiya kyuki yeh hamare liye username, hashing, salting aur hash password ko automatically implement kr deta hai.

module.exports = mongoose.model('User', userSchema);
