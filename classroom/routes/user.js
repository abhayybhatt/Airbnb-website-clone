const express = require('express');
const router = express.Router();

//User
//Index Route - users. Yha  common hai '/users' to usko sabhi se hata do.
router.get('/', (req,res)=>{
    res.send('GET for users.');
});

//Show - users
router.get('/:id', (req,res)=>{
    res.send('GET for user id.');
});

//POST - users
router.post('/', (req,res)=>{
    res.send('POST for users.');
});

//DELETE - users
router.delete('/:id', (req,res)=>{
    res.send('DELETE for user id.');
});

module.exports = router;