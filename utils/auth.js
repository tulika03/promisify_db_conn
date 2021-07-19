let router = require('express').Router();
let bodyParser = require('body-parser');
router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true }));
let jwt  = require('jsonwebtoken');
const secretKey = require('../config/app-config').secretKey;
const response = require('../utils/responseStatus');

router.use(function(req, res, next) {
    // check header or url parameters or post parameters for token
    let token = req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, secretKey, function(err, decoded) {      
            if (err) {
                console.log(err)
                return res.status(401).json({ error:1 , message: 'Failed to authenticate.' });    
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;   
               
                next();
            }
        });
     } else {
        // if there is no token
        // return an error
        return res.status(403).send({ success: 0,message: 'No token provided.'});
    }
});


module.exports = router;