const router = require('express').Router();
let { check } = require('express-validator');
let loginController = require("../../controllers/loginController");

/**
 * @typedef Login
 * @property {string} username.required - username - eg: Tulika03
 * @property {string} password.required - password - eg: Lattice@123
 */

/**
 * @route post /login
 * @group Authorization
 * @param {Login.model} login.body.required
 * @returns {object} 200 - Logged in successfully
 * @returns {Error} 400 - Invalid Credentials
 * @returns {Error} 422 - Invalid or missing parameter
 * @returns {Error} 500 - Unable to process
 * @returns {Error} 504 - Database connection error
 */

router.post('/login', [check('username').notEmpty(), check('password').notEmpty().isLength({ min: 5, max: 50 })], loginController.userLogin);


/**
 * @typedef RefreshToken
 * @property {string} username.required - username - eg: rajendra@thelattice.in
 * @property {string} token.required - refresh token - eg: tIN21u6Il2rqxphNhSjhrdQaTvaVrsCZRxBDc36jJFz3Xjth16KwAMiZsq69ZufAqPAjUa0YH3J4LHdWUvb3THRDCGY2kk5NXDxMmHjXYT8cyK7Dbc60eeYGUzPlO26Fd8x71YikUuHS54N9bFCvxzAe5DKGEMJ5l5jd7M5NlvRp3MKhIdG2PBGQDsp4HftavIS9IyaGYtuLQfatxpg8RRgV4Gaqbq1e3vZov3rNsFjhu3MSaRb3WNEhG9wRt8Dw
 */

/**
 * @route post /newToken
 * @group Authorization
 * @param {RefreshToken.model} refresh_token.body.required
 * @returns {object} 200 - Logged in successfully
 * @returns {Error} 400 - Invalid Credentials
 * @returns {Error} 422 - Invalid or missing parameter
 * @returns {Error} 500 - Unable to process
 * @returns {Error} 504 - Database connection error
 */

 router.post('/newToken', [check('username').notEmpty(), check('token').notEmpty().isLength({ min: 5, max: 300 })], loginController.userToken);


module.exports = router;