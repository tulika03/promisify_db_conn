let router = require('express').Router();
let bodyParser = require('body-parser');
router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true }));
let jwt = require('jsonwebtoken');
const secretKey = require('../config/app-config').secretKey;
const response = require('../utils/responseStatus');
const client = require("./redis-connect").client
router.use(async function (req, res, next) {
    // check header or url parameters or post parameters for token
    let token = req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        await client.connect();
        let tokensList = await client.sMembers("accessToken");
        console.log("token list is: ", tokensList);
        let tokenIndex = tokensList.findIndex(e => e == token);
        console.log("token index", tokenIndex);
        await client.quit();
        jwt.verify(token, secretKey, function (err, decoded) {
            if (err) {
                console.log(err)
                if (err.message == "jwt expired") {
                    return res.status(401).json({ error: 1, message: 'Token expired', code: "TEXP" });
                }
                return res.status(401).json({ error: 1, message: 'Failed to authenticate.', code: "UNAUTH" });
            }
            else if (tokenIndex > -1)
                return res.status(401).json({ error: 1, message: 'Failed to authenticate. blacklisted', code: "UNAUTH" });
            else
                req.decoded = decoded;
            next();
        
        });
     } else {
    // if there is no token
    // return an error
    return res.status(403).send({ success: 0, message: 'No token provided.' });
}
});


module.exports = router;