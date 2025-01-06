const Joi = require('joi');
module.exports.listingSchema = Joi.object({
    listing : Joi.object({
        title : Joi.string().required(),
        description : Joi.string().required(),
        location : Joi.string().required(),
        country : Joi.string().required(),
        price : Joi.number().required().min(0),//min(0) isliye use kiya jisse ki negative value na ho price ki.
        image : Joi.string().allow('', null) //yaani hamari image chahe to empty bhi ho sakti hai aur usmein null value bhi ham bhej sakte hai, kyuki mongoose hamara default value us image ke andar store kara hi dega at the end!
    }).required(), //Ye listing hamare schema ke according object honi chahiye aur required field hai. Jab bhi koi request aaye hamare pass to uske andar ek listing naam ki object hamare pass honi hi honi chahiye.
});

module.exports.reviewSchema = Joi.object({
    review : Joi.object({
        rating : Joi.number().required().min(1).max(5),
        comment : Joi.string().required(),
    }).required(),
});