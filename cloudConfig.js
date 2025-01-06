// file upload krne se pehle apne Cloudinary account to access krwana padega, usse related saari information ke liye we'll be using this file. 

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({//iski help se apan configuration details pass krte hai. Kisi ko config krna yaani cheezon ko jodna. Yha pr apan apne backend ko cloudinary se jodne ke liye necessay information pass kr rhe hai.
    cloud_name: process.env.CLOUD_NAME, //yha lhs mein yhi naam dene hai kyuki yehi by default configured hai.
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({ //defining storage, ye batane ke liye ki cloudinary mein kaha, kis folder mein store krna hai files ko.
    cloudinary: cloudinary,
    params: {
      folder: (req, file) => 'wanderlust_DEV',
      allowedFormats: ['png', 'jpg', 'jpeg'],
    },
});

module.exports = {
    cloudinary,
    storage, //in dono ko apan routes wali listing.js ke andar use krne wale hai.
};